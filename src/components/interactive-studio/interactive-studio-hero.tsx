import { Link } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";

const InteractiveStudioCanvas = lazy(() => import("./interactive-studio-canvas"));

export type StudioZoneId = "about" | "skills" | "portfolio" | "certifications" | "contact";

export type StudioInput = {
  x: number;
  z: number;
  target: { x: number; z: number } | null;
};

type DisplayMode = "checking" | "3d" | "static";

const zoneDetails: Record<
  StudioZoneId,
  {
    label: string;
    description: string;
    to: "/about" | "/skills" | "/portfolio" | "/certifications" | "/contact";
  }
> = {
  about: {
    label: "Profile hologram",
    description: "Meet the engineer behind the systems.",
    to: "/about",
  },
  skills: {
    label: "Skills workstation",
    description: "Explore the technologies I build with.",
    to: "/skills",
  },
  portfolio: {
    label: "Project wall",
    description: "Open selected software and data work.",
    to: "/portfolio",
  },
  certifications: {
    label: "Credential archive",
    description: "Browse certifications and continuous learning.",
    to: "/certifications",
  },
  contact: {
    label: "Communication terminal",
    description: "Start a conversation about your next project.",
    to: "/contact",
  },
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
  const connection = (
    navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }
  ).connection;
  return connection?.saveData === true || connection?.effectiveType === "2g";
}

function StudioStaticFallback({ darkMode }: { darkMode: boolean }) {
  return (
    <div
      className={`studio-static-fallback ${darkMode ? "is-evening" : "is-morning"}`}
      role="img"
      aria-label="A modern digital studio with a software engineer and miniature AI robot"
    >
      <span className="studio-static-window" aria-hidden />
      <span className="studio-static-desk" aria-hidden />
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

  const setDirection = (x: number, z: number) => {
    inputRef.current.x = x;
    inputRef.current.z = z;
    inputRef.current.target = null;
  };

  const clearDirection = () => {
    inputRef.current.x = 0;
    inputRef.current.z = 0;
  };

  const zone = activeZone ? zoneDetails[activeZone] : null;

  return (
    <div ref={shellRef} className="interactive-studio" aria-label="Interactive AI engineer studio">
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

      <div className="studio-hud-top" aria-hidden>
        <span className="studio-status-dot" />
        <span>{darkMode ? "Evening studio" : "Morning studio"}</span>
        <span>Interactive / 01</span>
      </div>

      <div className="studio-section-index" aria-label="Studio destinations">
        {(Object.keys(zoneDetails) as StudioZoneId[]).map((id, index) => (
          <Link key={id} to={zoneDetails[id].to} title={zoneDetails[id].label}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            {zoneDetails[id].label.split(" ")[0]}
          </Link>
        ))}
      </div>

      {zone ? (
        <aside className="studio-proximity-card" aria-live="polite">
          <span>NEARBY</span>
          <strong>{zone.label}</strong>
          <p>{zone.description}</p>
          <Link to={zone.to}>Open section</Link>
        </aside>
      ) : null}

      <div className="studio-controls-hint" aria-hidden>
        <span>WASD / ARROWS</span>
        <i />
        <span>CLICK FLOOR TO WALK</span>
      </div>

      <div className="studio-mobile-controls" aria-label="Character movement controls">
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
