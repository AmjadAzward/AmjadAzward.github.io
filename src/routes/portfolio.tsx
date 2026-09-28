import { createFileRoute } from "@tanstack/react-router";
import { Github, Layers3 } from "lucide-react";

import { ExternalIcon, PageHeading, Reveal, Section } from "@/components/portfolio-ui";
import { TiltSurface } from "@/components/tilt-surface";
import { projects } from "@/data/portfolio";
import { makeHead } from "@/lib/head";

export const Route = createFileRoute("/portfolio")({
  head: makeHead(
    "Selected Work",
    "Selected software, mobile, web, machine learning, and data projects by Amjad Azward.",
    "/portfolio",
  ),
  component: Portfolio,
});

const projectGroups = ["All", "Products", "Intelligence", "Applications"] as const;
type ProjectGroup = (typeof projectGroups)[number];

function projectGroup(tag: string): Exclude<ProjectGroup, "All"> {
  if (["Computer Vision", "Data Engineering"].includes(tag)) return "Intelligence";
  if (["Mobile", "Software", "Web"].includes(tag)) return "Applications";
  return "Products";
}

function Portfolio() {
  const [featuredProject, ...remainingProjects] = projects;

  return (
    <Section>
      <PageHeading
        index="05"
        eyebrow="WORK"
        title="Selected Projects"
        ghost="BUILT"
        description="A growing body of work spanning useful software, intelligent systems, and data-led products."
      />

      <Reveal>
        <section className="portfolio-overview" aria-labelledby="portfolio-overview-title">
          <div className="portfolio-overview-copy">
            <p className="eyebrow">SELECTED WORK / 2023-2026</p>
            <h2 id="portfolio-overview-title">Ideas made tangible.</h2>
            <p>
              Each project is an exercise in turning a real need into a clear system - balancing
              engineering decisions, useful data, and a thoughtful experience.
            </p>
          </div>

          <dl className="portfolio-metrics">
            <div>
              <dt>Projects</dt>
              <dd>{String(projects.length).padStart(2, "0")}</dd>
            </div>
            <div>
              <dt>Focus areas</dt>
              <dd>{String(projectGroups.length - 1).padStart(2, "0")}</dd>
            </div>
            <div>
              <dt>Mindset</dt>
              <dd>BUILD</dd>
            </div>
          </dl>
        </section>
      </Reveal>

      <section className="portfolio-browser" aria-labelledby="portfolio-browser-title">
        <header className="portfolio-browser-header">
          <div>
            <p className="eyebrow">PROJECT INDEX</p>
            <h2 id="portfolio-browser-title">Project collection</h2>
          </div>
          <p>{String(projects.length).padStart(2, "0")} projects</p>
        </header>

        {featuredProject && (
          <Reveal key={`featured-${featuredProject.title}`}>
            <TiltSurface className="portfolio-featured-tilt" intensity={3.8} lift={1.006}>
              <article className="portfolio-featured">
                <span className="portfolio-depth-grid" aria-hidden />
                <div className="portfolio-featured-media">
                  <img
                    src={featuredProject.image}
                    alt=""
                    aria-hidden
                    loading="lazy"
                    decoding="async"
                    fetchPriority="low"
                  />
                  <span aria-hidden>FEATURED / 01</span>
                </div>
                <div className="portfolio-featured-body">
                  <div className="portfolio-project-meta">
                    <span>{featuredProject.tag}</span>
                    <span>{projectGroup(featuredProject.tag ?? "Software")}</span>
                  </div>
                  <h3>{featuredProject.title}</h3>
                  <p>{featuredProject.desc}</p>
                  <a href={featuredProject.github} target="_blank" rel="noreferrer">
                    View project on GitHub
                    <ExternalIcon />
                  </a>
                </div>
              </article>
            </TiltSurface>
          </Reveal>
        )}

        <div className="portfolio-grid">
          {remainingProjects.map((project, index) => (
            <Reveal key={project.title} delay={(index % 2) * 0.05} className="tilt-reveal">
              <TiltSurface className="portfolio-card-tilt" intensity={5}>
                <article className="portfolio-card">
                  <span className="portfolio-depth-grid" aria-hidden />
                  <div className="portfolio-card-media">
                    <img
                      src={project.image}
                      alt=""
                      aria-hidden
                      loading="lazy"
                      decoding="async"
                      fetchPriority="low"
                    />
                    <span aria-hidden>{String(index + 2).padStart(2, "0")}</span>
                  </div>
                  <div className="portfolio-card-body">
                    <div className="portfolio-project-meta">
                      <span>{project.tag}</span>
                      <span>{projectGroup(project.tag ?? "Software")}</span>
                    </div>
                    <div className="portfolio-card-title-row">
                      <h3>{project.title}</h3>
                      <a
                        href={project.github}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`${project.title} on GitHub`}
                      >
                        <ExternalIcon />
                      </a>
                    </div>
                    <p>{project.desc}</p>
                  </div>
                </article>
              </TiltSurface>
            </Reveal>
          ))}
        </div>
      </section>

      <Reveal>
        <aside className="page-end-cta portfolio-cta">
          <div>
            <Layers3 aria-hidden />
            <div>
              <p className="eyebrow">MORE IN THE REPOSITORIES</p>
              <h2>The work keeps evolving.</h2>
            </div>
          </div>
          <a href="https://github.com/AmjadAzward" target="_blank" rel="noreferrer">
            <Github aria-hidden />
            Browse GitHub
          </a>
        </aside>
      </Reveal>
    </Section>
  );
}
