import type { NextApiRequest, NextApiResponse } from "next";

const TOKEN_URL  = "https://accounts.spotify.com/api/token";
const NOW_URL    = "https://api.spotify.com/v1/me/player/currently-playing";
const RECENT_URL = "https://api.spotify.com/v1/me/player/recently-played?limit=5";

// access-token cache
let tokenCache: { token: string; exp: number } | null = null;

// NEW: remember the last *live* track we observed while playing
let lastSeen: {
  track: any | null;
  seenAt: number;      // Date.now() when we observed it playing
} = { track: null, seenAt: 0 };

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
  if (!process.env.SPOTIFY_CLIENT_ID || !process.env.SPOTIFY_CLIENT_SECRET || !process.env.SPOTIFY_REFRESH_TOKEN) {
    throw new Error("Missing Spotify env vars");
  }
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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const access = await getAccessToken();

    // 1) Try "now playing"
    const nowRes = await fetch(NOW_URL, {
      headers: { Authorization: `Bearer ${access}`, "Cache-Control": "no-cache" },
      cache: "no-store",
    });

    // Helper: fetch & pick most recent by played_at
    const getMostRecent = async () => {
      const r = await fetch(RECENT_URL, {
        headers: { Authorization: `Bearer ${access}`, "Cache-Control": "no-cache" },
        cache: "no-store",
      });
      const data = await r.json();
      const items: any[] = Array.isArray(data?.items) ? data.items : [];
      items.sort(
        (a, b) =>
          new Date(b?.played_at || 0).getTime() - new Date(a?.played_at || 0).getTime()
      );
      return { track: items[0]?.track, played_at: items[0]?.played_at as string | undefined };
    };

    // If empty/error → use most recent
    if (nowRes.status === 204 || nowRes.status >= 400) {
      const { track, played_at } = await getMostRecent();

      // If recent is older than our last live observation, keep lastSeen
      const recentTs = played_at ? new Date(played_at).getTime() : 0;
      const chosen = (lastSeen.track && lastSeen.seenAt > recentTs) ? lastSeen.track : track;

      noCache(res);
      return res.status(200).json(
        chosen ? { ...shape(chosen, false, 0), playlist: null, source: "recent|seen", played_at } : { playing: false }
      );
    }

    const nowJson = await nowRes.json();
    const isPlaying = !!nowJson?.is_playing;

    // 2) If NOT playing → use most recent, but don't go backwards vs lastSeen
    if (!isPlaying) {
      const { track, played_at } = await getMostRecent();
      const recentTs = played_at ? new Date(played_at).getTime() : 0;
      const chosen = (lastSeen.track && lastSeen.seenAt > recentTs) ? lastSeen.track : track;

      noCache(res);
      return res.status(200).json(
        chosen ? { ...shape(chosen, false, 0), playlist: null, source: "recent|seen", played_at } : { playing: false }
      );
    }

    // 3) Playing: update lastSeen and (optionally) attach playlist context
    const currentTrack = nowJson?.item;
    if (currentTrack) {
      lastSeen.track = currentTrack;
      lastSeen.seenAt = Date.now();
    }

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

    noCache(res);
    return res.status(200).json({
      ...shape(currentTrack, true, nowJson?.progress_ms ?? 0),
      playlist,
      source: "now",
    });
  } catch {
    noCache(res);
    return res.status(200).json({ playing: false, source: "error" });
  }
}
