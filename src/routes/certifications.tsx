import { createFileRoute } from "@tanstack/react-router";
import { Award, BookOpenCheck, Building2, CalendarDays } from "lucide-react";

import { ExternalIcon, PageHeading, Reveal, Section } from "@/components/portfolio-ui";
import { TiltSurface } from "@/components/tilt-surface";
import { certifications } from "@/data/portfolio";
import { makeHead } from "@/lib/head";

export const Route = createFileRoute("/certifications")({
  head: makeHead(
    "Certifications",
    "Professional credentials earned by Amjad Azward across AI, cloud, databases, and software engineering.",
    "/certifications",
  ),
  component: Certifications,
});

function issuerMark(issuer: string) {
  return issuer
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 3)
    .toUpperCase();
}

function Certifications() {
  return (
    <Section>
      <PageHeading
        index="03"
        eyebrow="CERTIFICATIONS"
        title="Always Learning"
        ghost="VALIDATED"
        description="Selected credentials that reflect a habit of deliberate, continuous growth."
      />

      <Reveal>
        <section className="cert-overview" aria-labelledby="cert-overview-title">
          <div className="cert-overview-copy">
            <p className="eyebrow">CREDENTIAL LIBRARY / 2026</p>
            <h2 id="cert-overview-title">Proof of a learning habit.</h2>
            <p>
              Focused study across software engineering, artificial intelligence, cloud systems,
              networking, and data - validated by recognized technology organizations.
            </p>
          </div>

          <dl className="cert-metrics">
            <div>
              <Award aria-hidden />
              <dt>Credentials</dt>
              <dd>150+</dd>
            </div>
            <div>
              <Building2 aria-hidden />
              <dt>Issuers</dt>
              <dd>20+</dd>
            </div>
            <div>
              <CalendarDays aria-hidden />
              <dt>Latest cycle</dt>
              <dd>2026</dd>
            </div>
          </dl>
        </section>
      </Reveal>

      <section className="cert-browser" aria-labelledby="cert-browser-title">
        <header className="cert-browser-header">
          <div>
            <p className="eyebrow">BROWSE THE COLLECTION</p>
            <h2 id="cert-browser-title">Credential collection</h2>
          </div>
          <p>{String(certifications.length).padStart(2, "0")} credentials</p>
        </header>

        <div className="cert-grid">
          {certifications.map((certificate, index) => (
            <Reveal key={certificate.title} delay={(index % 3) * 0.05} className="tilt-reveal">
              <TiltSurface className="cert-tilt" intensity={5.5}>
                <article className="cert-card">
                  <span className="cert-hologram" aria-hidden />
                  <div className="cert-card-media">
                    <img
                      src={certificate.image}
                      alt=""
                      aria-hidden
                      loading="lazy"
                      decoding="async"
                      fetchPriority="low"
                    />
                    <span className="cert-card-index" aria-hidden>
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="cert-issuer-mark" aria-hidden>
                      {issuerMark(certificate.issuer ?? "Credential")}
                    </span>
                  </div>

                  <div className="cert-card-body">
                    <div className="cert-card-meta">
                      <span>{certificate.issuer}</span>
                      <span>{certificate.year}</span>
                    </div>
                    <h3>{certificate.title}</h3>
                    <a href={certificate.verify} target="_blank" rel="noreferrer">
                      Verify credential
                      <ExternalIcon />
                    </a>
                  </div>
                </article>
              </TiltSurface>
            </Reveal>
          ))}
        </div>
      </section>

      <Reveal>
        <aside className="page-end-cta">
          <div>
            <BookOpenCheck aria-hidden />
            <div>
              <p className="eyebrow">CONTINUOUSLY UPDATED</p>
              <h2>There is always more to learn.</h2>
            </div>
          </div>
          <a href="https://www.linkedin.com/in/amjadazward" target="_blank" rel="noreferrer">
            Browse every credential
            <ExternalIcon />
          </a>
        </aside>
      </Reveal>
    </Section>
  );
}
