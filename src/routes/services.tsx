import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight, CheckCircle2, MessageSquareText, Rocket, Shapes } from "lucide-react";

import { ActionLink, PageHeading, Reveal, Section } from "@/components/portfolio-ui";
import { TiltSurface } from "@/components/tilt-surface";
import { services } from "@/data/portfolio";
import { makeHead } from "@/lib/head";

export const Route = createFileRoute("/services")({
  head: makeHead(
    "Services",
    "Software, web, mobile, AI, IoT, and analytics services by Amjad Azward.",
    "/services",
  ),
  component: Services,
});

const processSteps = [
  {
    title: "Discover",
    description: "Clarify the problem, users, constraints, and the outcome that matters.",
  },
  {
    title: "Build",
    description: "Turn the direction into a focused, dependable product increment.",
  },
  {
    title: "Refine",
    description: "Test the experience, learn from feedback, and strengthen the result.",
  },
];

const serviceOutcomes = [
  "A release-ready mobile experience",
  "A fast, responsive web product",
  "A workflow-first desktop tool",
  "A practical intelligent system",
  "A connected working prototype",
  "Clear, decision-ready insight",
];

function Services() {
  return (
    <Section>
      <PageHeading
        index="04"
        eyebrow="SERVICES"
        title="What I Build"
        ghost="SOLUTIONS"
        description="Practical digital systems, crafted with equal attention to function and experience."
      />

      <Reveal>
        <TiltSurface className="services-process-tilt" intensity={3.5} lift={1.005}>
          <section className="services-intro" aria-labelledby="services-process-title">
            <div className="services-intro-copy">
              <span className="services-intro-icon" aria-hidden>
                <Shapes />
              </span>
              <p className="eyebrow">FROM BRIEF TO WORKING PRODUCT</p>
              <h2 id="services-process-title">A clear path through complexity.</h2>
              <p>
                Every engagement is shaped around the real problem - not a fixed template. The
                process stays collaborative, visible, and focused on useful outcomes.
              </p>
            </div>

            <ol className="services-process">
              {processSteps.map((step, index) => (
                <li key={step.title} data-step={index + 1}>
                  <span aria-hidden>{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <h3>{step.title}</h3>
                    <p>{step.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </TiltSurface>
      </Reveal>

      <header className="services-grid-heading">
        <div>
          <p className="eyebrow">CAPABILITIES / 06</p>
          <h2>Ways I can help</h2>
        </div>
        <p>Choose a starting point. The final solution can span more than one capability.</p>
      </header>

      <div className="service-grid">
        {services.map((service, index) => {
          const Icon = service.icon;

          return (
            <Reveal key={service.title} delay={(index % 3) * 0.05}>
              <article className="service-card">
                <div className="service-card-header">
                  <span className="service-index">{String(index + 1).padStart(2, "0")} / 06</span>
                  <span className="service-icon-shell">
                    <Icon className="service-icon" strokeWidth={1.4} aria-hidden />
                  </span>
                </div>

                <div className="service-card-main">
                  <h3 className="service-title">{service.title}</h3>
                  <p className="service-desc">{service.desc}</p>
                  <div className="service-tags" aria-label={`${service.title} technologies`}>
                    {service.tags.map((tag) => (
                      <span className="service-tag" key={tag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="service-card-outcome">
                  <CheckCircle2 aria-hidden />
                  <div>
                    <span>Typical outcome</span>
                    <strong>{serviceOutcomes[index]}</strong>
                  </div>
                </div>

                <Link to="/contact" className="service-card-link">
                  Discuss this service
                  <ArrowUpRight aria-hidden />
                </Link>
              </article>
            </Reveal>
          );
        })}
      </div>

      <Reveal>
        <aside className="page-end-cta services-cta">
          <div>
            <MessageSquareText aria-hidden />
            <div>
              <p className="eyebrow">HAVE SOMETHING IN MIND?</p>
              <h2>Let’s shape the right solution.</h2>
            </div>
          </div>
          <ActionLink to="/contact">
            Start a conversation
            <Rocket aria-hidden />
          </ActionLink>
        </aside>
      </Reveal>
    </Section>
  );
}
