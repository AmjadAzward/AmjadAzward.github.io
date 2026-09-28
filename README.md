# Amjad Azward - Personal Portfolio

A modern, responsive portfolio showcasing my work across software engineering, data science, cloud technologies, and machine learning.

[View the live portfolio](https://amjadazward.github.io/azward-portfolio/) | [Visit my GitHub profile](https://github.com/AmjadAzward)

## Overview

This portfolio presents my projects, technical skills, certifications, services, education, and professional experience in a polished editorial-style interface. It supports both light and dark themes and is designed to work smoothly across desktop and mobile devices.

## Pages

- **Home** - Introduction and featured profile content
- **About** - Background, education, and professional experience
- **Skills** - Technical capabilities organized by discipline
- **Certifications** - Credentials and verification links
- **Services** - Development and technology services
- **Portfolio** - Selected software and data projects
- **Contact** - Contact details and social profiles

## Highlights

- Responsive layouts for mobile, tablet, and desktop
- Light and dark themes with saved preferences
- Accessible navigation and visible focus states
- Smooth transitions and motion with reduced-motion support
- Optimized project and certification imagery
- Static route generation for reliable GitHub Pages hosting
- Automatic deployment whenever `main` is updated

## Built With

- [React 19](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [TanStack Router](https://tanstack.com/router)
- [TanStack Start](https://tanstack.com/start)
- [Vite](https://vite.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Motion](https://motion.dev/)
- [Lucide React](https://lucide.dev/)
- [Bun](https://bun.sh/)

## Getting Started

### Prerequisites

Install [Bun](https://bun.sh/docs/installation) before running the project locally.

### Installation

```bash
git clone https://github.com/AmjadAzward/azward-portfolio.git
cd azward-portfolio
bun install
```

### Development

```bash
bun run dev
```

Open the local address displayed in the terminal.

### Production Build

```bash
bun run build
```

### Preview the Build

```bash
bun run preview
```

## Available Scripts

| Command             | Description                                   |
| ------------------- | --------------------------------------------- |
| `bun run dev`       | Start the local development server            |
| `bun run build`     | Create a production build                     |
| `bun run preview`   | Preview the production build locally          |
| `bun run lint`      | Check the project with ESLint                 |
| `bun run typecheck` | Check TypeScript without creating build files |
| `bun run format`    | Format the codebase with Prettier             |

## Project Structure

```text
src/
|-- components/    Reusable interface components
|-- data/          Portfolio content and profile data
|-- hooks/         Shared React hooks
|-- lib/           Utilities and application helpers
|-- routes/        Page routes
`-- styles.css     Global styles and design tokens

public/            Static assets, profile image, favicon, and CV
.github/workflows/ GitHub Pages deployment workflow
```

## CI/CD and Deployment

GitHub Actions runs the workflow in `.github/workflows/deploy-pages.yml`:

- Pull requests targeting `main` run dependency installation, linting, type-checking, and a production build.
- Pushes to `main` run the same quality checks before deploying to GitHub Pages.
- Failed checks prevent deployment.
- Dependency caching and concurrency controls keep repeat runs efficient and prevent outdated deployments.
- The workflow can also be started manually from the GitHub Actions page.

Live site: [amjadazward.github.io/azward-portfolio](https://amjadazward.github.io/azward-portfolio/)

## Connect

- [LinkedIn](https://www.linkedin.com/in/amjadazward)
- [GitHub](https://github.com/AmjadAzward)
- [X](https://x.com/AmjadAzward)
- [Instagram](https://www.instagram.com/amjadazward/)
- [Facebook](https://www.facebook.com/people/Amjad-Azward/pfbid0p75bKuomqfx8QvpRjKN4XQdVfdhoTByrqZcwuYqXtgCLPanQz2LR6Mc1e5zBLmo1l/)

## Author

Designed and developed by **Amjad Azward**.
