import { Link } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { ArrowRight, Compass, Footprints, MapPin, Sparkles } from "lucide-react";

import { certifications, projects, services, skillGroups } from "@/data/portfolio";

const InteractiveStudioCanvas = lazy(() => import("./interactive-studio-canvas"));

export type StudioZoneId =
  "about" | "skills" | "certifications" | "services" | "portfolio" | "contact";

export type StudioInput = {
  x: number;
  z: number;
  target: { x: number; z: number } | null;
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
    target: { x: -1.35, z: -3.1 },
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
    target: { x: 1.35, z: -8.2 },
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
    target: { x: -1.35, z: -13.3 },
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
    target: { x: 1.35, z: -18.4 },
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
    target: { x: -1.35, z: -23.5 },
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
    target: { x: 1.35, z: -28.6 },
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
  const inputRef = useRef<StudioInput>({ x: 0, z: 0, target: null });
  const [mode, setMode] = useState<DisplayMode>("checking");
  const [inView, setInView] = useState(true);
  const [activeZone, setActiveZone] = useState<StudioZoneId | null>(null);

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
  };

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

      <div className="path-topbar" aria-hidden>
        <span>
          <i /> {darkMode ? "Evening route" : "Morning route"}
        </span>
        <span>AMJAD / PORTFOLIO TRAIL</span>
        <span>{stop ? `STOP ${stop.number} / 06` : "TRAILHEAD / 00"}</span>
      </div>

      {!stop ? (
        <section className="path-intro-card" aria-labelledby="path-intro-title">
          <p>
            <Compass aria-hidden /> Interactive portfolio trail
          </p>
          <h1 id="path-intro-title">Walk through the work.</h1>
          <span>
            Guide the character along one continuous path. Each landmark reveals a different part of
            my story, skills, credentials, services, and projects.
          </span>
          <div>
            <button type="button" onClick={() => walkTo("about")}>
              Begin the journey <Footprints aria-hidden />
            </button>
            <Link to="/portfolio">Open project index</Link>
          </div>
        </section>
      ) : null}

      <nav className="path-stop-index" aria-label="Portfolio trail destinations">
        {pathStops.map((item) => (
          <button
            key={item.id}
            type="button"
            className={item.id === activeZone ? "is-active" : undefined}
            onClick={() => walkTo(item.id)}
            aria-label={`Walk to ${item.short}`}
          >
            <span>{item.number}</span>
            <i />
            <strong>{item.short}</strong>
          </button>
        ))}
      </nav>

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

      <div className="path-controls-hint" aria-hidden>
        <Footprints />
        <span>
          <strong>WASD / ARROWS</strong> to walk
        </span>
        <i />
        <span>
          <strong>CLICK</strong> the path
        </span>
        <i />
        <span>
          <Sparkles /> robot companion online
        </span>
      </div>

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
