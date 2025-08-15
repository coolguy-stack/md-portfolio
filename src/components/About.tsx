"use client";

import Image from "next/image";
import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";

export default function About() {
  return (
    <Section id="about" className="py-14 sm:py-44" delay={0.05}>
      <SectionHeading id="about-heading">About Me</SectionHeading>

      <p className="text-center max-w-2xl mx-auto text-zinc-600 dark:text-zinc-300 leading-7">
        I&apos;m a Software Engineering student at McMaster University who gets way too excited 
        about turning coffee into code ☕ When I&apos;m not crafting 2D games in Unity 
        (because apparently I enjoy digital chaos 👹), you&apos;ll find me organizing hackathons 
        and pretending I know what I&apos;m doing (spoiler: it usually works out pretty well 😉).
      </p>

      <div className="mt-10 flex flex-col md:flex-row gap-10 items-center md:items-start">
        <Image
          src="/profile.JPG"
          alt="Portrait of Md Nafieu Hossain Alif"
          width={300}
          height={300}
          className="rounded-xl object-cover"
          priority
        />

        <div className="flex flex-col gap-8 text-sm md:text-base w-full">
          {/* Education */}
          <section aria-labelledby="edu-heading">
            <h3 id="edu-heading" className="text-2xl font-bold mb-2">
              Education
            </h3>
            <p className="font-semibold">McMaster University</p>
            <p>Bachelor of Software Engineering CO-OP</p>
            <p>Expected May 2027</p>
            <p className="text-zinc-500 dark:text-zinc-400 mt-2 leading-7">
              Relevant Coursework: Data Structures &amp; Algorithms, Database Systems, 
              Software Architecture, Operating Systems
            </p>
          </section>

          {/* Technical Expertise */}
          <section aria-labelledby="tech-heading">
            <h3 id="tech-heading" className="text-2xl font-bold mb-4">
              Technical Arsenal
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p className="font-semibold mb-1">🗣️ Languages</p>
                <p className="text-zinc-700 dark:text-zinc-300">
                  C#, Python, Java, JavaScript/TypeScript, SQL, C/C++
                </p>
              </div>
              <div>
                <p className="font-semibold mb-1">🏗️ Frameworks</p>
                <p className="text-zinc-700 dark:text-zinc-300">
                  .NET Core, React, Flask, Spring Boot, TensorFlow, PyTorch
                </p>
              </div>
              <div>
                <p className="font-semibold mb-1">🤖 ML/AI</p>
                <p className="text-zinc-700 dark:text-zinc-300">
                  PPO, DQN, OpenCV, MediaPipe, Llama-2-70B, OpenAI Gym
                </p>
              </div>
              <div>
                <p className="font-semibold mb-1">☁️ Cloud & Databases</p>
                <p className="text-zinc-700 dark:text-zinc-300">
                  AWS, Azure, Docker, PostgreSQL, MySQL, MongoDB, Redis
                </p>
              </div>
              <div>
                <p className="font-semibold mb-1">🛠️ Tools</p>
                <p className="text-zinc-700 dark:text-zinc-300">
                  Git, VS Code, TensorBoard, JetBrains Tools, Jira
                </p>
              </div>
              <div>
                <p className="font-semibold mb-1">🎮 Game Dev</p>
                <p className="text-zinc-700 dark:text-zinc-300">
                  Unity, C# Scripting, 2D Physics, Particle Systems, Object Pooling
                </p>
              </div>
            </div>
          </section>          
        </div>
      </div>
    </Section>
  );
}