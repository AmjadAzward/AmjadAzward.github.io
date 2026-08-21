import { useEffect } from "react";

// Re-implements the IntersectionObserver-based entrance animation from the
// old script.js. Each page calls this once on mount so the .reveal/.reveal-pop/
// .reveal-left/.reveal-scale elements it just rendered get observed fresh.
export default function useScrollReveal() {
    useEffect(() => {
        const revealSelector = ".reveal, .reveal-pop, .reveal-left, .reveal-scale";
        const revealEls = document.querySelectorAll(revealSelector);
        const revealClasses = ["reveal", "reveal-pop", "reveal-left", "reveal-scale", "show"];

        function settle(el) {
            el.classList.remove(...revealClasses);
        }

        if (!("IntersectionObserver" in window)) {
            revealEls.forEach((el) => {
                el.classList.add("show");
                settle(el);
            });
            return;
        }

        const observer = new IntersectionObserver(
            (entries, obs) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const el = entry.target;
                        el.classList.add("show");
                        obs.unobserve(el);
                        setTimeout(() => settle(el), 900);
                    }
                });
            },
            { threshold: 0.15 }
        );

        revealEls.forEach((el) => observer.observe(el));

        return () => observer.disconnect();
    }, []);
}
