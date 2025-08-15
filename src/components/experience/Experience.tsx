"use client";

import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import TimelineCard from "@/components/experience/TimelineCard";
import { experiences } from "@/components/data/Experience";

export default function Experience() {
  return (
    <Section id="experience" className="py-16 sm:py-20 relative" delay={0.1}>
      <SectionHeading id="experience-heading">Work Experience</SectionHeading>

      <div className="relative max-w-6xl mx-auto">
        {/* Spine: LEFT on mobile, CENTER on md+ */}
        <div
          aria-hidden="true"
          className="
            absolute top-0 bottom-0
            left-6 md:left-1/2 md:-translate-x-1/2
            w-[2px] bg-white z-10
          "
        />

        <ol role="list" className="relative">
          {experiences.map((exp, index) => (
            <TimelineCard
              key={exp.company + index}
              alignLeft={index % 2 === 0}
              {...exp}
            />
          ))}
        </ol>
      </div>
    </Section>
  );
}
