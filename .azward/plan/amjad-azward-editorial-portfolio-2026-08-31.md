# Amjad Azward Editorial Portfolio

## Build
- Replace the placeholder with a seven-route portfolio: Home, About, Skills, Certifications, Services, Portfolio, and Contact.
- Add a shared editorial-tech shell with sticky responsive navigation, active accent underline, full-screen mobile menu, persisted dark/light theme, first-load monogram preloader, route transitions, footer, and scroll restoration.
- Create reusable section, reveal, button, card, page-heading, and social-link components, using semantic design tokens and thin-line visual language.

## Content and interaction
- Keep editable portfolio content in typed `src/data` modules, including timeline, skills, certifications, services, projects, navigation, and social links.
- Build the cinematic home stage, animated stats/timelines, draggable skill rows, certification/service/project grids, and validated Formspree contact flow with loading/success/error states.
- Add accessible local placeholder artwork for the portrait, certificates, and projects, plus a placeholder CV download.

## Technical details
- Use the project’s TanStack Router architecture (the supported React router for this Vite app), React 19, TypeScript, Tailwind CSS v4, Lucide, and Motion for React.
- Load Sora and Inter through root head links; define the supplied dark/light palette, spacing, typography, borders, and focus styles as global semantic tokens.
- Add route-specific SEO metadata, responsive/reduced-motion behavior, and verify all routes at desktop and mobile sizes with no runtime console errors.
