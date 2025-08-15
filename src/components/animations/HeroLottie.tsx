"use client";

import * as React from "react";

type Props = {
  src?: string;
  /** You can pass number (px) or any CSS length (e.g. "80vmin", "100%" ) */
  width?: number | string;
  /** You can pass number (px) or any CSS length (e.g. "80vmin", "100%" ) */
  height?: number | string;
  autoplay?: boolean;
  loop?: boolean;
  /** Playback rate; 1 = normal */
  speed?: number;
  /** Apply responsive sizing via Tailwind/CSS (e.g., "w-full h-full") */
  className?: string;
} & Omit<React.HTMLAttributes<HTMLElement>, "className">;

export default function HeroLottie({
  src = "/animations/hero.lottie",
  autoplay = true,
  loop = true,
  width,
  height,
  speed = 1,
  className,
  style,
  ...rest
}: Props) {
  const elRef = React.useRef<HTMLElement | null>(null);

  // Define web component on client
  React.useEffect(() => {
    import("@dotlottie/player-component");
  }, []);

  // Apply speed when ready and when it changes
  React.useEffect(() => {
    const el = elRef.current as any;
    if (!el) return;

    const apply = () => {
      try {
        if (typeof el.setSpeed === "function") el.setSpeed(speed);
        else el.speed = speed;
      } catch {}
    };

    const onReady = () => apply();
    el.addEventListener?.("ready", onReady);
    el.addEventListener?.("load", onReady);

    // Try immediately and once more (in case it's already initialized)
    apply();
    const t = setTimeout(apply, 120);

    return () => {
      clearTimeout(t);
      el.removeEventListener?.("ready", onReady);
      el.removeEventListener?.("load", onReady);
    };
  }, [speed]);

  // Build style (respect width/height if provided; otherwise let CSS/className control sizing)
  const styleOut: React.CSSProperties = { ...(style || {}) };
  const toCss = (v?: number | string) =>
    typeof v === "number" ? `${v}px` : v;

  if (width !== undefined) styleOut.width = toCss(width);
  if (height !== undefined) styleOut.height = toCss(height);

  return React.createElement("dotlottie-player" as any, {
    ref: (node: any) => (elRef.current = node),
    src,
    autoplay,
    loop,
    speed, // harmless if not supported; we also set via API above
    background: "transparent",
    class: className, // pass React className to custom element
    style: styleOut,
    ...rest,
  });
}
