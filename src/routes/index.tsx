import { createFileRoute } from "@tanstack/react-router";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import { useEffect, useState, type PointerEvent as ReactPointerEvent } from "react";

import { ActionLink, ExternalIcon } from "@/components/portfolio-ui";
import { makeHead } from "@/lib/head";
import homePortrait from "../../img/2-enhanced.jpg?url";

export const Route = createFileRoute("/")({
  head: makeHead(
    "Software Engineering & Data Science Portfolio",
    "Amjad Azward crafts practical web, cloud, mobile, and machine learning solutions.",
    "/",
  ),
  component: Home,
});

function HeroVisual({ reduce }: { reduce: boolean }) {
  const [canTilt, setCanTilt] = useState(false);
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const spring = { stiffness: 150, damping: 20, mass: 0.45 };

  const rotateX = useSpring(useTransform(pointerY, [-0.5, 0.5], [5.5, -5.5]), spring);
  const rotateY = useSpring(useTransform(pointerX, [-0.5, 0.5], [-6.5, 6.5]), spring);
  const subjectX = useSpring(useTransform(pointerX, [-0.5, 0.5], [-11, 11]), spring);
  const subjectY = useSpring(useTransform(pointerY, [-0.5, 0.5], [-8, 8]), spring);
  const motionEnabled = !reduce && canTilt;

  useEffect(() => {
    const query = window.matchMedia("(pointer: fine) and (hover: hover)");
    const update = () => setCanTilt(query.matches);

    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  const resetTilt = () => {
    pointerX.set(0);
    pointerY.set(0);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!motionEnabled || event.pointerType === "touch") return;

    const bounds = event.currentTarget.getBoundingClientRect();
    pointerX.set((event.clientX - bounds.left) / bounds.width - 0.5);
    pointerY.set((event.clientY - bounds.top) / bounds.height - 0.5);
  };

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 34, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 1, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
      className="home-visual-entry"
    >
      <motion.div
        className="home-visual"
        style={{ rotateX, rotateY }}
        onPointerMove={handlePointerMove}
        onPointerLeave={resetTilt}
        onPointerCancel={resetTilt}
      >
        <div className="home-visual-surface">
          <figure className="home-portrait">
            <motion.span className="home-portrait-subject" style={{ x: subjectX, y: subjectY }}>
              <img
                src={homePortrait}
                alt="Portrait of Amjad Azward"
                width={1287}
                height={1222}
                decoding="async"
                fetchPriority="high"
                draggable={false}
              />
            </motion.span>
          </figure>
        </div>
      </motion.div>
    </motion.div>
  );
}

function Home() {
  const reduce = useReducedMotion() ?? false;

  return (
    <section className="home-stage">
      <span className="home-orb home-orb-primary" aria-hidden />
      <span className="home-orb home-orb-secondary" aria-hidden />

      <div className="home-stage-inner">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="home-identity"
        >
          <p className="home-kicker">Software engineering · Data science</p>
          <h1 className="home-name">
            <span>Building useful</span>
            <em>digital systems.</em>
          </h1>
          <p className="home-intro">
            I’m Amjad Azward - a software engineer and data scientist turning complex ideas into
            fast, thoughtful products across web, cloud, and machine learning.
          </p>

          <div className="home-actions">
            <ActionLink to="/contact">
              Start a project
              <ExternalIcon />
            </ActionLink>
            <ActionLink to="/portfolio" variant="outline">
              View my work
            </ActionLink>
          </div>
        </motion.div>

        <HeroVisual reduce={reduce} />
      </div>
    </section>
  );
}
