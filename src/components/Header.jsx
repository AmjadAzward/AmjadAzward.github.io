import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import LogoMark from "./LogoMark.jsx";

const navItems = [
    { to: "/", label: "Home", end: true },
    { to: "/about", label: "About" },
    { to: "/skills", label: "Skills" },
    { to: "/certifications", label: "Certifications" },
    { to: "/services", label: "Services" },
    { to: "/portfolio", label: "Portfolio" },
    { to: "/contact", label: "Contact" },
];

export default function Header() {
    const [navOpen, setNavOpen] = useState(false);

    useEffect(() => {
        document.body.classList.toggle("nav-open", navOpen);
    }, [navOpen]);

    function closeNav() {
        setNavOpen(false);
    }

    return (
        <header>
            <nav className="nav">
                <div className="logo">
                    <Link to="/" className="logo-mark" aria-label="Amjad Azward home" onClick={closeNav}>
                        <LogoMark />
                    </Link>
                </div>

                <div className={`nav-links${navOpen ? " open" : ""}`} id="navLinks">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.end}
                            onClick={closeNav}
                            className={({ isActive }) => (isActive ? "active" : undefined)}
                        >
                            {item.label}
                        </NavLink>
                    ))}

                    <div className="nav-overlay-social">
                        <a href="https://www.facebook.com/share/1EwajrGw48/" target="_blank" rel="noopener noreferrer">
                            <i className="fab fa-facebook-f"></i>
                        </a>
                        <a
                            href="https://x.com/AmjadAzward?t=oksSngSxCLaVdut50v6cxA&s=08"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <i className="fab fa-twitter"></i>
                        </a>
                        <a
                            href="https://www.instagram.com/amjadazward?igsh=ZXZoZjNhdHF0cDUw"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <i className="fab fa-instagram"></i>
                        </a>
                        <a href="https://www.linkedin.com/in/amjad-a-076262297/" target="_blank" rel="noopener noreferrer">
                            <i className="fab fa-linkedin-in"></i>
                        </a>
                    </div>
                </div>

                <div
                    className={`nav-toggle${navOpen ? " active" : ""}`}
                    id="navToggle"
                    aria-label="Toggle navigation"
                    onClick={() => setNavOpen((v) => !v)}
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </nav>
        </header>
    );
}
