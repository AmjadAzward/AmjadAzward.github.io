import { createFileRoute } from "@tanstack/react-router";
import {
  Award,
  Briefcase,
  FolderKanban,
  GraduationCap,
  MapPin,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

import {
  ActionLink,
  CountUp,
  DownloadIcon,
  PageHeading,
  Reveal,
  Section,
} from "@/components/portfolio-ui";
import { education, experience, stats } from "@/data/portfolio";
import { makeHead } from "@/lib/head";

export const Route = createFileRoute("/about")({
  head: makeHead(
    "About",
    "Meet Amjad Azward, a software engineering and data science undergraduate building practical digital products.",
    "/about",
  ),
  component: About,
});

const statDetails = [
  { note: "Ideas turned into working products", icon: FolderKanban },
  { note: "Credentials across modern technology", icon: Award },
  { note: "Consistent academic performance", icon: GraduationCap },
  { note: "Freelance and internship experience", icon: Briefcase },
];

function Timeline({
  title,
  label,
  items,
  icon: Icon,
  type,
}: {
  title: string;
  label: string;
  items: typeof education;
  icon: LucideIcon;
  type: "education" | "experience";
}) {
  return (
    <section
      className="timeline-section"
      data-type={type}
      aria-labelledby={`${type}-timeline-heading`}
    >
      <header className="timeline-section-header">
        <span className="timeline-section-icon">
          <Icon size={18} aria-hidden />
        </span>
        <div>
          <p className="eyebrow">{label}</p>
          <h3 id={`${type}-timeline-heading`}>{title}</h3>
        </div>
        <span className="timeline-section-count">{String(items.length).padStart(2, "0")}</span>
      </header>

      <ol className="timeline-list">
        {items.map((item, index) => (
          <li className="timeline-list-item" key={item.title}>
            <Reveal delay={index * 0.08}>
              <article className="timeline-entry">
                <span className="timeline-node" aria-hidden>
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="timeline-body">
                  <p className="timeline-date">{item.date}</p>
                  <h4 className="timeline-title">{item.title}</h4>
                  <p className="timeline-place">{item.place}</p>
                </div>
              </article>
            </Reveal>
          </li>
        ))}
      </ol>
    </section>
  );
}

function About() {
  return (
    <Section>
      <PageHeading
        index="01"
        eyebrow="ABOUT"
        title="Who I Am"
        ghost="CURIOUS"
        description="A curious software engineer and data science undergraduate, learning by building products that solve real problems."
      />

      <Reveal>
        <section className="about-profile" aria-labelledby="about-profile-title">
          <div className="about-profile-copy">
            <div className="about-profile-intro">
              <p className="eyebrow">PROFILE / 01</p>
              <h2 id="about-profile-title">
                Building where <span>software</span> meets intelligence.
              </h2>
            </div>

            <div className="about-profile-details">
              <p className="about-profile-lead">
                I’m a third-year Computer Science undergraduate at NIBM, affiliated with Coventry
                University, currently freelancing as a software developer and gaining industry
                experience through AI-enabled engineering internships.
              </p>
              <p className="about-profile-supporting">
                My work moves across web, mobile, cloud, and machine learning - with a practical
                focus on creating useful systems, learning quickly, and improving every iteration.
              </p>

              <ul className="about-profile-facts" aria-label="Profile details">
                <li>
                  <MapPin aria-hidden />
                  Colombo, Sri Lanka
                </li>
                <li>
                  <Sparkles aria-hidden />
                  Software + data
                </li>
              </ul>

              <div className="about-actions">
                <ActionLink to="/portfolio">View Portfolio</ActionLink>
                <ActionLink to="/cv.pdf" variant="outline" download>
                  <DownloadIcon />
                  Download CV
                </ActionLink>
              </div>
            </div>
          </div>
        </section>
      </Reveal>

      <section className="about-stats" aria-labelledby="about-stats-title">
        <h2 id="about-stats-title" className="sr-only">
          Selected achievements
        </h2>
        {stats.map((stat, index) => {
          const detail = statDetails[index] ?? statDetails[0]!;
          const Icon = detail.icon;

          return (
            <Reveal key={stat.label} delay={index * 0.06}>
              <article className="about-stat-card">
                <div className="about-stat-topline">
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <Icon aria-hidden />
                </div>
                <p className="about-stat-value">
                  <CountUp value={stat.value} suffix={stat.suffix} />
                </p>
                <h3>{stat.label}</h3>
                <p>{detail.note}</p>
              </article>
            </Reveal>
          );
        })}
      </section>

      <Reveal>
        <header className="about-journey-heading">
          <div>
            <p className="eyebrow">THE JOURNEY SO FAR</p>
            <h2>Learning by building.</h2>
          </div>
          <p>
            Formal study gives me the foundation. Real projects, teams, and responsibilities turn
            that foundation into practical experience.
          </p>
        </header>
      </Reveal>

      <div className="about-timelines">
        <Timeline
          title="Education"
          label="Foundation"
          items={education}
          icon={GraduationCap}
          type="education"
        />
        <Timeline
          title="Experience"
          label="In practice"
          items={experience}
          icon={Briefcase}
          type="experience"
        />
      </div>
    </Section>
  );
}
