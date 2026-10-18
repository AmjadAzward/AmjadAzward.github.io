import { createFileRoute } from "@tanstack/react-router";
import { motion, useReducedMotion } from "motion/react";
import { lazy, Suspense } from "react";

import { ActionLink, ExternalIcon } from "@/components/portfolio-ui";
import { makeHead } from "@/lib/head";

const MiniAIRobotHero = lazy(() => import("@/components/mini-ai-robot/mini-ai-robot-hero"));

export const Route = createFileRoute("/")({
  head: makeHead(
    "Software Engineering & Data Science Portfolio",
    "Amjad Azward crafts practical web, cloud, mobile, and machine learning solutions.",
    "/",
  ),
  component: Home,
});

function HeroRobot({ reduce }: { reduce: boolean }) {
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.72, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
      className="home-visual-entry"
    >
      <Suspense fallback={<div className="mini-robot-shell" aria-hidden />}>
        <MiniAIRobotHero />
      </Suspense>
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
          transition={{ duration: 0.62, ease: [0.16, 1, 0.3, 1] }}
          className="home-identity"
        >
          <p className="home-kicker">Software engineering - Data science</p>
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

        <HeroRobot reduce={reduce} />
      </div>
    </section>
  );
}
