// src/components/Hero.tsx
"use client";

import Section from "@/components/ui/Section";
import { motion } from "framer-motion";
import { FiGithub, FiLinkedin, FiMail, FiFileText } from "react-icons/fi";
import HeroLottie from "@/components/animations/HeroLottie";

function IconBtn({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  const external = href.startsWith("http");
  return (
    <a
      href={href}
      aria-label={label}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      className="group relative inline-flex h-9 w-9 items-center justify-center
                 rounded-md border border-white/30 text-white/80
                 hover:bg-white/10 hover:text-white transition-colors"
    >
      {children}
      <span className="sr-only">{label}</span>
    </a>
  );
}

export default function Hero() {

  return (
    <Section id="hero" className="relative min-h-[100svh] lg:min-h-screen flex items-center justify-center overflow-hidden">
      {/* BACKGROUND LAYER: responsive Lottie behind everything */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-0">
        {/* 
          The box below keeps the animation as a responsive square:
          - On phones: size ≈ 86vmin (fits portrait)
          - On larger screens: it can grow up to 1100px
        */}
        <div className="w-[min(86vmin,1100px)] h-[min(86vmin,1100px)] sm:w-[min(80vmin,1100px)] sm:h-[min(80vmin,1100px)]">
          <HeroLottie
            src="/animations/PixelBurst.lottie"
            speed={0.5}
            className="w-full h-full"   // fill the responsive box
          />
        </div>
      </div>

      {/* FOREGROUND: title & buttons */}
      <div className="relative z-10 flex flex-col items-center text-center">
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="font-extrabold tracking-tight text-5xl sm:text-7xl md:text-8xl leading-[0.9] text-white"
        >
          Md Nafieu Hossain Alif
        </motion.h1>

        <div className="mt-6 h-[2px] w-16 rounded-full bg-white/20" />

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="mt-6 max-w-2xl text-base sm:text-lg text-zinc-300"
        >
          Software Engineer specializing in building robust, scalable applications with modern web technologies.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="mt-8 flex items-center gap-3"
        >
          <IconBtn href="https://github.com/coolguy-stack" label="GitHub"><FiGithub /></IconBtn>
          <IconBtn href="https://www.linkedin.com/in/alifhossain86/" label="LinkedIn"><FiLinkedin /></IconBtn>
          <IconBtn href="mailto:nafieu.alif@gmail.com" label="Email"><FiMail /></IconBtn>
          <IconBtn href="/md-resume.pdf" label="Resume"><FiFileText /></IconBtn>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute inset-x-0 bottom-10 flex justify-center z-20">
        <a href="#about" aria-label="Scroll to About">
          <motion.div className="relative h-9 w-5 rounded-full border border-white/30" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            <motion.span
              className="absolute left-1/2 top-2 block h-2 w-1 rounded-full bg-white/80"
              style={{ translateX: "-50%" }}
              animate={{ y: [0, 8, 0], opacity: [0.9, 0.2, 0.9] }}
              transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }}
            />
          </motion.div>
        </a>
      </div>
    </Section>
  );
}
