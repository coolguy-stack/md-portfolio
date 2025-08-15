// src/components/sections/Hobbies.tsx
"use client";

import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

/** Run once when the row enters the viewport (works on phones too). */
function useInViewOnce(threshold = 0.35, rootMargin = "0px 0px -10% 0px") {
  const ref = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          obs.unobserve(el); // only animate once
        }
      },
      { threshold, rootMargin }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold, rootMargin]);

  return { ref, inView };
}

type Hobby = { name: string; value: number; icon?: string; color: string };

const left: Hobby[] = [
  { name: "Gym / Rock Climbing / Hiking", value: 80, icon: "🏋️", color: "#ef4444" }, // red-500
  { name: "Basketball / MMA",             value: 70, icon: "🏀", color: "#f97316" }, // orange-500
  { name: "AI Model Training / 2D Games", value: 85, icon: "🤖", color: "#06b6d4" }, // cyan-500
  { name: "Reading (Fiction)",            value: 60, icon: "📚", color: "#eab308" }, // yellow-500
];

const right: Hobby[] = [
  { name: "Side Projects / Hackathons", value: 90, icon: "💻", color: "#3b82f6" }, // blue-500
  { name: "Gaming",                     value: 75, icon: "🎮", color: "#84cc16" }, // lime-500
  { name: "Music / Drums",              value: 70, icon: "🎵", color: "#a855f7" }, // purple-500
  { name: "Cooking",                    value: 60, icon: "🍳", color: "#f43f5e" }, // rose-500
];

function Row({ name, value, icon, color }: Hobby & { index?: number }) {
  const { ref, inView } = useInViewOnce();

  return (
    <div ref={ref} className="space-y-2">
      <div className="flex items-baseline justify-between">
        <p className="font-medium text-white">
          {icon && <span className="mr-2">{icon}</span>}
          {name}
        </p>
        <span className="text-sm text-white/70">{value}%</span>
      </div>

      {/* Track */}
      <div className="h-2 rounded-full bg-white/10 overflow-hidden" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100} aria-label={name}>
        {/* Animated fill */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: inView ? `${value}%` : 0 }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          className="h-full"
          style={{ backgroundColor: color }}
        />
      </div>
    </div>
  );
}

export default function Hobbies() {
  return (
    <Section id="hobbies" className="py-20">
      <SectionHeading id="hobbies-heading">Interests</SectionHeading>

      <p className="mt-3 mb-12 text-center max-w-3xl mx-auto text-white/80">
        A progress tracker into my life outside of school and work.
      </p>

      <div className="mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-6">
            {left.map((h, i) => (
              <Row key={h.name} {...h} index={i} />
            ))}
          </div>
          <div className="space-y-6">
            {right.map((h, i) => (
              <Row key={h.name} {...h} index={i} />
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}
