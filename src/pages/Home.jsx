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
                <div className="hero-stage-kicker reveal">Software</div>
                <div className="hero-stage-visual">
                    <div className="hero-stage-glow"></div>
                    <span className="hero-stage-giant reveal-scale">Engineer</span>
                </div>
            </div>

            <div className="hero-below hero-below-centered">
                <div className="hero-below-photo reveal-scale">
                    <img src="/images/profile.png" alt="Profile photo of Amjad Azward" />
                </div>
            </div>
        </section>
    );
}
