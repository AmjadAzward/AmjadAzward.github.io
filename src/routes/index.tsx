import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

import { makeHead } from "@/lib/head";

const InteractiveStudioHero = lazy(
  () => import("@/components/interactive-studio/interactive-studio-hero"),
);

export const Route = createFileRoute("/")({
  head: makeHead(
    "Software Engineering & Data Science Portfolio",
    "Amjad Azward crafts practical web, cloud, mobile, and machine learning solutions.",
    "/",
  ),
  component: Home,
});

function Home() {
  return (
    <section className="home-stage studio-home">
      <div className="studio-home-shell">
        <Suspense fallback={<div className="interactive-studio studio-loading" aria-hidden />}>
          <InteractiveStudioHero />
        </Suspense>
      </div>
    </section>
  );
}
