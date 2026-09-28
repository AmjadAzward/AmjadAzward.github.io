import {
  Braces,
  Cloud,
  Code2,
  Database,
  Figma,
  GitBranch,
  Globe2,
  Laptop,
  LineChart,
  Network,
  PanelsTopLeft,
  Smartphone,
  Sparkles,
  Terminal,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import certification01 from "../../certifications/01.png?url";
import certification02 from "../../certifications/02.png?url";
import certification03 from "../../certifications/03.png?url";
import certification04 from "../../certifications/04.png?url";
import certification05 from "../../certifications/05.png?url";
import certification06 from "../../certifications/06.png?url";
import certification07 from "../../certifications/07.png?url";
import certification08 from "../../certifications/08.png?url";
import certification09 from "../../certifications/09.jpg?url";
import project01 from "../../projects/01.png?url";
import project02 from "../../projects/02.png?url";
import project03 from "../../projects/03.png?url";
import project04 from "../../projects/04.png?url";
import project05 from "../../projects/05.png?url";
import project06 from "../../projects/06.png?url";
import project07 from "../../projects/07.png?url";
import project08 from "../../projects/08.jpg?url";
import project09 from "../../projects/09.jpg?url";

export type NavItem = {
  label: string;
  to: "/" | "/about" | "/skills" | "/certifications" | "/services" | "/portfolio" | "/contact";
};
export type Social = { label: string; href: string };
export type Skill = { name: string; description: string; level: number; icon: LucideIcon };

export const navItems: NavItem[] = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Skills", to: "/skills" },
  { label: "Certifications", to: "/certifications" },
  { label: "Services", to: "/services" },
  { label: "Portfolio", to: "/portfolio" },
  { label: "Contact", to: "/contact" },
];
export const socials: Social[] = [
  { label: "LinkedIn", href: "https://www.linkedin.com/in/amjadazward" },
  { label: "GitHub", href: "https://github.com/AmjadAzward" },
  {
    label: "Facebook",
    href: "https://www.facebook.com/people/Amjad-Azward/pfbid0p75bKuomqfx8QvpRjKN4XQdVfdhoTByrqZcwuYqXtgCLPanQz2LR6Mc1e5zBLmo1l/",
  },
  { label: "X", href: "https://x.com/AmjadAzward" },
  { label: "Instagram", href: "https://www.instagram.com/amjadazward/" },
];
export const stats = [
  { value: 30, suffix: "+", label: "Projects Built" },
  { value: 160, suffix: "+", label: "Certifications" },
  { value: 3.87, suffix: "", label: "CGPA" },
  { value: 3, suffix: "", label: "Roles Held" },
];
export const education = [
  {
    title: "BSc (Hons) Computer Science with Data Science",
    place: "NIBM · Coventry University, BSc Year 03 · Sri Lanka",
    date: "Nov 2023 - Present",
  },
  { title: "G.C.E Advanced Level · Math Stream", place: "Royal College, Colombo 07", date: "2022" },
];
export const experience = [
  {
    title: "Freelancer - Software Developer",
    place: "Spark Solutions",
    date: "Mar 2025 - Present",
  },
  { title: "IT Intern", place: "FitsExpress Pvt Ltd", date: "Nov 2025 - Present" },
  {
    title: "Remote Intern, AI Enabled Software Engineer",
    place: "SoftwarePlus Pvt Ltd",
    date: "Nov 2025 - Jan 2026",
  },
];
const descriptions: Record<string, string> = {
  OOP: "Modular software grounded in reusable abstractions.",
  SDLC: "Structured delivery from discovery to deployment.",
  "Design Patterns": "Proven architectures for maintainable systems.",
  Java: "Robust applications and object-oriented systems.",
  C: "Low-level fundamentals and efficient programs.",
  "C#": "Desktop and service-oriented applications.",
  Python: "Data, automation, and machine learning workflows.",
  JavaScript: "Interactive experiences across the modern web.",
  PHP: "Practical server-rendered web applications.",
  SQL: "Reliable relational queries and data modeling.",
  "PL/SQL": "Oracle procedures and database logic.",
  R: "Statistical computing and data exploration.",
  HTML: "Semantic, accessible interface foundations.",
  CSS: "Responsive, polished visual systems.",
  React: "Component-led product interfaces.",
  "Node.js": "APIs and event-driven backend services.",
  "REST APIs": "Clear, dependable system integrations.",
  AWS: "Cloud-native services and deployment basics.",
  MySQL: "Relational schema and query design.",
  Oracle: "Enterprise database foundations.",
  SQLite: "Portable application data storage.",
  MongoDB: "Flexible document-oriented data models.",
  Firebase: "Realtime apps, auth, and managed services.",
  Postman: "API testing and collaborative documentation.",
  Git: "Version control and team workflows.",
  "VS Code": "Efficient cross-stack development.",
  IntelliJ: "Professional JVM development tooling.",
  "Android Studio": "Native Android application development.",
  "Project Management": "Planning, coordination, and delivery ownership.",
  "ML Basics": "Model training, evaluation, and iteration.",
  PowerBI: "Business intelligence and visual reporting.",
  Figma: "Interface design and rapid prototyping.",
  "Apache Hop": "Visual data orchestration and pipelines.",
};
const iconFor = (name: string): LucideIcon =>
  name.includes("SQL") || ["Oracle", "MySQL", "SQLite", "MongoDB"].includes(name)
    ? Database
    : name.includes("AWS") || name === "Firebase"
      ? Cloud
      : name.includes("Studio") || name === "VS Code" || name === "IntelliJ"
        ? Wrench
        : name === "Figma"
          ? Figma
          : ["HTML", "CSS", "React"].includes(name)
            ? PanelsTopLeft
            : ["PowerBI", "R"].includes(name)
              ? LineChart
              : ["REST APIs", "Postman", "Apache Hop"].includes(name)
                ? Network
                : ["JavaScript", "PHP", "Node.js"].includes(name)
                  ? Globe2
                  : ["Java", "C", "C#", "Python"].includes(name)
                    ? Terminal
                    : Code2;
const group = (names: string[], start = 95): Skill[] =>
  names.map((name, i) => ({
    name,
    description: descriptions[name] ?? "Practical tools for thoughtful product development.",
    level: Math.max(74, start - (i % 6) * 3),
    icon: iconFor(name),
  }));
export const skillGroups = [
  {
    title: "Languages & Concepts",
    items: group([
      "OOP",
      "SDLC",
      "Design Patterns",
      "Java",
      "C",
      "C#",
      "Python",
      "JavaScript",
      "PHP",
      "SQL",
      "PL/SQL",
      "R",
    ]),
  },
  { title: "Web & Backend", items: group(["HTML", "CSS", "React", "Node.js", "REST APIs"], 94) },
  {
    title: "Databases, Cloud & Tools",
    items: group(
      [
        "AWS",
        "MySQL",
        "Oracle",
        "SQLite",
        "MongoDB",
        "Firebase",
        "Postman",
        "Git",
        "VS Code",
        "IntelliJ",
        "Android Studio",
      ],
      91,
    ),
  },
  {
    title: "Other",
    items: group(["Project Management", "ML Basics", "PowerBI", "Figma", "Apache Hop"], 88),
  },
];
const certificationImages = [
  certification01,
  certification02,
  certification03,
  certification04,
  certification05,
  certification06,
  certification07,
  certification08,
  certification09,
];
export const certifications = [
  "AI/ML Engineer Stage 2|SLIIT",
  "Software Engineer Certificate|HackerRank",
  "DevNet Associate|Cisco",
  "LFS158: Intro to Kubernetes|Linux Foundation",
  "IT Essentials|Cisco",
  "Oracle Certified Foundations Associate|Oracle",
  "Oracle Certified Generative AI Professional|Oracle",
  "SQL Advanced|HackerRank",
  "R Intermediate|HackerRank",
].map((x, i) => {
  const [title, issuer] = x.split("|");
  return {
    title,
    issuer,
    year: "2025",
    image: certificationImages[i],
    verify: "https://www.linkedin.com/in/amjadazward",
  };
});
export const services = [
  {
    title: "Mobile App Development",
    desc: "Purpose-built mobile experiences from concept to release.",
    tags: ["Android Studio", "React Native", "Firebase"],
    icon: Smartphone,
  },
  {
    title: "Web Development",
    desc: "Fast, accessible products for the modern web.",
    tags: ["React.js", "Node.js"],
    icon: Globe2,
  },
  {
    title: "Desktop Applications",
    desc: "Reliable tools designed around real workflows.",
    tags: ["C#", "Java", "Electron"],
    icon: Laptop,
  },
  {
    title: "AI & Machine Learning",
    desc: "Applied models that turn data into useful outcomes.",
    tags: ["Python", "TensorFlow"],
    icon: Sparkles,
  },
  {
    title: "IoT & Robotics",
    desc: "Connected prototypes bridging software and hardware.",
    tags: ["Embedded Systems", "Sensors"],
    icon: Network,
  },
  {
    title: "Data Analytics",
    desc: "Clear reporting that supports better decisions.",
    tags: ["Power BI", "SQL"],
    icon: LineChart,
  },
];
export const projects = [
  ["Mind Map Builder", "Productivity", "A visual workspace for structuring and connecting ideas."],
  ["Complaint ChainLK", "Civic Tech", "A transparent workflow for citizen complaint resolution."],
  ["Detectify", "Computer Vision", "YOLOv5 object detection for practical visual intelligence."],
  ["MedSynora", "Data Engineering", "A healthcare data warehouse for connected clinical insight."],
  ["Tuition Hub", "Mobile", "An Android experience for managing learning communities."],
  [
    "Car Rent Management System",
    "Software",
    "End-to-end fleet, booking, and customer administration.",
  ],
  ["SPICE WORLD", "Business App", "Wholesale operations software for a growing spice business."],
  [
    "Online Recipe Collection System",
    "Web",
    "A searchable community library for recipes and cooks.",
  ],
  ["Urban Food", "E-commerce", "A streamlined storefront and ordering experience."],
].map((p, i) => ({
  title: p[0],
  tag: p[1],
  desc: p[2],
  image: [
    project01,
    project02,
    project03,
    project04,
    project05,
    project06,
    project07,
    project08,
    project09,
  ][i],
  github: "https://github.com/AmjadAzward",
}));
