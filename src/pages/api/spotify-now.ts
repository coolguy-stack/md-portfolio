import type { NextApiRequest, NextApiResponse } from "next";

const TOKEN_URL  = "https://accounts.spotify.com/api/token";
const NOW_URL    = "https://api.spotify.com/v1/me/player/currently-playing";
const RECENT_URL = "https://api.spotify.com/v1/me/player/recently-played";

let tokenCache: { token: string; exp: number } | null = null;

function noCache(res: NextApiResponse) {
  res.setHeader("Cache-Control", "no-store, no-cache, max-age=0, must-revalidate, s-maxage=0");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.setHeader("CDN-Cache-Control", "no-store");
  res.setHeader("Vercel-CDN-Cache-Control", "no-store");
  res.setHeader("Surrogate-Control", "no-store");
  res.setHeader("ETag", Math.random().toString(36).slice(2));
}

async function getAccessToken(): Promise<string> {
  if (!process.env.SPOTIFY_CLIENT_ID || !process.env.SPOTIFY_CLIENT_SECRET || !process.env.SPOTIFY_REFRESH_TOKEN)
    throw new Error("Missing Spotify env vars");

  const now = Date.now();
  if (tokenCache && now < tokenCache.exp - 10_000) return tokenCache.token;

  const basic = Buffer.from(
    `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
  ).toString("base64");

  const resp = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { Authorization: `Basic ${basic}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: process.env.SPOTIFY_REFRESH_TOKEN!,
    }),
    cache: "no-store",
  });
  const json = await resp.json();
  if (!resp.ok) throw new Error(json?.error || "token_error");

  tokenCache = { token: json.access_token, exp: Date.now() + json.expires_in * 1000 };
  return tokenCache.token;
}

function shape(t: any, playing: boolean, progress_ms = 0) {
  return {
    playing,
    id: t?.id,
    title: t?.name,
    artist: t?.artists?.map((a: any) => a.name).join(", "),
    url: t?.external_urls?.spotify,
    cover: t?.album?.images?.[0]?.url,
    duration_ms: t?.duration_ms,
    progress_ms,
    preview_url: t?.preview_url ?? null,
  };
}

// Fetch recent items, optionally only those AFTER minTs
async function getMostRecent(access: string, minTs?: number) {
  const qs = new URLSearchParams({ limit: "10" });
  if (minTs && Number.isFinite(minTs)) qs.set("after", String(minTs)); // Spotify 'after' is ms since epoch

  const r = await fetch(`${RECENT_URL}?${qs.toString()}`, {
    headers: { Authorization: `Bearer ${access}`, "Cache-Control": "no-cache" },
    cache: "no-store",
  });
  const data = await r.json();
  const items: any[] = Array.isArray(data?.items) ? data.items : [];

  // If 'after' returns nothing (or no minTs), we still want the latest known
  if (!items.length) {
    const r2 = await fetch(`${RECENT_URL}?limit=10`, {
      headers: { Authorization: `Bearer ${access}`, "Cache-Control": "no-cache" },
      cache: "no-store",
    });
    const d2 = await r2.json();
    const items2: any[] = Array.isArray(d2?.items) ? d2.items : [];
    items2.sort((a, b) => +new Date(b?.played_at || 0) - +new Date(a?.played_at || 0));
    return { track: items2[0]?.track, played_at: items2[0]?.played_at, stale: true };
  }

  items.sort((a, b) => +new Date(b?.played_at || 0) - +new Date(a?.played_at || 0));
  return { track: items[0]?.track, played_at: items[0]?.played_at, stale: false };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  noCache(res);
  try {
    const access = await getAccessToken();
    const minTs = Number(req.query.min || 0);

    // 1) Try now playing
    const nowRes = await fetch(NOW_URL, {
      headers: { Authorization: `Bearer ${access}`, "Cache-Control": "no-cache" },
      cache: "no-store",
    });

    // If empty/error → use most recent newer than minTs (if any)
    if (nowRes.status === 204 || nowRes.status >= 400) {
      const { track, played_at, stale } = await getMostRecent(access, minTs);
      return res.status(200).json(
        track
          ? { ...shape(track, false, 0), playlist: null, source: stale ? "recent(stale)" : "recent", played_at }
          : { playing: false, source: "recent_empty" }
      );
    }

    const nowJson = await nowRes.json();
    const isPlaying = !!nowJson?.is_playing;

    if (!isPlaying) {
      const { track, played_at, stale } = await getMostRecent(access, minTs);
      return res.status(200).json(
        track
          ? { ...shape(track, false, 0), playlist: null, source: stale ? "recent(stale)" : "recent", played_at }
          : { playing: false, source: "recent_empty" }
      );
    }

    // Playing: return live track; include playlist context if desired
    const currentTrack = nowJson?.item;

    let playlist: { id?: string; name?: string; cover?: string; url?: string } | null = null;
    const ctxUri: string | undefined = nowJson?.context?.uri;

    if (ctxUri?.startsWith("spotify:playlist:")) {
      const pid = ctxUri.split(":").pop();
      if (pid) {
        const pRes = await fetch(`https://api.spotify.com/v1/playlists/${pid}`, {
          headers: { Authorization: `Bearer ${access}`, "Cache-Control": "no-cache" },
          cache: "no-store",
        });
        if (pRes.ok) {
          const p = await pRes.json();
          playlist = {
            id: pid,
            name: p?.name,
            cover: p?.images?.[0]?.url ?? null,
            url: p?.external_urls?.spotify,
          };
        }
      }
    }

    return res.status(200).json({
      ...shape(currentTrack, true, nowJson?.progress_ms ?? 0),
      playlist,
      source: "now",
      // when playing, you can also pass a synthetic "played_at" for the client to store if you want:
      played_at: new Date().toISOString(),
    });
  } catch {
    return res.status(200).json({ playing: false, source: "error" });
  }
}
