import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Download, Mail, Map } from "lucide-react";

import { PageHeading, Section, SocialLinks } from "@/components/portfolio-ui";
import {
  certifications,
  education,
  experience,
  projects,
  services,
  skillGroups,
} from "@/data/portfolio";
import { makeHead } from "@/lib/head";

export const Route = createFileRoute("/quick-view")({
  head: makeHead(
    "Quick View Portfolio",
    "A complete, accessible overview of Amjad Azward's experience, skills, projects, certifications, services, and contact details.",
    "/quick-view",
  ),
  component: QuickView,
});

function QuickView() {
  return (
    <Section className="quick-view-page">
      <PageHeading
        index="00"
        eyebrow="QUICK VIEW"
        title="The Complete Portfolio"
        ghost="OVERVIEW"
        description="The same verified portfolio content as the 3D village, organized for fast reading and accessible navigation."
      />

      <nav className="quick-view-jump" aria-label="Quick View sections">
        {[
          ["About", "quick-about"],
          ["Skills", "quick-skills"],
          ["Projects", "quick-projects"],
          ["Education", "quick-education"],
          ["Certifications", "quick-certifications"],
          ["Services", "quick-services"],
          ["Contact", "quick-contact"],
        ].map(([label, id]) => (
          <a key={id} href={`#${id}`}>
            {label}
          </a>
        ))}
      </nav>

      <section id="quick-about" className="quick-view-section quick-view-about">
        <p className="eyebrow">ABOUT / AMJAD AZWARD</p>
        <h2>Building where software meets intelligence.</h2>
        <p>
          I&apos;m a third-year Computer Science undergraduate at NIBM, affiliated with Coventry
          University, currently freelancing as a software developer and gaining industry experience
          through AI-enabled engineering internships.
        </p>
        <div className="quick-view-actions">
          <Link to="/" className="quick-primary-action">
            <Map aria-hidden /> Explore the 3D village
          </Link>
          <a href="/cv.pdf" download className="quick-secondary-action">
            <Download aria-hidden /> Download resume
          </a>
        </div>
      </section>

      <section id="quick-skills" className="quick-view-section">
        <header>
          <p className="eyebrow">TECHNICAL TOOLKIT</p>
          <h2>Skills by discipline</h2>
        </header>
        <div className="quick-skill-grid">
          {skillGroups.map((group) => (
            <article key={group.title}>
              <h3>{group.title}</h3>
              <ul>
                {group.items.map((skill) => (
                  <li key={skill.name}>{skill.name}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section id="quick-projects" className="quick-view-section">
        <header>
          <p className="eyebrow">SELECTED WORK</p>
          <h2>Projects</h2>
        </header>
        <div className="quick-project-grid">
          {projects.map((project) => (
            <article key={project.title}>
              <img src={project.image} alt={`Preview of ${project.title}`} loading="lazy" />
              <div>
                <span>{project.tag}</span>
                <h3>{project.title}</h3>
                <p>{project.desc}</p>
                <a href={project.github} target="_blank" rel="noreferrer">
                  GitHub <ArrowUpRight aria-hidden />
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="quick-education" className="quick-view-section quick-view-split">
        <div>
          <p className="eyebrow">EDUCATION</p>
          <h2>Academic foundation</h2>
          {education.map((item) => (
            <article key={item.title}>
              <span>{item.date}</span>
              <h3>{item.title}</h3>
              <p>{item.place}</p>
            </article>
          ))}
        </div>
        <div>
          <p className="eyebrow">EXPERIENCE</p>
          <h2>Learning through delivery</h2>
          {experience.map((item) => (
            <article key={item.title}>
              <span>{item.date}</span>
              <h3>{item.title}</h3>
              <p>{item.place}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="quick-certifications" className="quick-view-section">
        <header>
          <p className="eyebrow">CREDENTIALS</p>
          <h2>Verified learning</h2>
        </header>
        <div className="quick-cert-grid">
          {certifications.map((certificate) => (
            <article key={certificate.title}>
              <img
                src={certificate.image}
                alt={`${certificate.title} certificate`}
                loading="lazy"
              />
              <div>
                <span>{certificate.issuer}</span>
                <h3>{certificate.title}</h3>
                <a href={certificate.verify} target="_blank" rel="noreferrer">
                  Verify <ArrowUpRight aria-hidden />
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="quick-services" className="quick-view-section">
        <header>
          <p className="eyebrow">SERVICES</p>
          <h2>Ways I can help</h2>
        </header>
        <div className="quick-service-grid">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <article key={service.title}>
                <Icon aria-hidden />
                <h3>{service.title}</h3>
                <p>{service.desc}</p>
                <div>{service.tags.join(" / ")}</div>
              </article>
            );
          })}
        </div>
      </section>

      <section id="quick-contact" className="quick-view-section quick-view-contact">
        <div>
          <p className="eyebrow">CONTACT</p>
          <h2>Let&apos;s make something useful.</h2>
          <p>Available for thoughtful products, freelance work, and engineering opportunities.</p>
        </div>
        <div className="quick-view-actions">
          <a href="mailto:amjadazward693@gmail.com" className="quick-primary-action">
            <Mail aria-hidden /> Email Amjad
          </a>
          <Link to="/contact" className="quick-secondary-action">
            Contact form
          </Link>
        </div>
        <SocialLinks />
      </section>
    </Section>
  );
}
