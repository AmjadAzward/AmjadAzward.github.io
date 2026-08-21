# AmjadAzward.github.io

Personal portfolio site, built as a React single-page app with Vite and React Router.

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build   # outputs to dist/
npm run preview # serve the production build locally
```

## Deployment

Pushes to `main` build and deploy automatically to GitHub Pages via
`.github/workflows/deploy.yml`. In the repo's **Settings → Pages**, set
"Source" to **GitHub Actions** for this to take effect.

`public/404.html` plus the redirect-restoring script in `index.html` make
client-side routes (e.g. `/about`) work correctly on GitHub Pages, which has
no server-side rewrites.
