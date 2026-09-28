import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig(({ command }) => {
  const base = process.env["VITE_BASE_PATH"] || "/";

  return {
    base,
    server: {
      host: "::",
      port: 8080,
    },
    resolve: {
      dedupe: ["react", "react-dom", "@tanstack/react-query", "@tanstack/query-core"],
      tsconfigPaths: true,
    },
    plugins: [
      tailwindcss(),
      tanstackStart({
        spa: {
          enabled: true,
          prerender: {
            crawlLinks: true,
          },
        },
        prerender: {
          failOnError: false,
        },
        importProtection: {
          behavior: "error",
          client: {
            files: ["**/server/**"],
            specifiers: ["server-only"],
          },
        },
      }),
      viteReact(),
    ],
  };
});
