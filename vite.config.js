import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// AmjadAzward.github.io is a user/organization GitHub Pages site served
// from the domain root, so the base path stays "/".
export default defineConfig({
    base: "/",
    plugins: [react()],
});
