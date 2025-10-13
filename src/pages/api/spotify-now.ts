import type { NextApiRequest, NextApiResponse } from "next";

const TOKEN_URL = "https://accounts.spotify.com/api/token";
const NOW_URL   = "https://api.spotify.com/v1/me/player/currently-playing";
const TRACK_URL = "https://api.spotify.com/v1/tracks";

let tokenCache: { token: string; exp: number } | null = null;

function noCache(res: NextApiResponse) {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0, s-maxage=0");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.setHeader("CDN-Cache-Control", "no-store");
  res.setHeader("Vercel-CDN-Cache-Control", "no-store");
}

async function getAccessToken(): Promise<string> {
  const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN } = process.env;
  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET || !SPOTIFY_REFRESH_TOKEN)
    throw new Error("Missing Spotify env vars");

  const now = Date.now();
  if (tokenCache && now < tokenCache.exp - 10_000) return tokenCache.token;

  const basic = Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString("base64");
  const r = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { Authorization: `Basic ${basic}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: SPOTIFY_REFRESH_TOKEN }),
    cache: "no-store",
  });
  const j = await r.json();
  if (!r.ok) throw new Error(j?.error || "token_error");

  tokenCache = { token: j.access_token, exp: Date.now() + j.expires_in * 1000 };
  return tokenCache.token;
}

const shape = (t: any, playing: boolean, progress_ms = 0) => ({
  playing,
  id: t?.id,
  title: t?.name,
  artist: t?.artists?.map((a: any) => a.name).join(", "),
  url: t?.external_urls?.spotify,
  cover: t?.album?.images?.[0]?.url,
  duration_ms: t?.duration_ms,
  progress_ms,
  preview_url: t?.preview_url ?? null,
});

async function getFallbackTrack(access: string) {
  const id = process.env.SPOTIFY_FALLBACK_TRACK_ID || ""; // or hardcode here if you prefer
  if (!id) return null;
  const r = await fetch(`${TRACK_URL}/${id}`, {
    headers: { Authorization: `Bearer ${access}`, "Cache-Control": "no-cache" },
    cache: "no-store",
  });
  if (!r.ok) return null;
  return r.json();
}

export default async function handler(_req: NextApiRequest, res: NextApiResponse) {
  noCache(res);
  try {
    const access = await getAccessToken();

    // Try Now Playing
    const nowRes = await fetch(NOW_URL, {
      headers: { Authorization: `Bearer ${access}`, "Cache-Control": "no-cache" },
      cache: "no-store",
    });

    if (nowRes.ok && nowRes.status !== 204) {
      const nowJson = await nowRes.json();
      if (nowJson?.is_playing && nowJson?.item) {
        return res.status(200).json({
          ...shape(nowJson.item, true, nowJson?.progress_ms ?? 0),
          playlist: null,
          source: "now",
        });
      }
    }

    // Not playing (or 204/error): return the default track
    const fav = await getFallbackTrack(access);
    if (fav) {
      return res
        .status(200)
        .json({ ...shape(fav, false, 0), playlist: null, source: "fallback" });
    }

    return res.status(200).json({ playing: false, source: "fallback_empty" });
  } catch {
    // Last-ditch: try to still return default
    try {
      const access = await getAccessToken();
      const fav = await getFallbackTrack(access);
      if (fav) {
        return res
          .status(200)
          .json({ ...shape(fav, false, 0), playlist: null, source: "fallback_error" });
      }
    } catch {}
    return res.status(200).json({ playing: false, source: "error" });
  }
}
