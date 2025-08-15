"use client";

import type { Project } from "./data";
import { FiExternalLink, FiGithub } from "react-icons/fi";
import { motion } from "framer-motion";

export default function ProjectCard({
  project,
  featured,
}: {
  project: Project;
  featured?: boolean;
}) {
  return (
    <motion.div
      className={[
        "group rounded-xl border bg-[#0b0b0b] border-white/10 overflow-hidden",
        "transition-colors duration-300",
        featured ? "scale-[1.02]" : "scale-95 opacity-70",
      ].join(" ")}
      whileHover={{
        y: -10, // bounce up
        boxShadow: "0 18px 48px rgba(0,0,0,0.5)",
      }}
      transition={{ type: "spring", stiffness: 420, damping: 22, mass: 0.5 }}
    >
      {/* image */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-white/5">
        {project.image ? (
          <img
            src={project.image}
            alt={`${project.title} preview`}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover
                       transform-gpu transition-transform duration-500
                       group-hover:scale-105"  // ← zoom on hover
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center text-white/40 text-sm">
            (no preview)
          </div>
        )}
        {/* optional soft highlight at the bottom on hover */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </div>

      {/* content */}
      <div className="p-5 md:p-6">
        <h3 className="text-lg md:text-xl font-bold text-white">{project.title}</h3>
        <p className="mt-2 text-sm text-white/75 leading-relaxed">{project.blurb}</p>

        {/* tags */}
        <div className="mt-4 flex flex-wrap gap-2">
          {project.tags.map((t) => (
            <span
              key={t}
              className="text-xs px-2 py-1 rounded-full bg-white/10 text-white/75"
            >
              {t}
            </span>
          ))}
        </div>

        {/* actions */}
        {(project.demo || project.code) && (
          <div className="mt-5 flex gap-3">
            {project.demo && (
              <a
                href={project.demo}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-md border border-white/20 px-3 py-1.5 text-sm text-white/90 hover:bg-white/10"
              >
                Live Demo <FiExternalLink />
              </a>
            )}
            {project.code && (
              <a
                href={project.code}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-md border border-white/20 px-3 py-1.5 text-sm text-white/90 hover:bg-white/10"
              >
                Code <FiGithub />
              </a>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
