"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Section from "@/components/ui/Section";
import HeroLottie from "@/components/animations/HeroLottie";

export default function Footer() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <footer className="relative">
      <Section id="farewell" className="relative overflow-hidden py-20 sm:py-28">

        
        {/* Background Lottie (client-only to avoid hydration issues) */}
        {mounted && (
          <div
            className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center"
            aria-hidden
            suppressHydrationWarning
          >
            <div
              className="
                /* portrait: taller, driven by viewport height */
                [@media(orientation:portrait)]:h-[120svh]
                [@media(orientation:portrait)]:w-auto

                /* landscape: wider, driven by viewport width */
                [@media(orientation:landscape)]:w-[min(95vw,1400px)]
                [@media(orientation:landscape)]:h-auto z-0

              "
            >
              <HeroLottie
                src="/animations/Farewell.lottie"   // put your file in /public/animations/
                loop
                autoplay
                speed={0.6}
                className="
                  block h-full w-auto
                  [@media(orientation:landscape)]:w-full
                  [@media(orientation:landscape)]:h-auto
                "
              />
            </div>
          </div>
        )}

        {/* Foreground content */}
        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white"
          >
            That&apos;s All Folks!
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 6 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.05 }}
            className="mt-4 text-white/80 leading-relaxed"
          >
            If anything here sparked an idea, or you wish to grab a coffee chat ☕, I’d love to hear from you.
          </motion.p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <a
              href="mailto:alifhossain86@gmail.com"
              className="rounded-md border border-white/20 px-4 py-2 text-sm text-white hover:bg-white/10"
            >
              Say hello
            </a>
            <a
              href="/md-resume.pdf"
              className="rounded-md border border-white/20 px-4 py-2 text-sm text-white/90 hover:bg-white/10"
            >
              Resume
            </a>
          </div>

          {/* tiny copyright (client-only to avoid any date hydration edge cases) */}
          {mounted && (
            <div className="mt-10 text-center text-xs text-white/40">
              © {new Date().getFullYear()} Md Nafieu Hossain Alif
            </div>
          )}
        </div>
      </Section>
    </footer>
  );
}
