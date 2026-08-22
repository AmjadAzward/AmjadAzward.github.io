import { Link } from "react-router-dom";
import usePageTitle from "../hooks/usePageTitle.js";
import useScrollReveal from "../hooks/useScrollReveal.js";
import useNoScroll from "../hooks/useNoScroll.js";

export default function Home() {
    usePageTitle("Amjad Azward - Portfolio");
    useScrollReveal();
    useNoScroll();

    return (
        <section id="home" className="hero-section">
            <div className="hero-stage">
                <div className="hero-stage-kicker reveal">Data Science</div>
                <div className="hero-stage-visual">
                    <div className="hero-stage-glow"></div>
                    <span className="hero-stage-giant reveal-scale">Undergraduate</span>
                    <div className="hero-stage-photo">
                        <img src="/images/profile.png" alt="Profile photo of Amjad Azward" />
                    </div>
                    <div className="hero-stage-text">
                        <div className="hero-bubble">Welcome to My Portfolio</div>
                        <p className="hero-stage-text-heading">
                            Explore my work, skills, and experience as a Software Engineering &amp; Data Science
                            undergraduate.
                        </p>
                        <p className="hero-stage-text-sub">
                            Crafting practical, real-world solutions across web, cloud, and machine learning.
                        </p>
                    </div>
                    <div className="hero-stage-actions">
                        <Link className="btn-primary" to="/contact">
                            Hire Me
                        </Link>
                        <a className="btn-ghost" href="/images/Amjad Azward Resume.pdf" download>
                            Download CV
                        </a>
                        <a
                            className="btn-ghost"
                            href="https://github.com/AmjadAzward"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            GitHub Profile
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
}
