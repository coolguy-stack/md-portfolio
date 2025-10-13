"use client";
import { useEffect, useMemo, useState } from "react";

type Now = {
  playing: boolean;
  id?: string;
  title?: string;
  artist?: string;
  url?: string;
  cover?: string;
  progress_ms?: number;
  duration_ms?: number;
  preview_url?: string | null;
  playlist?: { id?: string; name?: string; cover?: string; url?: string } | null;
};

function msToTime(ms = 0) {
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function SpotifyNowCard() {
  const [data, setData] = useState<Now | null>(null);
  const [showPlayer, setShowPlayer] = useState(false);

    useEffect(() => {
    const load = () =>
        fetch(`/api/spotify-now?t=${Date.now()}`, { cache: "no-store" })
        .then(r => r.json())
        .then(setData)
        .catch(() => {});
    load();
    const id = setInterval(load, 15000); // 15s polling
    return () => clearInterval(id);
    }, []);



  const pct = useMemo(() => {
    if (!data?.duration_ms) return 0;
    return Math.min(
      100,
      Math.max(0, Math.round(((data.progress_ms ?? 0) / data.duration_ms) * 100)),
    );
  }, [data]);

  if (!data) return null;

  const heading = data.playing ? "Now Playing on Spotify" : "Recently Played on Spotify";
  const spotifyGreen = "#1DB954";
  const trackId = data.id ?? (data.url?.match(/track\/([A-Za-z0-9]+)/)?.[1] ?? "");

  return (
    <div className="w-full flex justify-center">
      <div
        className="max-w-3xl w-full rounded-2xl border p-5 sm:p-6"
        style={{
          borderColor: "rgba(255,255,255,0.08)",
          background: "linear-gradient(145deg, rgba(18,18,18,0.85), rgba(0,0,0,0.7))",
          boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
        }}
      >
        {/* header */}
        <div className="mb-4 flex items-center justify-center gap-2">
          <svg width="18" height="18" viewBox="0 0 24 24" className="opacity-90" fill={spotifyGreen}>
            <path d="M12 0C5.373 0 0 5.373 0 12c0 6.629 5.373 12 12 12s12-5.371 12-12C24 5.373 18.627 0 12 0zm5.531 17.344a.935.935 0 0 1-1.285.312c-3.516-2.148-7.945-2.633-13.153-1.457A.934.934 0 0 1 2.71 14.7c5.627-1.285 10.488-.742 14.332 1.566.449.266.594.85.289 1.078zm1.77-3.957a1.171 1.171 0 0 1-1.617.39c-4.023-2.469-10.16-3.191-14.93-1.758a1.17 1.17 0 1 1-.664-2.25c5.324-1.574 12.027-.77 16.625 2.004.543.332.715 1.043.586 1.614zm.168-4.117c-4.602-2.73-12.25-2.984-16.652-1.645a1.4 1.4 0 0 1-.808-2.676c5.145-1.555 13.625-1.246 18.93 1.91a1.4 1.4 0 0 1-1.47 2.41z" />
          </svg>
          <div className="text-sm font-semibold" style={{ color: spotifyGreen }}>
            {heading}
          </div>
        </div>

        {/* body */}
        <div className="flex items-center gap-4 sm:gap-6">
          {/* COVER + PLAYLIST BADGE (positioned correctly) */}
          {data.cover && (
            <div className="relative">
              <img
                src={data.cover}
                alt=""
                className="h-44 w-44 sm:h-36 sm:w-36 md:h-40 md:w-40 rounded-lg shadow-lg object-cover"
              />

              {data.playlist?.cover && (
                <a
                  href={data.playlist.url ?? "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="absolute -bottom-2 -right-2 h-12 w-12 rounded-lg ring-2 ring-black/60 overflow-hidden shadow-md hover:scale-[1.02] transition z-10"
                  title={data.playlist.name || "Playlist"}
                >
                  <img src={data.playlist.cover} alt="" className="h-full w-full object-cover" />
                </a>
              )}
            </div>
          )}

          {/* RIGHT SIDE */}
          <div className="min-w-0 flex-1">
            <div className="text-lg sm:text-xl font-semibold text-white truncate">{data.title}</div>
            <div className="text-sm text-white/70 truncate">{data.artist}</div>

            {/* show playlist name even if no cover */}
            {data.playlist?.name && (
              <div className="mt-1 text-xs text-white/60 truncate">
                from{" "}
                <a
                  href={data.playlist.url ?? "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="underline decoration-white/30 hover:text-white"
                  title={data.playlist.name}
                >
                  {data.playlist.name}
                </a>
              </div>
            )}

            {/* progress (only meaningful when duration known) */}
            {data.duration_ms ? (
              <div className="mt-3">
                <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full"
                    style={{ width: `${pct}%`, backgroundColor: spotifyGreen }}
                  />
                </div>
                <div className="mt-1 flex justify-between text-[11px] text-white/60">
                  <span>{msToTime(data.progress_ms ?? 0)}</span>
                  <span>{msToTime(data.duration_ms)}</span>
                </div>
              </div>
            ) : null}

            {/* actions */}
            <div className="mt-4 flex flex-wrap items-center gap-3">
              {data.url && (
                <a
                  href={data.url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-md border px-3 py-1.5 text-sm"
                  style={{ borderColor: "rgba(255,255,255,0.18)", color: "white" }}
                >
                  Open in Spotify
                </a>
              )}

              {trackId && (
                <button
                  onClick={() => setShowPlayer((v) => !v)}
                  className="rounded-md px-3 py-1.5 text-sm font-medium"
                  style={{ background: spotifyGreen, color: "#0b0b0b" }}
                >
                  {showPlayer ? "Hide Player" : "Play Here"}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* embedded player */}
        {showPlayer && trackId && (
          <div className="mt-5">
            <iframe
              title="Spotify Player"
              className="w-full rounded-xl"
              style={{ border: 0, height: 152 }}
              src={`https://open.spotify.com/embed/track/${trackId}?utm_source=generator&theme=0`}
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
            />
          </div>
        )}
      </div>
    </div>
  );
}
