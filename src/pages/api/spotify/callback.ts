import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const code = req.query.code as string | undefined;
  if (!code) return res.status(400).json({ error: "missing code" });

  const basic = Buffer.from(
    `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
  ).toString("base64");

  const r = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      // must EXACTLY match what you saved in Spotify dashboard:
      redirect_uri: "https://mdnafieu.xyz/api/spotify/callback",
    }),
  });

  const data = await r.json();
  return res.status(200).json(data); // copy refresh_token from here
}
