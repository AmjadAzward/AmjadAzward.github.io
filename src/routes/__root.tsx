import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import tabIcon from "../../img/tab-circle.svg?url";
import appCss from "../styles.css?url";
import { reportAppError } from "../lib/app-error-reporting";
import { AppShell } from "../components/portfolio-ui";

function NotFoundComponent() {
  return (
    <section className="system-page" aria-labelledby="not-found-title">
      <div className="system-page-panel">
        <p className="eyebrow">ERROR / 404</p>
        <span className="system-page-code" aria-hidden>
          404
        </span>
        <h1 id="not-found-title">This route went off grid.</h1>
        <p>The page you're looking for doesn't exist or has been moved.</p>
        <div className="system-page-actions">
          <Link to="/" className="system-primary-action">
            Return home
          </Link>
        </div>
      </div>
    </section>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  useEffect(() => {
    reportAppError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <section className="system-page" aria-labelledby="error-title">
      <div className="system-page-panel">
        <p className="eyebrow">SYSTEM / RETRY</p>
        <span className="system-page-code" aria-hidden>
          !
        </span>
        <h1 id="error-title">This page didn't load.</h1>
        <p>Something went wrong on our end. You can try refreshing or head back home.</p>
        <div className="system-page-actions">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="system-primary-action"
          >
            Try again
          </button>
          <a href="/" className="system-secondary-action">
            Go home
          </a>
        </div>
      </div>
    </section>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Amjad Azward - Portfolio" },
      {
        name: "description",
        content: "Software engineering and data science portfolio of Amjad Azward.",
      },
      { name: "author", content: "Amjad Azward" },
      { property: "og:site_name", content: "Amjad Azward Portfolio" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: tabIcon, type: "image/svg+xml" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Manrope:wght@400..800&family=Space+Grotesk:wght@500..700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              'try{document.documentElement.classList.toggle("dark",localStorage.getItem("aa-theme")!=="light")}catch{}',
          }}
        />
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <AppShell>
        <Outlet />
      </AppShell>
    </QueryClientProvider>
  );
}
