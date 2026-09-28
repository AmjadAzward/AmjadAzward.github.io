import { useRef, type PointerEvent, type ReactNode } from "react";

import { cn } from "@/lib/utils";

export function TiltSurface({
  children,
  className,
  intensity = 6,
  lift = 1.012,
}: {
  children: ReactNode;
  className?: string;
  intensity?: number;
  lift?: number;
}) {
  const surfaceRef = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLSpanElement>(null);
  const frameRef = useRef(0);
  const nextTilt = useRef({ x: 0, y: 0 });

  function renderTilt() {
    const { x, y } = nextTilt.current;
    surfaceRef.current?.style.setProperty(
      "transform",
      `rotateX(${-y * intensity}deg) rotateY(${x * intensity}deg) scale(${lift})`,
    );
    glareRef.current?.style.setProperty("transform", `translate3d(${x * 28}%, ${y * 24}%, 0)`);
    frameRef.current = 0;
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "mouse") return;

    const bounds = event.currentTarget.getBoundingClientRect();
    nextTilt.current = {
      x: ((event.clientX - bounds.left) / bounds.width - 0.5) * 2,
      y: ((event.clientY - bounds.top) / bounds.height - 0.5) * 2,
    };

    if (!frameRef.current) frameRef.current = requestAnimationFrame(renderTilt);
  }

  function resetTilt() {
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    frameRef.current = 0;
    nextTilt.current = { x: 0, y: 0 };
    surfaceRef.current?.style.setProperty("transform", "rotateX(0deg) rotateY(0deg) scale(1)");
    glareRef.current?.style.setProperty("transform", "translate3d(0, 0, 0)");
  }

  return (
    <div className={cn("tilt-scene", className)}>
      <div
        ref={surfaceRef}
        className="tilt-surface"
        data-cursor
        onPointerMove={handlePointerMove}
        onPointerLeave={resetTilt}
        onPointerCancel={resetTilt}
      >
        {children}
        <span ref={glareRef} className="tilt-glare" aria-hidden />
      </div>
    </div>
  );
}
