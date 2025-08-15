"use client";

import { PropsWithChildren } from "react";
import { motion, Variants } from "framer-motion";
import { ElementType } from "react";


type SectionProps = PropsWithChildren<{
  id?: string;
  className?: string;
  as?: ElementType;
  delay?: number;
}>;

const variants: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i, ease: "easeOut" },
  }),
};

export default function Section({
  id,
  className = "",
  as: Tag = "section",
  children,
  delay = 0,
}: SectionProps) {
  return (
    <motion.section
      id={id}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      custom={delay}
      variants={variants}
      className={`w-full max-w-6xl mx-auto px-6 ${className}`}
      aria-labelledby={id ? `${id}-heading` : undefined}
    >
      <Tag>{children}</Tag>
    </motion.section>
  );
}
