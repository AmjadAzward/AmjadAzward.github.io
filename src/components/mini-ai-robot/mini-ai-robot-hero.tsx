import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { RotateCcw } from "lucide-react";
import { useReducedMotion } from "motion/react";

const MiniRobotCanvas = lazy(() => import("./mini-robot-canvas"));

type DisplayMode = "checking" | "3d" | "static";

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
  const isSmall = window.matchMedia("(max-width: 640px)").matches;
  const connection = (
    navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }
  ).connection;
  return isSmall || connection?.saveData === true || connection?.effectiveType === "2g";
}

export function RobotStaticFallback({ loading = false }: { loading?: boolean }) {
  return (
    <div
      className="mini-robot-static"
      role="img"
      aria-label="A friendly miniature white AI robot with blue eyes and a glowing blue chest core"
    >
      <svg viewBox="0 0 320 430" aria-hidden>
        <defs>
          <linearGradient id="robot-body" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="0.55" stopColor="#eaf2ff" />
            <stop offset="1" stopColor="#b9d3ee" />
          </linearGradient>
          <radialGradient id="robot-glow">
            <stop offset="0" stopColor="#42a5ff" stopOpacity=".92" />
            <stop offset=".35" stopColor="#38bdf8" stopOpacity=".42" />
            <stop offset="1" stopColor="#38bdf8" stopOpacity="0" />
          </radialGradient>
          <filter id="soft-blue" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="7" />
          </filter>
        </defs>
        <ellipse cx="160" cy="397" rx="76" ry="16" fill="#42a5ff" opacity=".12" />
        <circle cx="160" cy="206" r="132" fill="url(#robot-glow)" opacity=".25" />

        <g className={loading ? "robot-static-loading" : undefined}>
          <rect x="103" y="211" width="114" height="118" rx="34" fill="url(#robot-body)" />
          <rect x="117" y="229" width="86" height="70" rx="23" fill="#dce9f7" />
          <circle cx="160" cy="264" r="24" fill="#101827" />
          <circle cx="160" cy="264" r="15" fill="#42a5ff" />
          <circle cx="160" cy="264" r="7" fill="#d8f4ff" />

          <rect x="64" y="226" width="35" height="82" rx="17" fill="url(#robot-body)" />
          <circle cx="86" cy="230" r="15" fill="#64748b" />
          <rect x="221" y="226" width="35" height="82" rx="17" fill="url(#robot-body)" />
          <circle cx="234" cy="230" r="15" fill="#64748b" />
          <circle cx="81" cy="310" r="20" fill="url(#robot-body)" />
          <circle cx="239" cy="310" r="20" fill="url(#robot-body)" />

          <rect x="120" y="324" width="33" height="49" rx="15" fill="#64748b" />
          <rect x="167" y="324" width="33" height="49" rx="15" fill="#64748b" />
          <rect x="102" y="360" width="57" height="34" rx="16" fill="url(#robot-body)" />
          <rect x="161" y="360" width="57" height="34" rx="16" fill="url(#robot-body)" />

          <rect x="144" y="181" width="32" height="36" rx="10" fill="#64748b" />
          <rect x="54" y="40" width="212" height="158" rx="52" fill="url(#robot-body)" />
          <rect x="72" y="62" width="176" height="112" rx="39" fill="#101827" />
          <rect x="89" y="72" width="7" height="91" rx="4" fill="#38bdf8" opacity=".5" />
          <rect x="224" y="72" width="7" height="91" rx="4" fill="#38bdf8" opacity=".5" />
          <ellipse cx="120" cy="115" rx="25" ry="16" fill="#42a5ff" />
          <ellipse cx="200" cy="115" rx="25" ry="16" fill="#42a5ff" />
          <ellipse cx="120" cy="115" rx="10" ry="7" fill="#d8f4ff" />
          <ellipse cx="200" cy="115" rx="10" ry="7" fill="#d8f4ff" />
          <ellipse
            cx="120"
            cy="115"
            rx="34"
            ry="24"
            fill="#42a5ff"
            opacity=".38"
            filter="url(#soft-blue)"
          />
          <ellipse
            cx="200"
            cy="115"
            rx="34"
            ry="24"
            fill="#42a5ff"
            opacity=".38"
            filter="url(#soft-blue)"
          />
        </g>
      </svg>
      {loading && <span className="mini-robot-loading-label">Initializing companion</span>}
    </div>
  );
}

export default function MiniAIRobotHero() {
  const reducedMotion = useReducedMotion() ?? false;
  const shellRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<DisplayMode>("checking");
  const [inView, setInView] = useState(true);
  const [replayToken, setReplayToken] = useState(0);

  useEffect(() => {
    setMode(supportsWebGL() && !prefersLightweightScene() ? "3d" : "static");
  }, []);

  useEffect(() => {
    const element = shellRef.current;
    if (!element || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry?.isIntersecting ?? true),
      {
        rootMargin: "100px",
        threshold: 0.05,
      },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="mini-robot-experience">
      <div ref={shellRef} className="mini-robot-shell">
        <span className="mini-robot-halo" aria-hidden />
        {mode === "3d" ? (
          <Suspense fallback={<RobotStaticFallback loading />}>
            <MiniRobotCanvas
              replayToken={replayToken}
              reducedMotion={reducedMotion}
              inView={inView}
            />
          </Suspense>
        ) : (
          <RobotStaticFallback loading={mode === "checking"} />
        )}
      </div>

      {mode === "3d" && (
        <button
          type="button"
          className="mini-robot-replay"
          onClick={() => setReplayToken((token) => token + 1)}
          disabled={reducedMotion}
          title={
            reducedMotion
              ? "Assembly animation is disabled by reduced-motion preferences"
              : undefined
          }
        >
          <RotateCcw aria-hidden />
          {reducedMotion ? "Assembly paused" : "Replay assembly"}
        </button>
      )}
    </div>
  );
}
