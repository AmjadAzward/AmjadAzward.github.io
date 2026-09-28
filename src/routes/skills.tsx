import { createFileRoute } from "@tanstack/react-router";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";
import { useState, type ComponentType, type KeyboardEvent } from "react";

import { PageHeading, Reveal, Section } from "@/components/portfolio-ui";
import { skillGroups } from "@/data/portfolio";
import { makeHead } from "@/lib/head";

export const Route = createFileRoute("/skills")({
  head: makeHead(
    "Technical Skills",
    "Explore Amjad's software engineering, cloud, database, and data science capabilities.",
    "/skills",
  ),
  component: Skills,
});

const groupDescriptions: Record<string, string> = {
  "Languages & Concepts":
    "Programming foundations, architectural thinking, and the patterns behind software that stays maintainable.",
  "Web & Backend":
    "The interface and server toolkit I use to build fast, accessible products from browser to API.",
  "Databases, Cloud & Tools":
    "Platforms and workflows for structuring data, shipping services, and keeping delivery dependable.",
  Other:
    "Supporting capabilities that connect engineering with product thinking, design, insight, and delivery.",
};

const categoryLabels = ["CODE", "WEB", "DATA", "SHIP"];

function tabId(index: number) {
  return `skill-category-${index}`;
}

function panelId(index: number) {
  return `skill-panel-${index}`;
}

function CapabilityOrbit({
  activeIndex,
  icon: ActiveIcon,
}: {
  activeIndex: number;
  icon: ComponentType<{ strokeWidth?: number }> | undefined;
}) {
  const reduce = useReducedMotion() ?? false;
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const rotateX = useSpring(useTransform(pointerY, [-1, 1], [9, -9]), {
    stiffness: 150,
    damping: 20,
  });
  const rotateY = useSpring(useTransform(pointerX, [-1, 1], [-11, 11]), {
    stiffness: 150,
    damping: 20,
  });
  const lightX = useTransform(pointerX, [-1, 1], ["-30%", "30%"]);
  const lightY = useTransform(pointerY, [-1, 1], ["-30%", "30%"]);

  return (
    <div className="skills-orbit-scene">
      <motion.div
        className="skills-orbit"
        onPointerMove={(event) => {
          if (reduce || event.pointerType !== "mouse") return;
          const bounds = event.currentTarget.getBoundingClientRect();
          pointerX.set(((event.clientX - bounds.left) / bounds.width - 0.5) * 2);
          pointerY.set(((event.clientY - bounds.top) / bounds.height - 0.5) * 2);
        }}
        onPointerLeave={() => {
          pointerX.set(0);
          pointerY.set(0);
        }}
        style={{
          rotateX: reduce ? 0 : rotateX,
          rotateY: reduce ? 0 : rotateY,
          transformStyle: "preserve-3d",
        }}
        aria-hidden
      >
        <motion.span
          className="skills-orbit-light"
          style={{ x: reduce ? 0 : lightX, y: reduce ? 0 : lightY }}
        />
        <span className="skills-orbit-ring skills-orbit-ring-outer" />
        <span className="skills-orbit-ring skills-orbit-ring-inner" />
        <span className="skills-orbit-axis skills-orbit-axis-x" />
        <span className="skills-orbit-axis skills-orbit-axis-y" />
        <div className="skills-orbit-core">
          {ActiveIcon && <ActiveIcon strokeWidth={1.25} />}
          <span>{categoryLabels[activeIndex]}</span>
        </div>
        {categoryLabels.map((label, index) => (
          <span key={label} className="skills-orbit-node" data-position={index + 1}>
            {label}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

function Skills() {
  const [activeIndex, setActiveIndex] = useState(0);
  const reduce = useReducedMotion() ?? false;
  const activeGroup = skillGroups[activeIndex] ?? skillGroups[0];
  const totalSkills = skillGroups.reduce((total, group) => total + group.items.length, 0);

  if (!activeGroup) return null;

  const ActiveIcon = activeGroup.items[0]?.icon;

  function selectCategory(index: number, focus = false) {
    const nextIndex = (index + skillGroups.length) % skillGroups.length;
    setActiveIndex(nextIndex);

    if (focus) {
      requestAnimationFrame(() => document.getElementById(tabId(nextIndex))?.focus());
    }
  }

  function handleCategoryKeys(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      selectCategory(index + 1, true);
    }

    if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      selectCategory(index - 1, true);
    }

    if (event.key === "Home") {
      event.preventDefault();
      selectCategory(0, true);
    }

    if (event.key === "End") {
      event.preventDefault();
      selectCategory(skillGroups.length - 1, true);
    }
  }

  return (
    <Section>
      <PageHeading
        index="02"
        eyebrow="SKILLS"
        title="Technical Skills"
        ghost="CAPABILITY"
        description="A practical toolkit shaped by projects, problem-solving, and continuous learning."
      />

      <Reveal>
        <section className="skills-command" aria-labelledby="skills-command-title">
          <div className="skills-command-copy">
            <p className="eyebrow">MY WORKING TOOLKIT</p>
            <h2 id="skills-command-title">From an idea to a shipped product.</h2>
            <p>
              I combine software fundamentals, product engineering, data, and delivery tools to
              solve the whole problem - not just one layer of it.
            </p>

            <div className="skills-metrics" aria-label="Skills overview">
              <div>
                <strong>{String(totalSkills).padStart(2, "0")}</strong>
                <span>Practiced skills</span>
              </div>
              <div>
                <strong>{String(skillGroups.length).padStart(2, "0")}</strong>
                <span>Core disciplines</span>
              </div>
              <div className="skills-learning-status">
                <i aria-hidden />
                <span>Always evolving</span>
              </div>
            </div>
          </div>

          <CapabilityOrbit activeIndex={activeIndex} icon={ActiveIcon} />
        </section>
      </Reveal>

      <Reveal delay={0.08}>
        <section className="skills-workbench" aria-label="Technical skill categories">
          <div className="skills-category-nav" role="tablist" aria-label="Choose a skill category">
            <div className="skills-category-nav-label">
              <span>Explore by discipline</span>
              <span>{String(activeIndex + 1).padStart(2, "0")} / 04</span>
            </div>

            {skillGroups.map((group, index) => {
              const CategoryIcon = group.items[0]?.icon;

              return (
                <button
                  key={group.title}
                  id={tabId(index)}
                  type="button"
                  role="tab"
                  aria-selected={activeIndex === index}
                  aria-controls={panelId(index)}
                  tabIndex={activeIndex === index ? 0 : -1}
                  className="skills-category-tab"
                  onClick={() => selectCategory(index)}
                  onKeyDown={(event) => handleCategoryKeys(event, index)}
                >
                  <span className="skills-category-symbol" aria-hidden>
                    {CategoryIcon && <CategoryIcon strokeWidth={1.45} />}
                  </span>
                  <span className="skills-category-copy">
                    <span className="skills-category-index">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="skills-category-name">{group.title}</span>
                  </span>
                  <span className="skills-category-count">
                    {String(group.items.length).padStart(2, "0")}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="skills-panel-shell">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={activeGroup.title}
                id={panelId(activeIndex)}
                role="tabpanel"
                aria-labelledby={tabId(activeIndex)}
                initial={reduce ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6 }}
                transition={{ duration: reduce ? 0.01 : 0.42, ease: [0.16, 1, 0.3, 1] }}
                className="skills-panel"
              >
                <header className="skills-panel-header">
                  <div className="skills-panel-icon">
                    {ActiveIcon && <ActiveIcon strokeWidth={1.35} aria-hidden />}
                  </div>
                  <div>
                    <p className="eyebrow">DISCIPLINE {String(activeIndex + 1).padStart(2, "0")}</p>
                    <h2>{activeGroup.title}</h2>
                    <p>{groupDescriptions[activeGroup.title]}</p>
                  </div>
                  <span className="skills-panel-count">
                    {activeGroup.items.length}
                    <small>skills</small>
                  </span>
                </header>

                <div className="skills-grid">
                  {activeGroup.items.map((skill, index) => (
                    <motion.article
                      key={skill.name}
                      initial={reduce ? false : { opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: reduce ? 0.01 : 0.46,
                        delay: reduce ? 0 : index * 0.035,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                      className="skill-row"
                    >
                      <span className="skill-card-index" aria-hidden>
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <div className="skill-card-topline">
                        <span className="skill-card-icon">
                          <skill.icon strokeWidth={1.45} aria-hidden />
                        </span>
                        <span className="skill-card-level">{skill.level}%</span>
                      </div>
                      <h3>{skill.name}</h3>
                      <p>{skill.description}</p>
                      <div className="skill-progress-row">
                        <span>Working confidence</span>
                        <div
                          className="skill-progress-track"
                          role="progressbar"
                          aria-label={`${skill.name} working confidence`}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-valuenow={skill.level}
                        >
                          <motion.span
                            initial={reduce ? { scaleX: 1 } : { scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{
                              duration: reduce ? 0.01 : 0.8,
                              delay: reduce ? 0 : 0.12 + index * 0.03,
                              ease: [0.16, 1, 0.3, 1],
                            }}
                            style={{ width: `${skill.level}%` }}
                          />
                        </div>
                      </div>
                    </motion.article>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </section>
      </Reveal>
    </Section>
  );
}
