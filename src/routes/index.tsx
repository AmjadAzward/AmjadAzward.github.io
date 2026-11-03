import { createFileRoute, Link } from "@tanstack/react-router";

import InteractiveStudioHero from "@/components/interactive-studio/interactive-studio-hero";
import { navItems } from "@/data/portfolio";
import { makeHead } from "@/lib/head";

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
      <nav className="sr-only" aria-label="Detailed portfolio pages">
        {navItems
          .filter((item) => item.to !== "/")
          .map((item) => (
            <Link key={item.to} to={item.to}>
              {item.label}
            </Link>
          ))}
      </nav>
      <div className="studio-home-shell">
        <InteractiveStudioHero />
      </div>
    </section>
  );
}
