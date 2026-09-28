# Amjad Azward Portfolio

Build a world-class personal portfolio for a Software Engineering & Data Science undergraduate named Amjad Azward. Use React (Vite) + React Router + TypeScript + Tailwind CSS + Framer Motion. This should feel like the personal site of a senior product designer — restrained, confident, and distinctive — not a template.

Art direction (this is the important part — do not make it generic)

Design language: "Editorial tech." A dark, cinematic canvas with generous negative space, oversized typography as the hero element, and a single restrained accent. Think Awwwards "Site of the Day," not a Bootstrap dashboard.

Palette: near-black base #08090d with a subtle warm-to-cool gradient (#08090d → #0c0e14). One primary accent: electric sky #38bdf8, used sparingly (links, active states, key words). Secondary accents teal #2dd4bf and soft indigo #818cf8 — for micro-details only, never as fills. Text is off-white #e8eaf0, muted text #8b90a0.

Light theme: warm paper white #faf9f7 background, ink #12141c text, same accents but slightly deeper for contrast. Persist theme choice in localStorage; dark is default.

Typography: headings in Sora (geometric, tight tracking, heavy weights up to 700), body in Inter. Use a genuinely large type scale — hero display should be clamp(3rem, 12vw, 11rem). Let headings breathe.

Layout system: a consistent max-width container (~1200px), an 8pt spacing grid, and a fine 1px hairline border language (rgba(255,255,255,0.08)). Avoid heavy card shadows; prefer thin borders + subtle inner glow on hover.

Motion: everything reveals on scroll (fade + 20px rise, staggered children, Framer Motion whileInView). Buttons and cards have a soft hover lift and a 200ms ease. A custom cursor is optional but a nice touch on desktop. Respect prefers-reduced-motion and disable transforms when set.

Signature details: a thin animated gradient line under the active nav item; a faint dotted/grid texture or noise overlay on the hero; oversized ghost background words behind sections; monospaced labels (e.g. 01 — ABOUT) as section eyebrows.

Do not use stock gradients-on-everything, glassmorphism blur cards, or emoji icons. Use Lucide icons only, thin stroke.

Global chrome

Sticky header with a small logo mark ("AA" monogram, links home) and nav: Home · About · Skills · Certifications · Services · Portfolio · Contact. Active route gets the accent underline. On mobile, a hamburger opens a full-screen overlay nav with large stacked links and a row of social icons (LinkedIn, GitHub, Facebook, X, Instagram).

Theme toggle (sun/moon), persisted.

Preloader: minimal — the "AA" monogram drawing itself in, ~800ms, then fades. Only on first load.

Footer: hairline top border, left = "© 2026 Amjad Azward — Portfolio.", right = social icons.

Route change scrolls to top with a smooth fade transition between pages.

Fully responsive (360px → 1440px+). Accessible: semantic HTML, keyboard-focusable nav, visible focus rings, alt text.

Page 1 — Home /

A full-height "stage," not a stock hero:

Monospaced kicker: DATA SCIENCE

A giant ghost background word: "Undergraduate", clipped at low opacity behind the content.

Centered circular profile photo with a thin accent ring.

A small pill/bubble tag above the heading: "Welcome to My Portfolio".

Heading: "Explore my work, skills, and experience as a Software Engineering & Data Science undergraduate."

Subtext: "Crafting practical, real-world solutions across web, cloud, and machine learning."

Three CTAs: Hire Me (primary, → /contact) · Download CV (downloads a PDF) · GitHub Profile (external, opens GitHub in new tab).

A subtle scroll-down indicator at the bottom.

Page 2 — About /about

Eyebrow 01 — ABOUT, heading "Who I Am", sub: "IT undergraduate and machine learning enthusiast, gaining hands-on experience through real-world projects and certifications."

Bio: "Third-year Computer Science undergraduate at NIBM (Coventry University), currently freelancing as a software developer and interning in AI-enabled engineering — building web, mobile, and machine learning projects along the way."

Actions: Download CV, View Portfolio (→ /portfolio).

Stats strip (animated count-up on scroll): 30+ Projects Built · 160+ Certifications · 3.87 CGPA · 3 Roles Held.

Two-column timeline with a vertical connector line and accent nodes:

Education

BSc (Hons) Computer Science with Data Science — NIBM (Coventry University, BSc Year 03), Sri Lanka · Nov 2023 – Present

G.C.E Advanced Level (Math Stream) — Royal College, Colombo 07 · 2022

Experience

Freelancer – Software Developer @ Spark Solutions · Mar 2025 – Present

Remote Intern, AI Enabled Software Engineer @ SoftwarePlus Pvt Ltd · Nov 2025 – Jan 2026

Intern Software Developer @ FitsExpress Pvt Ltd · Nov 2025 – Present

Page 3 — Skills /skills

Heading "Technical Skills", eyebrow 02 — SKILLS. Four categories. Each skill is a card with a Lucide icon, label, category tag, one-line description, and a thin animated proficiency bar (values 74–95%). Present each category as a horizontally scrollable carousel (arrow controls + drag on touch), or a responsive grid on small screens.

Languages & Concepts (12): OOP, SDLC, Design Patterns, Java, C, C#, Python, JavaScript, PHP, SQL, PL/SQL, R

Web & Backend (5): HTML, CSS, React, Node.js, REST APIs

Databases, Cloud & Tools (11): AWS, MySQL, Oracle, SQLite, MongoDB, Firebase, Postman, Git, VS Code, IntelliJ, Android Studio

Other (5): Project Management, ML Basics, PowerBI, Figma, Apache Hop

Page 4 — Certifications /certifications

Eyebrow 03 — CERTIFICATIONS. Responsive grid of certificate cards: badge/image placeholder, title, issuer • year, and a "Verify Certificate" external link.

AI/ML Engineer Stage 2 — SLIIT · 2025

Software Engineer Certificate — HackerRank · 2025

DevNet Associate — Cisco · 2025

LFS158: Intro to Kubernetes — Linux Foundation · 2025

IT Essentials — Cisco · 2025

Oracle Certified Foundations Associate — Oracle · 2025

Oracle Certified Generative AI Professional — Oracle · 2025

SQL Advanced — HackerRank · 2025

R Intermediate — HackerRank · 2025

Trailing CTA: "Browse more on LinkedIn." (external link).

Page 5 — Services /services

Eyebrow 04 — SERVICES. Six cards, each with a large muted number (01–06), Lucide icon, title, one-line description, and small tech tags:

Mobile App Development — Android Studio, React Native, Firebase

Web Development — React.js, Node.js

Desktop Applications — C#, Java, Electron

AI & Machine Learning — Python, TensorFlow

IoT & Robotics — Embedded Systems, Sensors

Data Analytics — Power BI, SQL

Page 6 — Portfolio /portfolio

Eyebrow 05 — WORK. Nine project cards: screenshot placeholder (16:9), a small tag, title, one-line description, and a GitHub link. Cards lift and reveal the link on hover.

Mind Map Builder

Complaint ChainLK

Detectify — YOLOv5 object detection

MedSynora — healthcare data warehouse

Tuition Hub — Android app

Car Rent Management System

SPICE WORLD — wholesale spice business app

Online Recipe Collection System

Urban Food — e-commerce

Trailing CTA: "Browse more on GitHub." (external link).

Page 7 — Contact /contact

Eyebrow 06 — CONTACT. Two-column layout:

Contact form: Name, Email, Subject, Message. Submit via AJAX POST to a Formspree endpoint (leave https://formspree.io/f/your-id as a placeholder). Show a "Sending…" button state, an inline success toast on 200, and an error alert on failure. Validate required fields.

"Let's Connect" card: a short blurb inviting collaboration, plus social links — LinkedIn, GitHub, Facebook, X/Twitter, Instagram.

Data & assets

Keep all page content in typed data files (/src/data/*.ts) so it's easy to edit. Use placeholder images (solid tinted blocks or /public placeholders) for the profile photo, project screenshots, and certificate badges; add clear TODO alt text. Wire these handles:

GitHub: https://github.com/AmjadAzward

LinkedIn: https://www.linkedin.com/in/amjadazward

CV: link a /public/cv.pdf placeholder for the Download CV buttons.

Deliverable quality bar

Clean component structure, reusable Section, Card, Button, and Reveal components, a single Tailwind theme config holding the palette and fonts, no console errors, and a build that runs. Prioritize typography, spacing, and motion polish over feature count — this should look intentional and expensive.

## Project ownership

Designed and developed by Amjad Azward as a personal portfolio for software engineering, data,
cloud, and machine learning work.

## GitHub Pages deployment

Pushes to the `main` branch automatically build and publish the portfolio through GitHub Pages.
The deployment workflow supports both repository sites and `username.github.io` sites.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
