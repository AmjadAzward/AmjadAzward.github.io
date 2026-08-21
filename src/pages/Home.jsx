import { Link } from "react-router-dom";
import usePageTitle from "../hooks/usePageTitle.js";
import useScrollReveal from "../hooks/useScrollReveal.js";

export default function Home() {
    usePageTitle("Amjad Azward - Portfolio");
    useScrollReveal();

    return (
        <section id="home" className="hero-section">
            <div className="hero-split">
                <div className="hero-text-panel">
                    <div className="hero-text-inner">
                        <div className="hero-bubble reveal" style={{ transitionDelay: "0s" }}>
                            Hello, I am
                        </div>
                        <h1 className="hero-heading reveal" style={{ transitionDelay: "0.1s" }}>
                            <span className="block">
                                <span className="name">Amjad Azward</span>,
                            </span>
                            <span className="block">
                                <span className="role-dev">Undergraduate in Data Science</span>
                            </span>
                        </h1>
                        <p className="hero-subtitle reveal" style={{ transitionDelay: "0.15s" }}>
                            Software Engineering &amp; Data Science undergraduate crafting practical, real-world
                            solutions across web, cloud, and machine learning.
                        </p>
                        <div className="hero-actions reveal" style={{ transitionDelay: "0.2s" }}>
                            <Link className="btn-primary" to="/contact">
                                Hire Me
                            </Link>
                            <a className="btn-ghost" href="/images/Amjad Azward Resume.pdf" download>
                                Download CV
                            </a>
                        </div>
                    </div>
                </div>

                <div className="hero-photo-panel reveal-scale" style={{ transitionDelay: "0.15s" }}>
                    <div className="hero-photo-glow"></div>
                    <img src="/images/profile.png" alt="Profile photo of Amjad Azward" />
                </div>
            </div>
        </section>
    );
}
