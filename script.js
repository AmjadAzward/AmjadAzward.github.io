// Light / dark theme toggle
(function () {
    const root = document.documentElement;
    const toggleBtn = document.getElementById("themeToggle");
    if (!toggleBtn) return;
    const icon = toggleBtn.querySelector("i");

    function applyTheme(theme) {
        root.setAttribute("data-theme", theme);
        localStorage.setItem("theme", theme);
        icon.className = theme === "light" ? "fa-solid fa-moon" : "fa-solid fa-sun";
    }

    applyTheme(localStorage.getItem("theme") || "dark");

    toggleBtn.addEventListener("click", () => {
        const current = root.getAttribute("data-theme");
        applyTheme(current === "light" ? "dark" : "light");
    });
})();

const navToggle = document.getElementById("navToggle");
const navLinks = document.getElementById("navLinks");

navToggle.addEventListener("click", () => {
    navLinks.classList.toggle("open");
    navToggle.classList.toggle("active");
    document.body.classList.toggle("nav-open");
});

navLinks.addEventListener("click", (e) => {
    if (e.target.tagName === "A") {
        navLinks.classList.remove("open");
        navToggle.classList.remove("active");
        document.body.classList.remove("nav-open");
    }
});

function initScrollReveal() {
    const revealSelector = ".reveal, .reveal-pop, .reveal-left, .reveal-scale";
    const revealEls = document.querySelectorAll(revealSelector);
    const revealClasses = ["reveal", "reveal-pop", "reveal-left", "reveal-scale", "show"];

    function settle(el) {
        // Once the entrance transition finishes, drop the reveal classes so
        // components' own hover/idle styles (e.g. skill-tile, bento-tile)
        // fully take over again without any lingering transition-delay.
        el.classList.remove(...revealClasses);
    }

    if (!("IntersectionObserver" in window)) {
        revealEls.forEach(el => { el.classList.add("show"); settle(el); });
        return;
    }

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                el.classList.add("show");
                obs.unobserve(el);
                setTimeout(() => settle(el), 900);
            }
        });
    }, { threshold: 0.15 });

    revealEls.forEach(el => observer.observe(el));
}

window.addEventListener("load", () => {
    const preloader = document.getElementById("preloader");
    document.body.classList.remove("preloader-lock");

    if (preloader) {
        setTimeout(() => {
            preloader.classList.add("hide");
        }, 400);
    }

    initScrollReveal();
});

// ✅ Custom Formspree handler with success message box (no redirect)
(function () {
    const form = document.getElementById("contactForm");
    const successBox = document.getElementById("formSuccess");
    const successOk = document.getElementById("formSuccessOk");
    let successTimer = null;

    if (!form || !successBox || !successOk) return;

    function showSuccessBox() {
        successBox.classList.add("show");
        successBox.setAttribute("aria-hidden", "false");

        // Auto-hide after 3 seconds
        if (successTimer) clearTimeout(successTimer);
        successTimer = setTimeout(() => {
            hideSuccessBox();
        }, 3000);
    }

    function hideSuccessBox() {
        successBox.classList.remove("show");
        successBox.setAttribute("aria-hidden", "true");
        if (successTimer) {
            clearTimeout(successTimer);
            successTimer = null;
        }
    }

    successOk.addEventListener("click", () => {
        hideSuccessBox();
    });

    form.addEventListener("submit", async (e) => {
        e.preventDefault(); // prevent default redirect to Formspree UI

        const formData = new FormData(form);

        try {
            const response = await fetch(form.action, {
                method: "POST",
                body: formData,
                headers: {
                    "Accept": "application/json"
                }
            });

            if (response.ok) {
                form.reset();
                showSuccessBox();
            } else {
                console.error("Formspree error:", response.status);
                alert("Something went wrong. Please try again later.");
            }
        } catch (error) {
            console.error("Network error:", error);
            alert("Network error. Please check your connection and try again.");
        }
    });
})();
