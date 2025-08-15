"use client";

import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import { useState } from "react";
import { PROJECTS } from "./data";
import ProjectCard from "./ProjectCard";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { motion, AnimatePresence, type Transition } from "framer-motion";

// tuple must be typed (or 'as const')
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const TRANS: Transition = {
  duration: 0.5,
  ease: EASE,
};

const wrap = (i: number, len: number) => (i % len + len) % len;

const sideVariants = {
  enter: (dir: 1 | -1) => ({ x: dir === 1 ? 40 : -40, opacity: 0, scale: 0.93 }),
  center: { x: 0, opacity: 0.6, scale: 0.95 },
  exit:  (dir: 1 | -1) => ({ x: dir === 1 ? -40 : 40, opacity: 0, scale: 0.93 }),
};

const centerVariants = {
  enter: (dir: 1 | -1) => ({ x: dir === 1 ? 60 : -60, opacity: 0, scale: 0.96 }),
  center: { x: 0, opacity: 1, scale: 1 },
  exit:  (dir: 1 | -1) => ({ x: dir === 1 ? -60 : 60, opacity: 0, scale: 0.96 }),
};

export default function Projects() {
  const L = PROJECTS.length;
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);

  const prev = () => { setDir(-1); setIndex((i) => wrap(i - 1, L)); };
  const next = () => { setDir( 1); setIndex((i) => wrap(i + 1, L)); };
  const go   = (i: number) => { setDir(i > index ? 1 : -1); setIndex(wrap(i, L)); };

  const leftIdx  = wrap(index - 1, L);
  const rightIdx = wrap(index + 1, L);

  return (
    <Section id="projects" className="py-20">
      <SectionHeading id="projects-heading">Featured Projects</SectionHeading>
      <p className="mt-3 mb-10 text-center max-w-3xl mx-auto text-white/80">
        A selection of my recent work showcasing engineering, design, and problem-solving.
      </p>

      <div className="relative max-w-[1200px] mx-auto">
        {/* arrows */}
        <button
          onClick={prev}
          aria-label="Previous"
          className="absolute -left-3 sm:-left-8 top-1/2 -translate-y-1/2 z-10 grid h-10 w-10 place-items-center rounded-full border border-white/20 text-white/80 hover:bg-white/10"
        >
          <FiChevronLeft />
        </button>
        <button
          onClick={next}
          aria-label="Next"
          className="absolute -right-3 sm:-right-8 top-1/2 -translate-y-1/2 z-10 grid h-10 w-10 place-items-center rounded-full border border-white/20 text-white/80 hover:bg-white/10"
        >
          <FiChevronRight />
        </button>

        {/* Stage */}
        <div
          className="
            relative mx-auto flex items-center justify-center
            gap-0 md:gap-6 px-3 sm:px-0
            h-[520px] md:h-[560px] lg:h-[600px]
          "
        >
          <AnimatePresence initial={false} custom={dir} mode="popLayout">
            {/* left (hide on mobile) */}
            <motion.div
              key={`left-${leftIdx}`}
              custom={dir}
              variants={sideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={TRANS}
              className="hidden md:block w-[50%] lg:w-[35%] h-full transform-gpu will-change-transform"
            >
              <ProjectCard project={PROJECTS[leftIdx]} />
            </motion.div>

            {/* center (always visible) */}
            <motion.div
              key={`center-${index}`}
              custom={dir}
              variants={centerVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={TRANS}
              className="w-[88%] sm:w-[60%] lg:w-[70%] h-full transform-gpu will-change-transform"
            >
              <ProjectCard project={PROJECTS[index]} featured />
            </motion.div>

            {/* right (hide on mobile) */}
            <motion.div
              key={`right-${rightIdx}`}
              custom={dir}
              variants={sideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={TRANS}
              className="hidden md:block w-[50%] lg:w-[35%] h-full transform-gpu will-change-transform"
            >
              <ProjectCard project={PROJECTS[rightIdx]} />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* dots */}
        <div className="mt-6 flex justify-center gap-2">
          {PROJECTS.map((_, i) => (
            <button
              key={`dot-${i}`}
              onClick={() => go(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={[
                "h-2.5 w-2.5 rounded-full transition",
                i === index ? "bg-white" : "bg-white/30 hover:bg-white/60",
              ].join(" ")}
            />
          ))}
        </div>
      </div>
    </Section>
  );
}
