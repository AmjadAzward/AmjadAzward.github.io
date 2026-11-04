import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Compass,
  Facebook,
  Footprints,
  Github,
  Instagram,
  Linkedin,
  LocateFixed,
  Map as MapIcon,
  MapPin,
  X,
} from "lucide-react";

import {
  certifications,
  education,
  experience,
  projects,
  services,
  skillGroups,
  socials,
  stats,
} from "@/data/portfolio";
import homePortrait from "../../../img/2-enhanced.jpg?url";

const InteractiveStudioCanvas = lazy(() => import("./interactive-studio-canvas"));

export type StudioZoneId =
  "about" | "skills" | "certifications" | "services" | "portfolio" | "contact";

export type StudioPosition = { x: number; z: number };

export type StudioInput = {
  x: number;
  z: number;
  target: { x: number; z: number } | null;
  spawn: { x: number; z: number } | null;
  locked: boolean;
};

type DisplayMode = "checking" | "3d" | "static";

const pathStops: Array<{
  id: StudioZoneId;
  number: string;
  short: string;
  eyebrow: string;
  title: string;
  description: string;
  target: { x: number; z: number };
  facts: string[];
}> = [
  {
    id: "about",
    number: "01",
    short: "About",
    eyebrow: "The starting point",
    title: "Who I am",
    description:
      "A third-year Computer Science undergraduate building useful systems across software, data, cloud, and machine learning.",
    target: { x: -4.8, z: 0.8 },
    facts: ["Colombo, Sri Lanka", "Software + data", "Open to collaboration"],
  },
  {
    id: "skills",
    number: "02",
    short: "Skills",
    eyebrow: "The engineering toolkit",
    title: "Tools for building",
    description:
      "Languages, frameworks, cloud platforms, databases, and product skills used to turn ideas into maintainable software.",
    target: { x: 4.6, z: -3.6 },
    facts: skillGroups.map((group) => group.title),
  },
  {
    id: "certifications",
    number: "03",
    short: "Credentials",
    eyebrow: "The learning archive",
    title: "Always learning",
    description:
      "Selected certifications across AI, software engineering, cloud, databases, networking, and modern infrastructure.",
    target: { x: -4.6, z: -8.9 },
    facts: certifications
      .slice(0, 3)
      .map((item) => item.issuer)
      .filter((issuer): issuer is string => Boolean(issuer)),
  },
  {
    id: "services",
    number: "04",
    short: "Services",
    eyebrow: "The build station",
    title: "Ways I can help",
    description:
      "Focused engineering support for web, mobile, desktop, AI, connected systems, and data-led product experiences.",
    target: { x: 4.9, z: -13.4 },
    facts: services.slice(0, 4).map((item) => item.title),
  },
  {
    id: "portfolio",
    number: "05",
    short: "Projects",
    eyebrow: "The project gallery",
    title: "Ideas made tangible",
    description:
      "A growing collection of practical products, intelligent systems, mobile experiences, and data-driven applications.",
    target: { x: -3.8, z: -18.8 },
    facts: projects
      .slice(0, 3)
      .map((item) => item.title)
      .filter((title): title is string => Boolean(title)),
  },
  {
    id: "contact",
    number: "06",
    short: "Contact",
    eyebrow: "The final waypoint",
    title: "Let's build something",
    description:
      "Have a product, system, or idea worth exploring? The trail ends with an open line for a thoughtful conversation.",
    target: { x: 3.8, z: -24 },
    facts: ["Project enquiries", "Freelance work", "Engineering opportunities"],
  },
];

export type ShowcaseSlide = {
  eyebrow: string;
  title: string;
  description: string;
  image?: string | undefined;
  imageAlt?: string;
  chips?: string[];
  metric?: string | undefined;
  action?: { label: string; href: string };
};

const showcaseSlides: Record<StudioZoneId, ShowcaseSlide[]> = {
  about: [
    {
      eyebrow: "PROFILE / AMJAD AZWARD",
      title: "Building where software meets intelligence.",
      description:
        "A third-year Computer Science undergraduate at NIBM, affiliated with Coventry University, freelancing as a software developer and gaining experience through AI-enabled engineering internships.",
      image: homePortrait,
      imageAlt: "Portrait of Amjad Azward",
      chips: [
        "Colombo, Sri Lanka",
        "Software engineering",
        "Data science",
        "Open to collaboration",
      ],
    },
    ...education.map((item, index) => ({
      eyebrow: `EDUCATION / ${String(index + 1).padStart(2, "0")}`,
      title: item.title,
      description: item.place,
      metric: item.date,
      chips: ["Academic foundation", "Continuous learning"],
    })),
    ...experience.map((item, index) => ({
      eyebrow: `EXPERIENCE / ${String(index + 1).padStart(2, "0")}`,
      title: item.title,
      description: item.place,
      metric: item.date,
      chips: ["Practical delivery", "Industry experience"],
    })),
    {
      eyebrow: "PROFILE / SELECTED NUMBERS",
      title: "Learning by building.",
      description:
        "A snapshot of practical work, continuous learning, academic progress, and experience.",
      chips: stats.map((stat) => `${stat.value}${stat.suffix} ${stat.label}`),
    },
  ],
  skills: skillGroups.map((group, index) => ({
    eyebrow: `SKILL DISCIPLINE / ${String(index + 1).padStart(2, "0")}`,
    title: group.title,
    description: `${group.items.length} capabilities used to design, build, test, and improve maintainable digital products.`,
    metric: `${group.items.length} skills`,
    chips: group.items.map((skill) => `${skill.name} ${skill.level}%`),
  })),
  certifications: certifications.map((item, index) => ({
    eyebrow: `CREDENTIAL / ${String(index + 1).padStart(2, "0")}`,
    title: item.title ?? "Professional credential",
    description: `Issued by ${item.issuer ?? "Professional learning provider"}.`,
    metric: item.year,
    image: item.image,
    imageAlt: `${item.title ?? "Certification"} certificate`,
    chips: [item.issuer ?? "Verified learning", item.year],
    action: { label: "Verify credential", href: item.verify },
  })),
  services: services.map((service, index) => ({
    eyebrow: `SERVICE / ${String(index + 1).padStart(2, "0")}`,
    title: service.title,
    description: service.desc,
    metric: "Available",
    chips: service.tags,
    action: { label: "Start a conversation", href: "mailto:amjadazward693@gmail.com" },
  })),
  portfolio: projects.map((project, index) => ({
    eyebrow: `PROJECT / ${String(index + 1).padStart(2, "0")}`,
    title: project.title ?? "Selected project",
    description: project.desc ?? "A practical digital product built around a real problem.",
    metric: project.tag,
    image: project.image,
    imageAlt: `Preview of ${project.title ?? "project"}`,
    chips: [project.tag ?? "Software project", "Designed and developed"],
    action: { label: "View source profile", href: project.github },
  })),
  contact: [
    {
      eyebrow: "CONTACT / OPEN CHANNEL",
      title: "Let's make something useful.",
      description:
        "For thoughtful products, engineering opportunities, freelance work, or ambitious ideas, send a message directly from the village.",
      chips: [
        "Project enquiries",
        "Freelance work",
        "Engineering opportunities",
        "Remote collaboration",
      ],
      action: { label: "Email Amjad", href: "mailto:amjadazward693@gmail.com" },
    },
    ...socials.map((social, index) => ({
      eyebrow: `SOCIAL CHANNEL / ${String(index + 1).padStart(2, "0")}`,
      title: social.label,
      description: `Continue the conversation with Amjad Azward on ${social.label}.`,
      metric: "Online",
      chips: ["Social profile", "Opens in a new tab"],
      action: { label: `Open ${social.label}`, href: social.href },
    })),
  ],
};

const WORLD_BOUNDS = { minX: -10.2, maxX: 10.2, northZ: 7.2, southZ: -28.5 };

function worldToMapPosition(position: StudioPosition) {
  return {
    left: 8 + ((position.x - WORLD_BOUNDS.minX) / (WORLD_BOUNDS.maxX - WORLD_BOUNDS.minX)) * 84,
    top:
      7 + ((WORLD_BOUNDS.northZ - position.z) / (WORLD_BOUNDS.northZ - WORLD_BOUNDS.southZ)) * 85,
  };
}

function mapTrailPoints(points: StudioPosition[]) {
  return points
    .map((point) => {
      const mapped = worldToMapPosition(point);
      return `${mapped.left.toFixed(2)},${mapped.top.toFixed(2)}`;
    })
    .join(" ");
}

const VILLAGE_TRAILS: Array<{ id: string; kind: "main" | "branch"; points: StudioPosition[] }> = [
  {
    id: "main",
    kind: "main",
    points: [
      { x: 0, z: 5 },
      { x: -3.1, z: 3.6 },
      { x: -4.8, z: 0.8 },
      { x: -5.6, z: -4.2 },
      { x: -4.6, z: -8.9 },
      { x: -5.2, z: -14.2 },
      { x: -3.8, z: -18.8 },
      { x: -1.2, z: -23.6 },
      { x: 3.8, z: -24 },
      { x: 5.8, z: -18.4 },
      { x: 4.9, z: -13.4 },
      { x: 5.6, z: -8.1 },
      { x: 4.6, z: -3.6 },
      { x: 3.2, z: 1.8 },
      { x: 0, z: 5 },
    ],
  },
  {
    id: "forest",
    kind: "branch",
    points: [
      { x: -4.8, z: 0.8 },
      { x: -7.2, z: -1.8 },
      { x: -7.4, z: -7.2 },
      { x: -6.4, z: -12.5 },
      { x: -4.6, z: -8.9 },
    ],
  },
  {
    id: "coast",
    kind: "branch",
    points: [
      { x: 4.6, z: -3.6 },
      { x: 7.1, z: -6.2 },
      { x: 7.3, z: -11.5 },
      { x: 7.1, z: -17.8 },
      { x: 5.9, z: -21.9 },
      { x: 3.8, z: -24 },
    ],
  },
  {
    id: "cross-north",
    kind: "branch",
    points: [
      { x: -4.8, z: 0.8 },
      { x: -1.7, z: -0.9 },
      { x: 1.5, z: -1.4 },
      { x: 4.6, z: -3.6 },
    ],
  },
  {
    id: "cross-center",
    kind: "branch",
    points: [
      { x: -4.6, z: -8.9 },
      { x: -1.8, z: -10.4 },
      { x: 1.9, z: -10.8 },
      { x: 4.9, z: -13.4 },
    ],
  },
  {
    id: "cross-south",
    kind: "branch",
    points: [
      { x: -3.8, z: -18.8 },
      { x: -0.8, z: -17.2 },
      { x: 2.1, z: -18.6 },
      { x: 3.8, z: -24 },
    ],
  },
  {
    id: "central",
    kind: "branch",
    points: [
      { x: 0, z: 5 },
      { x: 0.4, z: 1.2 },
      { x: -0.2, z: -4.3 },
      { x: 0.5, z: -9.8 },
      { x: 0, z: -15.3 },
      { x: -0.8, z: -17.2 },
    ],
  },
];

const MAP_TREES = Array.from({ length: 48 }, (_, index) => {
  const rightSide = index % 4 === 0;
  const row = Math.floor(index / 2);
  return {
    index,
    ...worldToMapPosition({
      x: rightSide ? 2.2 + (index % 4) * 1.12 : -2.1 - (index % 6) * 0.96,
      z: 4.6 - row * 1.36 + ((index * 7) % 5) * 0.24,
    }),
  };
}).filter((tree) => tree.index % 2 === 0);

const MAP_HILLS = [
  { x: -7.6, z: 2.4 },
  { x: -7.3, z: -13.8 },
  { x: -6.8, z: -22.7 },
  { x: 6.7, z: 1.2 },
  { x: 6.8, z: -9.4 },
  { x: 7.1, z: -21.4 },
].map(worldToMapPosition);

const SOCIAL_MAP_POSITION = worldToMapPosition({ x: 2.01, z: -25.55 });

const mapSocialIcons: Record<string, typeof Github> = {
  LinkedIn: Linkedin,
  GitHub: Github,
  Facebook,
  X,
  Instagram,
};

function useDarkMode() {
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    const root = document.documentElement;
    const update = () => setDarkMode(root.classList.contains("dark"));
    const observer = new MutationObserver(update);
    update();
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return darkMode;
}

function supportsWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      window.WebGLRenderingContext && (canvas.getContext("webgl2") || canvas.getContext("webgl")),
    );
  } catch {
    return false;
  }
}

function prefersLightweightScene() {
  const device = navigator as Navigator & {
    connection?: { saveData?: boolean; effectiveType?: string };
    deviceMemory?: number;
  };
  return (
    device.connection?.saveData === true ||
    device.connection?.effectiveType === "2g" ||
    (device.deviceMemory !== undefined && device.deviceMemory <= 2) ||
    navigator.hardwareConcurrency <= 2
  );
}

function StudioStaticFallback({ darkMode }: { darkMode: boolean }) {
  return (
    <div
      className={`studio-static-fallback path-static-fallback ${darkMode ? "is-evening" : "is-morning"}`}
      role="img"
      aria-label="A futuristic walking path with an engineer and miniature AI robot"
    >
      <span className="path-static-trail" aria-hidden />
      <span className="studio-static-character" aria-hidden>
        <i className="studio-static-head" />
        <i className="studio-static-body" />
        <i className="studio-static-legs" />
      </span>
      <span className="studio-static-robot" aria-hidden>
        <i />
      </span>
    </div>
  );
}

export default function InteractiveStudioHero() {
  const reducedMotion = useReducedMotion() ?? false;
  const darkMode = useDarkMode();
  const shellRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<StudioInput>({
    x: 0,
    z: 0,
    target: null,
    spawn: null,
    locked: false,
  });
  const explorerPositionRef = useRef<StudioPosition>({ x: 0, z: 5 });
  const [mode, setMode] = useState<DisplayMode>("checking");
  const [inView, setInView] = useState(true);
  const [activeZone, setActiveZone] = useState<StudioZoneId | null>(null);
  const [mapOpen, setMapOpen] = useState(false);
  const [journeyStarted, setJourneyStarted] = useState(false);
  const [showcase, setShowcase] = useState<{ section: StudioZoneId; slide: number } | null>(null);

  useEffect(() => {
    setMode(supportsWebGL() && !prefersLightweightScene() ? "3d" : "static");
  }, []);

  useEffect(() => {
    const element = shellRef.current;
    if (!element || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry?.isIntersecting ?? true),
      { rootMargin: "120px", threshold: 0.03 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const walkTo = (id: StudioZoneId) => {
    const destination = pathStops.find((item) => item.id === id);
    if (!destination) return;
    inputRef.current.target = destination.target;
    inputRef.current.x = 0;
    inputRef.current.z = 0;
    setJourneyStarted(true);
  };

  const spawnAt = (id: StudioZoneId) => {
    const destination = pathStops.find((item) => item.id === id);
    if (!destination) return;
    inputRef.current.spawn = destination.target;
    inputRef.current.target = null;
    inputRef.current.x = 0;
    inputRef.current.z = 0;
    setJourneyStarted(true);
    setMapOpen(false);
  };

  useEffect(() => {
    inputRef.current.locked = mapOpen || showcase !== null;
    if (!mapOpen && !showcase) return;
    const handleViewerKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMapOpen(false);
        setShowcase(null);
        return;
      }
      if (!showcase || (event.key !== "ArrowLeft" && event.key !== "ArrowRight")) return;
      event.preventDefault();
      const slides = showcaseSlides[showcase.section];
      const direction = event.key === "ArrowRight" ? 1 : -1;
      setShowcase((current) =>
        current
          ? {
              ...current,
              slide: (current.slide + direction + slides.length) % slides.length,
            }
          : current,
      );
    };
    window.addEventListener("keydown", handleViewerKey);
    return () => window.removeEventListener("keydown", handleViewerKey);
  }, [mapOpen, showcase]);

  useEffect(() => {
    const startOnMovement = (event: KeyboardEvent) => {
      if (
        [
          "KeyW",
          "KeyA",
          "KeyS",
          "KeyD",
          "ArrowUp",
          "ArrowDown",
          "ArrowLeft",
          "ArrowRight",
        ].includes(event.code)
      ) {
        setJourneyStarted(true);
      }
    };
    window.addEventListener("keydown", startOnMovement);
    return () => window.removeEventListener("keydown", startOnMovement);
  }, []);

  useEffect(() => {
    const handlePathNavigation = (event: Event) => {
      const id = (event as CustomEvent<string>).detail as StudioZoneId;
      const destination = pathStops.find((item) => item.id === id);
      if (!destination) return;
      inputRef.current.target = destination.target;
      inputRef.current.x = 0;
      inputRef.current.z = 0;
    };
    window.addEventListener("aa:path-stop", handlePathNavigation);
    return () => window.removeEventListener("aa:path-stop", handlePathNavigation);
  }, []);

  const setDirection = (x: number, z: number) => {
    setJourneyStarted(true);
    inputRef.current.x = x;
    inputRef.current.z = z;
    inputRef.current.target = null;
  };

  const clearDirection = () => {
    inputRef.current.x = 0;
    inputRef.current.z = 0;
  };

  const openShowcase = (section: StudioZoneId) => {
    inputRef.current.target = null;
    inputRef.current.x = 0;
    inputRef.current.z = 0;
    setShowcase({ section, slide: 0 });
  };

  const changeShowcaseSlide = (direction: -1 | 1) => {
    setShowcase((current) => {
      if (!current) return current;
      const slides = showcaseSlides[current.section];
      return {
        ...current,
        slide: (current.slide + direction + slides.length) % slides.length,
      };
    });
  };

  const stop = activeZone ? pathStops.find((item) => item.id === activeZone) : null;
  const activeShowcaseSlides = showcase ? showcaseSlides[showcase.section] : [];
  const activeShowcaseSlide = showcase ? activeShowcaseSlides[showcase.slide] : undefined;
  const activeShowcaseStop = showcase
    ? pathStops.find((item) => item.id === showcase.section)
    : undefined;
  const explorerMapPosition = worldToMapPosition(explorerPositionRef.current);
  const streamMapY = worldToMapPosition({ x: 0, z: -15.65 }).top;
  const overlookMapPosition = worldToMapPosition({ x: 7.15, z: -17.8 });

  return (
    <div
      ref={shellRef}
      className="interactive-studio path-experience"
      aria-label="Walkable portfolio path"
    >
      <div className="studio-viewport">
        {mode === "3d" ? (
          <Suspense fallback={<StudioStaticFallback darkMode={darkMode} />}>
            <InteractiveStudioCanvas
              darkMode={darkMode}
              reducedMotion={reducedMotion}
              inView={inView}
              inputRef={inputRef}
              explorerPositionRef={explorerPositionRef}
              onZoneChange={setActiveZone}
              showcase={showcase}
              showcaseSlide={activeShowcaseSlide ?? null}
              showcaseTotal={activeShowcaseSlides.length}
              onShowcasePrevious={() => changeShowcaseSlide(-1)}
              onShowcaseNext={() => changeShowcaseSlide(1)}
              onShowcaseClose={() => setShowcase(null)}
            />
          </Suspense>
        ) : (
          <StudioStaticFallback darkMode={darkMode} />
        )}
      </div>

      <button
        type="button"
        className="path-map-trigger"
        onClick={() => setMapOpen(true)}
        aria-label="Open trail map and fast travel"
      >
        <MapIcon aria-hidden />
        <span>Trail map</span>
      </button>

      {mapOpen ? (
        <div
          className="path-map-overlay"
          role="presentation"
          onPointerDown={() => setMapOpen(false)}
        >
          <section
            className="path-map-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="trail-map-title"
            onPointerDown={(event) => event.stopPropagation()}
          >
            <header>
              <div>
                <div className="path-map-kicker-row">
                  <p>VILLAGE MAP / LIVE POSITION</p>
                  <span className="path-map-village-state">
                    <i aria-hidden /> {darkMode ? "Evening village" : "Morning village"}
                  </span>
                </div>
                <h2 id="trail-map-title">Choose your next stop.</h2>
              </div>
              <button type="button" onClick={() => setMapOpen(false)} aria-label="Close trail map">
                <X aria-hidden />
              </button>
            </header>

            <div className={`path-map-canvas ${darkMode ? "is-evening" : "is-morning"}`}>
              <svg viewBox="0 0 100 100" aria-hidden>
                <defs>
                  <linearGradient id="map-sea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor={darkMode ? "#0a527c" : "#1d91bf"} />
                    <stop offset="1" stopColor={darkMode ? "#052c4d" : "#08618d"} />
                  </linearGradient>
                  <linearGradient id="map-land" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor={darkMode ? "#1e5a35" : "#4d914f"} />
                    <stop offset="1" stopColor={darkMode ? "#123f2a" : "#286b3c"} />
                  </linearGradient>
                  <linearGradient id="map-river" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0" stopColor={darkMode ? "#0a4c73" : "#218db9"} />
                    <stop offset="0.5" stopColor={darkMode ? "#1477a4" : "#55b8d5"} />
                    <stop offset="1" stopColor={darkMode ? "#0a4c73" : "#218db9"} />
                  </linearGradient>
                  <filter id="map-marker-glow" x="-100%" y="-100%" width="300%" height="300%">
                    <feGaussianBlur stdDeviation="1.6" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                <rect width="100" height="100" rx="8" fill="url(#map-sea)" />
                <path
                  d="M10 8 C24 3 42 5 56 4 C76 3 88 8 91 22 C94 37 91 52 93 66 C95 80 87 92 72 95 C53 98 40 93 23 95 C10 96 5 87 8 73 C11 59 6 49 8 35 C10 23 5 14 10 8Z"
                  fill="url(#map-land)"
                  stroke={darkMode ? "#4c8b55" : "#83bc72"}
                  strokeWidth="1.4"
                />
                <path
                  d={`M8 ${streamMapY.toFixed(2)} C27 ${(streamMapY - 2).toFixed(2)} 35 ${(streamMapY + 2).toFixed(2)} 50 ${streamMapY.toFixed(2)} C65 ${(streamMapY - 2).toFixed(2)} 74 ${(streamMapY + 2).toFixed(2)} 93 ${streamMapY.toFixed(2)}`}
                  fill="none"
                  stroke="url(#map-river)"
                  strokeLinecap="round"
                  strokeWidth="4.2"
                />
                {VILLAGE_TRAILS.map((trail) => (
                  <polyline
                    key={trail.id}
                    className={`map-village-trail map-village-trail-${trail.kind}`}
                    points={mapTrailPoints(trail.points)}
                  />
                ))}

                <g className="map-village-bridge" transform={`translate(50 ${streamMapY})`}>
                  <rect x="-5" y="-2.6" width="10" height="5.2" rx="0.8" />
                  {[-3.6, -1.8, 0, 1.8, 3.6].map((x) => (
                    <line key={x} x1={x} y1="-2.3" x2={x} y2="2.3" />
                  ))}
                </g>

                {MAP_HILLS.map((hill, index) => (
                  <g
                    key={`map-hill-${index}`}
                    className="map-village-hill"
                    transform={`translate(${hill.left} ${hill.top})`}
                  >
                    <path d="M-2.6 1.8 L0 -2.4 L2.6 1.8 Z" />
                    <path d="M-1.1 1.8 L1 -1.1 L3 1.8 Z" />
                  </g>
                ))}

                {MAP_TREES.map((tree) => (
                  <g
                    key={`map-tree-${tree.index}`}
                    className="map-village-tree"
                    transform={`translate(${tree.left} ${tree.top})`}
                  >
                    <rect x="-0.24" y="0.4" width="0.48" height="1" rx="0.14" />
                    <circle r={0.9 + (tree.index % 3) * 0.12} />
                  </g>
                ))}

                {pathStops.map((item, index) => {
                  const building = worldToMapPosition({
                    x: item.target.x + (index % 2 === 0 ? -1 : 1) * 1.9,
                    z: item.target.z,
                  });
                  return (
                    <g
                      key={`map-building-${item.id}`}
                      className="map-village-building"
                      transform={`translate(${building.left} ${building.top})`}
                    >
                      <rect x="-1.4" y="-1" width="2.8" height="2.2" rx="0.3" />
                      <path d="M-1.7 -1 L0 -2.1 L1.7 -1 Z" />
                    </g>
                  );
                })}

                <g
                  className="map-village-overlook"
                  transform={`translate(${overlookMapPosition.left} ${overlookMapPosition.top})`}
                >
                  <circle r="2.1" />
                  <path d="M-1.4 0 H1.4 M0 -1.4 V1.4" />
                </g>
              </svg>

              {pathStops.map((item) => (
                <button
                  key={`map-${item.id}`}
                  type="button"
                  className={item.id === activeZone ? "is-current" : undefined}
                  style={{
                    left: `${worldToMapPosition(item.target).left}%`,
                    top: `${worldToMapPosition(item.target).top}%`,
                  }}
                  onClick={() => spawnAt(item.id)}
                  aria-label={`Fast travel to ${item.short}`}
                >
                  <span>
                    <i>{item.number}</i>
                  </span>
                  <strong>{item.short}</strong>
                </button>
              ))}

              <span
                className="path-map-you"
                style={{
                  left: `${explorerMapPosition.left}%`,
                  top: `${explorerMapPosition.top}%`,
                }}
                role="img"
                aria-label="Your current position"
              >
                <i>
                  <LocateFixed aria-hidden />
                </i>
                <strong>You are here</strong>
              </span>

              <div
                className="path-map-social-stop"
                style={{ left: `${SOCIAL_MAP_POSITION.left}%`, top: `${SOCIAL_MAP_POSITION.top}%` }}
                role="img"
                aria-label="Social icon plaza at the end of the trail"
              >
                <div>
                  {socials.map((social) => {
                    const Icon = mapSocialIcons[social.label] ?? MapPin;
                    return (
                      <span key={`map-social-${social.label}`} title={social.label}>
                        <Icon aria-hidden />
                      </span>
                    );
                  })}
                </div>
                <strong>Social plaza</strong>
              </div>
            </div>

            <footer>
              <span>
                <i className="map-legend-pin" /> Select a pin to spawn
              </span>
              <span>
                <i className="map-legend-route" /> Walking trail
              </span>
              <span>
                <i className="map-legend-water" /> Coast and water
              </span>
              <span>
                <i className="map-legend-you" /> You are here
              </span>
              <span>
                <i className="map-legend-social" /> Social plaza
              </span>
            </footer>
          </section>
        </div>
      ) : null}

      {!stop && !journeyStarted ? (
        <section className="path-intro-card" aria-labelledby="path-intro-title">
          <p>
            <Compass aria-hidden /> Interactive portfolio trail
          </p>
          <h1 id="path-intro-title">Walk through the work.</h1>
          <span>
            Choose your own route across a wide island of forest paths, bridges, water, and coastal
            viewpoints. Each landmark reveals a different part of my story, skills, credentials,
            services, and projects.
          </span>
          <div>
            <button type="button" onClick={() => walkTo("about")}>
              Begin the journey <Footprints aria-hidden />
            </button>
            <button
              type="button"
              className="path-secondary-action"
              onClick={() => openShowcase("portfolio")}
            >
              Open project showcase
            </button>
          </div>
        </section>
      ) : null}

      {stop && !showcase ? (
        <aside className="path-destination-card" aria-live="polite">
          <p className="path-card-eyebrow">
            <MapPin aria-hidden /> {stop.number} / {stop.eyebrow}
          </p>
          <h2>{stop.title}</h2>
          <p>{stop.description}</p>
          <div className="path-fact-list">
            {stop.facts.map((fact) => (
              <span key={fact}>{fact}</span>
            ))}
          </div>
          {stop.id === "portfolio" && projects[0] ? (
            <img src={projects[0].image} alt={`Preview of ${projects[0].title}`} />
          ) : null}
          <button
            type="button"
            className="path-open-showcase"
            onClick={() => openShowcase(stop.id)}
          >
            Explore {stop.short.toLowerCase()} <ArrowRight aria-hidden />
          </button>
        </aside>
      ) : null}

      {mode !== "3d" && showcase && activeShowcaseSlide && activeShowcaseStop ? (
        <div
          className="path-tv-overlay"
          role="presentation"
          onPointerDown={() => setShowcase(null)}
        >
          <section
            className="path-tv"
            role="dialog"
            aria-modal="true"
            aria-labelledby="path-tv-title"
            onPointerDown={(event) => event.stopPropagation()}
          >
            <header className="path-tv-header">
              <div>
                <span>AA VILLAGE NETWORK</span>
                <strong>{activeShowcaseStop.short} channel</strong>
              </div>
              <div className="path-tv-status">
                <i aria-hidden /> LIVE
              </div>
              <button
                type="button"
                onClick={() => setShowcase(null)}
                aria-label="Close showcase TV"
              >
                <X aria-hidden />
              </button>
            </header>

            <div className="path-tv-body">
              <div className="path-tv-screen">
                <div className="path-tv-scanlines" aria-hidden />
                <article
                  className={`path-tv-slide ${activeShowcaseSlide.image ? "has-image" : ""}`}
                >
                  {activeShowcaseSlide.image ? (
                    <figure>
                      <img
                        src={activeShowcaseSlide.image}
                        alt={activeShowcaseSlide.imageAlt ?? "Portfolio showcase"}
                        loading="lazy"
                        decoding="async"
                      />
                    </figure>
                  ) : null}
                  <div className="path-tv-copy">
                    <p>{activeShowcaseSlide.eyebrow}</p>
                    {activeShowcaseSlide.metric ? (
                      <span className="path-tv-metric">{activeShowcaseSlide.metric}</span>
                    ) : null}
                    <h2 id="path-tv-title">{activeShowcaseSlide.title}</h2>
                    <p className="path-tv-description">{activeShowcaseSlide.description}</p>
                    {activeShowcaseSlide.chips?.length ? (
                      <ul className="path-tv-chips" aria-label="Slide details">
                        {activeShowcaseSlide.chips.map((chip) => (
                          <li key={chip}>{chip}</li>
                        ))}
                      </ul>
                    ) : null}
                    {activeShowcaseSlide.action ? (
                      <a
                        href={activeShowcaseSlide.action.href}
                        target={
                          activeShowcaseSlide.action.href.startsWith("http") ? "_blank" : undefined
                        }
                        rel={
                          activeShowcaseSlide.action.href.startsWith("http")
                            ? "noopener noreferrer"
                            : undefined
                        }
                      >
                        {activeShowcaseSlide.action.label} <ArrowRight aria-hidden />
                      </a>
                    ) : null}
                  </div>
                </article>
              </div>

              <aside className="path-tv-controls" aria-label="Slideshow controls">
                <div className="path-tv-speaker" aria-hidden>
                  {Array.from({ length: 12 }, (_, index) => (
                    <i key={index} />
                  ))}
                </div>
                <span>
                  {String(showcase.slide + 1).padStart(2, "0")} /{" "}
                  {String(activeShowcaseSlides.length).padStart(2, "0")}
                </span>
                <button
                  type="button"
                  onClick={() => changeShowcaseSlide(-1)}
                  aria-label="Previous slide"
                >
                  <ChevronLeft aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={() => changeShowcaseSlide(1)}
                  aria-label="Next slide"
                >
                  <ChevronRight aria-hidden />
                </button>
              </aside>
            </div>

            <footer className="path-tv-footer">
              <div className="path-tv-dots" aria-label="Choose slide">
                {activeShowcaseSlides.map((slide, index) => (
                  <button
                    key={`${slide.eyebrow}-${index}`}
                    type="button"
                    className={index === showcase.slide ? "is-active" : undefined}
                    onClick={() => setShowcase({ ...showcase, slide: index })}
                    aria-label={`Show slide ${index + 1}: ${slide.title}`}
                    aria-current={index === showcase.slide ? "true" : undefined}
                  />
                ))}
              </div>
              <p>Use the arrows or keyboard ← → to browse</p>
            </footer>
          </section>
        </div>
      ) : null}

      <div
        className="studio-mobile-controls path-mobile-controls"
        aria-label="Character movement controls"
      >
        <button
          type="button"
          aria-label="Move forward"
          onPointerDown={() => setDirection(0, -1)}
          onPointerUp={clearDirection}
          onPointerCancel={clearDirection}
          onPointerLeave={clearDirection}
        >
          ↑
        </button>
        <button
          type="button"
          aria-label="Move left"
          onPointerDown={() => setDirection(-1, 0)}
          onPointerUp={clearDirection}
          onPointerCancel={clearDirection}
          onPointerLeave={clearDirection}
        >
          ←
        </button>
        <button
          type="button"
          aria-label="Move backward"
          onPointerDown={() => setDirection(0, 1)}
          onPointerUp={clearDirection}
          onPointerCancel={clearDirection}
          onPointerLeave={clearDirection}
        >
          ↓
        </button>
        <button
          type="button"
          aria-label="Move right"
          onPointerDown={() => setDirection(1, 0)}
          onPointerUp={clearDirection}
          onPointerCancel={clearDirection}
          onPointerLeave={clearDirection}
        >
          →
        </button>
      </div>
    </div>
  );
}
