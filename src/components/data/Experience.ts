export type ExperienceItem = {
  company: string;
  title: string;
  date: string;
  location: string;
  description: string;
  tech: string[];
  icon: string; // emoji or an icon key
};

export const experiences: ExperienceItem[] = [
  {
    company: "McMaster AI Society",
    title: "Machine Learning Engineer — Deepfake Detection",
    date: "Sep 2025 – Present",
    location: "Hamilton, ON",
    description:
      "Building a deepfake image detector using a CNN + ViT ensemble. Set up a PyTorch training pipeline (timm ViTs, mixed precision, strong augmentations), built evaluation (ROC-AUC/PR, TPR@FPR), and tracked experiments with W&B. Created OpenCV-based data curation and inference tooling and exposed a FastAPI service for demo and integration.",
    tech: ["PyTorch", "timm (ViT)", "Weights & Biases", "OpenCV", "FastAPI"],
    icon: "/mac-ai.jpg",
  },
  {
  company: "McMaster RoboSub",
  title: "Software Developer — Perception & Controls",
  date: "Sept 2025 – Present",
  location: "Hamilton, ON",
  description:
    "Building C++/ROS 2 nodes for our AUV: sensor drivers and real-time control loops, OpenCV-based target detection, and EKF sensor fusion (IMU/DVL/pressure) with on-robot testing and Gazebo/Ignition simulation.",
  tech: ["C++17", "ROS 2", "OpenCV", "Eigen", "PCL"],
  icon: "/robosub.jpg",
  },
  {
    company: "NAVBLUE an Airbus Company",
    title: "Software Engineer Intern",
    date: "May 2024 – Aug 2025",
    location: "Waterloo, ON",
    description: "Optimized mission-critical flight operations APIs serving over 50,000 daily requests, achieving a 45% performance improvement that directly impacted 200+ airline customers worldwide. Architected database migration strategies for production environments handling 2M+ flight records and built comprehensive testing frameworks that reduced production bugs by 60%. Led crisis response for a Tier-1 customer, identifying and resolving an AWS RDS connection pooling issue within 8 hours, preventing $500K+ in potential revenue loss.",
    tech: ["C#", ".NET Core", "AWS", "Python", "SQL", "Redis", "SageMaker"],
    icon: "/nav2.jpg",
  },
  {
    company: "Google Developer Student Clubs",
    title: "Web Development Lead",
    date: "Sep 2023 – Present",
    location: "Hamilton, ON",
    description:
      "Spearheaded the technical development of a full-stack MERN portal and hackathon platform that grew active user base from 150 to over 800 students—a 430% increase in just 6 months. Through strategic performance optimizations, reduced page load times by 55%, resulting in significantly higher user engagement metrics. Launched a gamified learning platform that achieved 300+ positive reviews and 85% first-month retention, leading to adoption by three other GDSC chapters across universities.",
    tech: ["MongoDB", "Typescript", "Node.js", "NextJs", "Google Analytics"],
    icon: "/gdsc.png",
  },
  {
    company: "DeltaHacks",
    title: "Technical Events Executive",
    date: "July 2023 – Present",
    location: "Hamilton, ON",
    description: "Led 8-person team organizing Canada's largest student hackathon with 1,200+ participants from 40+ universities, securing $50K+ in corporate sponsorships. Coordinated event logistics, mentor recruitment, and strategic partnerships while overseeing technical infrastructure. Implemented optimized registration systems that increased hacker applications by 50%, establishing DeltaHacks as a premier hackathon destination.",
    tech: ["MongoDB", "Express", "React", "Node.js", "Python", "Flask"],
    icon: "/dh.png",
  },
];
