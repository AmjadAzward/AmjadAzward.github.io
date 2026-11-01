import { Link } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import {
  ArrowRight,
  Compass,
  Facebook,
  Footprints,
  Github,
  Instagram,
  Linkedin,
  Map as MapIcon,
  MapPin,
  X,
} from "lucide-react";

import { certifications, projects, services, skillGroups, socials } from "@/data/portfolio";

const InteractiveStudioCanvas = lazy(() => import("./interactive-studio-canvas"));

const socialIcons: Record<string, typeof Github> = {
  LinkedIn: Linkedin,
  GitHub: Github,
  Facebook,
  X,
  Instagram,
};

export type StudioZoneId =
  "about" | "skills" | "certifications" | "services" | "portfolio" | "contact";

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
  to: "/about" | "/skills" | "/certifications" | "/services" | "/portfolio" | "/contact";
  target: { x: number; z: number };
  mapPosition: { left: number; top: number };
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
    to: "/about",
    target: { x: -4.8, z: 0.8 },
    mapPosition: { left: 31, top: 19 },
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
    to: "/skills",
    target: { x: 4.6, z: -3.6 },
    mapPosition: { left: 68, top: 29 },
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
    to: "/certifications",
    target: { x: -4.6, z: -8.9 },
    mapPosition: { left: 30, top: 43 },
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
    to: "/services",
    target: { x: 4.9, z: -13.4 },
    mapPosition: { left: 67, top: 55 },
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
    to: "/portfolio",
    target: { x: -3.8, z: -18.8 },
    mapPosition: { left: 32, top: 71 },
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
    to: "/contact",
    target: { x: 3.8, z: -24 },
    mapPosition: { left: 67, top: 84 },
    facts: ["Project enquiries", "Freelance work", "Engineering opportunities"],
  },
];

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
  const connection = (
    navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }
  ).connection;
  return connection?.saveData === true || connection?.effectiveType === "2g";
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
  const [mode, setMode] = useState<DisplayMode>("checking");
  const [inView, setInView] = useState(true);
  const [activeZone, setActiveZone] = useState<StudioZoneId | null>(null);
  const [mapOpen, setMapOpen] = useState(false);
  const [journeyStarted, setJourneyStarted] = useState(false);

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
    inputRef.current.locked = mapOpen;
    if (!mapOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMapOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [mapOpen]);

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

  const stop = activeZone ? pathStops.find((item) => item.id === activeZone) : null;

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
              onZoneChange={setActiveZone}
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
                <p>EXPEDITION MAP / FAST TRAVEL</p>
                <h2 id="trail-map-title">Choose your next stop.</h2>
              </div>
              <button type="button" onClick={() => setMapOpen(false)} aria-label="Close trail map">
                <X aria-hidden />
              </button>
            </header>

            <div className="path-map-canvas">
              <svg viewBox="0 0 100 100" aria-hidden>
                <defs>
                  <linearGradient id="map-sea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#1785b8" />
                    <stop offset="1" stopColor="#07527f" />
                  </linearGradient>
                  <linearGradient id="map-land" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#397d45" />
                    <stop offset="1" stopColor="#205f39" />
                  </linearGradient>
                </defs>
                <rect width="100" height="100" rx="8" fill="url(#map-sea)" />
                <path
                  d="M12 7 C28 2 48 6 62 5 C81 4 92 14 91 29 C90 43 96 54 89 67 C82 80 90 91 72 96 C55 101 39 94 24 96 C8 98 5 84 9 70 C13 57 5 45 9 31 C12 22 5 13 12 7Z"
                  fill="url(#map-land)"
                  stroke="#74b46c"
                  strokeWidth="1.6"
                />
                <path
                  d="M50 5 C48 14 34 15 31 20 C27 27 42 33 55 31 C70 30 73 38 66 45 C59 52 36 49 30 57 C24 65 40 73 53 70 C68 67 73 74 67 84 C63 90 57 94 52 98"
                  fill="none"
                  stroke="#d8c99f"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="8"
                />
                <path
                  d="M50 5 C48 14 34 15 31 20 C27 27 42 33 55 31 C70 30 73 38 66 45 C59 52 36 49 30 57 C24 65 40 73 53 70 C68 67 73 74 67 84 C63 90 57 94 52 98"
                  fill="none"
                  stroke="#9b885d"
                  strokeDasharray="1 4"
                  strokeLinecap="round"
                  strokeWidth="1.3"
                />
                <path
                  d="M39 35 C25 35 18 43 24 52 C30 59 39 53 43 48"
                  fill="none"
                  stroke="#d8c99f"
                  strokeLinecap="round"
                  strokeWidth="5"
                />
                <path
                  d="M61 62 C77 60 84 68 78 77 C73 84 65 79 59 76"
                  fill="none"
                  stroke="#d8c99f"
                  strokeLinecap="round"
                  strokeWidth="5"
                />
                <ellipse cx="20" cy="27" rx="8" ry="6" fill="#1288b9" />
                <ellipse cx="78" cy="42" rx="10" ry="6" fill="#0e78a9" />
                <ellipse cx="18" cy="75" rx="7" ry="10" fill="#0d74a5" />
                <ellipse cx="82" cy="86" rx="6" ry="5" fill="#168bb9" />
                {Array.from({ length: 26 }, (_, index) => (
                  <g
                    key={`map-tree-${index}`}
                    transform={`translate(${14 + ((index * 19) % 73)} ${12 + ((index * 31) % 78)})`}
                  >
                    <rect x="-0.35" y="0.6" width="0.7" height="1.5" rx="0.2" fill="#714528" />
                    <circle
                      r={1.4 + (index % 3) * 0.18}
                      fill={index % 2 === 0 ? "#2e7d3d" : "#4c9848"}
                    />
                  </g>
                ))}
              </svg>

              {pathStops.map((item) => (
                <button
                  key={`map-${item.id}`}
                  type="button"
                  className={item.id === activeZone ? "is-current" : undefined}
                  style={{ left: `${item.mapPosition.left}%`, top: `${item.mapPosition.top}%` }}
                  onClick={() => spawnAt(item.id)}
                  aria-label={`Fast travel to ${item.short}`}
                >
                  <span>
                    <i>{item.number}</i>
                  </span>
                  <strong>{item.short}</strong>
                </button>
              ))}
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
            <Link to="/portfolio">Open project index</Link>
          </div>
        </section>
      ) : null}

      {stop ? (
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
          <Link to={stop.to}>
            Explore {stop.short.toLowerCase()} <ArrowRight aria-hidden />
          </Link>
        </aside>
      ) : null}

      {activeZone === "contact" ? (
        <aside className="path-social-dock" aria-label="Social profiles">
          <div>
            <span>Continue the conversation</span>
            <strong>Find me online</strong>
          </div>
          <nav aria-label="Amjad Azward on social media">
            {socials.map((social) => {
              const Icon = socialIcons[social.label] ?? ArrowRight;
              return (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={social.label}
                  title={social.label}
                >
                  <Icon aria-hidden />
                </a>
              );
            })}
          </nav>
        </aside>
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
