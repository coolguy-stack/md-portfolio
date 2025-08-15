"use client";

import { useEffect, useState } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useAnimationFrame,
} from "framer-motion";

export default function Cursor() {
  // enable only on precise pointers (no touch)
  const [enabled, setEnabled] = useState(false);
  const [hovering, setHovering] = useState(false);

  // mouse target
  const mx = useMotionValue(-100);
  const my = useMotionValue(-100);

  // ring follows mouse with a spring (silky)
  const rx = useSpring(mx, { stiffness: 400, damping: 40, mass: 0.6 });
  const ry = useSpring(my, { stiffness: 400, damping: 40, mass: 0.6 });

  // inner "joystick" dot offset relative to ring center
  const ix = useMotionValue(0);
  const iy = useMotionValue(0);

  // constants you can tweak
  const SIZE = hovering ? 32 : 24;  // ring size (px) — same as before
  const MAX = 10;                   // max joystick offset (px)
  const K = 0.25;                   // responsiveness of inner dot

  // enable for fine pointers only
  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine)");
    const update = () => setEnabled(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);

  // track mouse pos (no React re-renders)
  useEffect(() => {
    if (!enabled) return;
    const move = (e: MouseEvent) => {
      mx.set(e.clientX);
      my.set(e.clientY);
    };
    window.addEventListener("mousemove", move, { passive: true });
    return () => window.removeEventListener("mousemove", move);
  }, [enabled, mx, my]);

  // enlarge on interactive elements — event delegation (handles dynamic nodes)
  useEffect(() => {
    if (!enabled) return;
    const sel = "a, button, [role='button'], input, textarea, select, summary";
    const onOver = (e: MouseEvent) => {
      const t = e.target as Element | null;
      if (t && t.closest(sel)) setHovering(true);
    };
    const onOut = (e: MouseEvent) => {
      const from = e.target as Element | null;
      const to = (e.relatedTarget as Element | null) || null;
      // only turn off when leaving the interactive subtree entirely
      if (from?.closest(sel) && !to?.closest(sel)) setHovering(false);
    };
    document.addEventListener("mouseover", onOver, true);
    document.addEventListener("mouseout", onOut, true);
    return () => {
      document.removeEventListener("mouseover", onOver, true);
      document.removeEventListener("mouseout", onOut, true);
    };
  }, [enabled]);

  // apply/remove body class only when enabled to avoid affecting Lottie/OS cursor
  useEffect(() => {
    if (enabled) {
      document.body.classList.add("has-custom-cursor");
      return () => document.body.classList.remove("has-custom-cursor");
    }
    // if disabled, ensure it’s removed
    document.body.classList.remove("has-custom-cursor");
  }, [enabled]);

  // joystick effect: inner dot offsets toward mouse direction,
  // clamped to MAX, with a little smoothing factor K
  useAnimationFrame(() => {
    const dx = mx.get() - rx.get();
    const dy = my.get() - ry.get();
    const nx = Math.max(-MAX, Math.min(MAX, dx * K));
    const ny = Math.max(-MAX, Math.min(MAX, dy * K));
    ix.set(nx);
    iy.set(ny);
  });

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[9999]"
      style={{
        translateX: rx,
        translateY: ry,
        display: enabled ? "block" : "none",
      }}
    >
      {/* ring container (centered on pointer) */}
      <div
        className="rounded-full border-2 border-white/80 shadow-[0_0_0_1px_rgba(0,0,0,0.35)] bg-transparent will-change-transform"
        style={{
          width: SIZE,
          height: SIZE,
          transform: "translate(-50%, -50%)",
        }}
      >
        {/* inner joystick dot */}
        <motion.div
          className="absolute left-1/2 top-1/2 w-1.5 h-1.5 rounded-full bg-white/90 will-change-transform"
          style={{
            translateX: ix, // joystick offset
            translateY: iy,
            marginLeft: -3, // half of 1.5*2 = 3px
            marginTop: -3,
          }}
        />
      </div>
    </motion.div>
  );
}
