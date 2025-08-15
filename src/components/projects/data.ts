export type Project = {
  title: string;
  blurb: string;
  image?: string;          // /public path, e.g. "/projects/load-balancer.png"
  tags: string[];
  demo?: string;           // live link (optional)
  code?: string;           // repo link (optional)
};

export const PROJECTS: Project[] = [
  {
    title: "Space Hell",
    blurb:
      "A retro bullet hell game with customizable bullet patterns",
    image: "/bullet-hell.png",
    tags: ["C#", ".NET Framework/Core", "TextMeshPro", "RigidBody2D"],
    demo: "https://aliftheawesome86.itch.io/space-hell",
  },
  {
    title: "American Sign Language Translator",
    blurb:
      "A simple ASL translator that utilizes computer vision and Random Forest Classfier for baseline static hand gestures",
    image: "/ASL.png",
    tags: ["Golang", "React.js", "TailwindCSS", "WebSockets"],
    code: "https://github.com/coolguy-stack/American-Sign-Language-Translator",
    demo: "https://www.youtube.com/watch?v=6hGrukDzb3c",
  },
  {
    title: "ChatPBS - NAVBLUE Spring 2025 Hackathon",
    blurb:
      "An award-winning LLM application that uses reinforcement learning to optimize airline scheduling, achieving 87% accuracy in conflict resolution and serving 500+ concurrent queries.",
    image: "/pbs.png",
    tags: ["Python", "Flask", "React", "PostgreSQL", "PPO"],
  },
  {
    title: "Drone Rescue Mission",
    blurb:
      "A competitive island exploration command center that implements strategic pathfinding algorithms to navigate unknown terrain and discover points of interest in a serious game environment.",
    image: "/island.png",
    tags: ["Java", "Spring Boot", "Maven", "SonarQube", "Apache Commons CLI"],
    code: "https://github.com/coolguy-stack/a2-rescue-mission-team-207",
  },
  // add more…
];
