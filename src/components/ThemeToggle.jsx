import { useEffect, useState } from "react";

export default function ThemeToggle() {
    const [theme, setTheme] = useState(() => {
        try {
            return localStorage.getItem("theme") || "dark";
        } catch {
            return "dark";
        }
    });

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
        try {
            localStorage.setItem("theme", theme);
        } catch {
            // storage unavailable, theme still applies for this session
        }
    }, [theme]);

    return (
        <button
            className="theme-toggle"
            aria-label="Toggle color theme"
            type="button"
            onClick={() => setTheme((t) => (t === "light" ? "dark" : "light"))}
        >
            <i className={theme === "light" ? "fa-solid fa-moon" : "fa-solid fa-sun"}></i>
        </button>
    );
}
