"use client";

import { motion } from "framer-motion";
import Tag from "@/components/ui/Tag";

type Props = {
  icon: string;
  title: string;
  company: string;
  date: string;
  location: string;
  description: string;
  tech: string[];
  alignLeft: boolean;
};

export default function TimelineCard({
  icon,
  title,
  company,
  date,
  location,
  description,
  tech,
  alignLeft,
}: Props) {
  return (
    <li
      role="listitem"
      className={`relative mb-16 flex flex-col sm:flex-row ${
        alignLeft ? "sm:items-center" : "sm:items-center sm:flex-row-reverse"
      }`}
    >
      {/* Dot on the spine (left on mobile, centered on md+) */}
      <div
        className="flex items-center justify-center
                   absolute left-1 md:left-1/2 md:-translate-x-1/2
                   top-1/2 -translate-y-1/2
                   w-10 h-10 rounded-full bg-zinc-900 ring-2 ring-white z-20 shadow"
        aria-hidden="true"
      >
       <img 
          src={icon} 
          alt={`${company} logo`}
          className="w-6 h-6 object-contain select-none"
      />
      </div>

      {/* Card container */}
      <div className={`relative sm:w-1/2 px-4 pl-16 ${alignLeft ? "md:pl-0 sm:pr-12 sm:text-left" : "sm:pl-12"}`}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.02 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-bg-[#0b0b0b] p-6 rounded-lg shadow-lg border-2 border-zinc-800"
        >
          <h3 className="text-lg font-bold">{title}</h3>
          <p className="font-medium text-zinc-300">{company}</p>
          <p className="text-sm text-zinc-400">
            {date} • {location}
          </p>
          <p className="text-sm mt-3 text-zinc-200 leading-6">{description}</p>

          <div
            className={`flex flex-wrap gap-2 mt-4 ${
              alignLeft ? "justify-end" : "justify-start"
            }`}
            aria-label="Technologies used"
          >
            {tech.map((t) => (
              <Tag key={t}>{t}</Tag>
            ))}
          </div>
        </motion.div>
      </div>
    </li>
  );
}
