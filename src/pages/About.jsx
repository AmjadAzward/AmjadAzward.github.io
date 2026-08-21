import { Link } from "react-router-dom";
import usePageTitle from "../hooks/usePageTitle.js";
import useScrollReveal from "../hooks/useScrollReveal.js";

const stats = [
    { number: "9+", label: "Projects Built" },
    { number: "9+", label: "Certifications" },
    { number: "3.81", label: "CGPA" },
    { number: "3", label: "Roles Held" },
];

const education = [
    {
        icon: "fa-graduation-cap",
        title: "BSc (Hons) Computer Science with Data Science",
        sub: "NIBM (Coventry University BSc Year 03), Sri Lanka",
        meta: "Nov 2023 – Present",
    },
    {
        icon: "fa-graduation-cap",
        title: "G.C.E Advanced Level (Math Stream)",
        sub: "Royal College, Colombo 07",
        meta: "2022",
    },
];

const experience = [
    {
        icon: "fa-briefcase",
        title: "Freelancer - Software Developer",
        sub: "Spark Solutions",
        meta: "Mar 2025 – Present",
    },
    {
        icon: "fa-briefcase",
        title: "Remote - Intern AI Enabled Software Engineer",
        sub: "SoftwarePlus Pvt Ltd",
        meta: "Nov 2025 – Jan 2026",
    },
    {
        icon: "fa-briefcase",
        title: "Intern Software Developer",
        sub: "FitsExpress Pvt Ltd",
        meta: "Nov 2025 – Present",
    },
];

export default function About() {
    usePageTitle("About - Amjad Azward");
    useScrollReveal();

    return (
        <section id="about" className="section">
            <div className="section-inner container">
                <div className="section-header reveal">
                    <div className="section-label">About</div>
                    <h2 className="section-heading">Who I Am</h2>
                    <p className="section-sub">
                        IT undergraduate and machine learning enthusiast, gaining hands-on experience through
                        real-world projects and certifications.
                    </p>
                </div>

                <div className="about-bio reveal">
                    <p className="about-bio-text">
                        Third-year Computer Science undergraduate at NIBM (Coventry University), currently
                        freelancing as a software developer and interning in AI-enabled engineering — building web,
                        mobile, and machine learning projects along the way.
                    </p>
                    <div className="about-bio-actions">
                        <a className="btn-primary" href="/images/Amjad Azward Resume.pdf" download>
                            Download CV
                        </a>
                        <Link className="btn-ghost" to="/portfolio">
                            View Portfolio
                        </Link>
                    </div>
                </div>

                <div className="about-stats-strip reveal">
                    {stats.map((stat) => (
                        <div key={stat.label} className="about-stat">
                            <div className="about-stat-number">{stat.number}</div>
                            <div className="about-stat-label">{stat.label}</div>
                        </div>
                    ))}
                </div>

                <div className="about-timeline-columns">
                    <div className="reveal-left">
                        <h3 className="about-timeline-col-heading">
                            <i className="fa-solid fa-graduation-cap"></i> Education
                        </h3>
                        <div className="about-timeline">
                            {education.map((item) => (
                                <div key={item.title} className="about-timeline-item">
                                    <div className="about-timeline-icon">
                                        <i className={`fa-solid ${item.icon}`}></i>
                                    </div>
                                    <div className="about-timeline-title">{item.title}</div>
                                    <div className="about-timeline-sub">{item.sub}</div>
                                    <div className="about-timeline-meta">{item.meta}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="reveal-left">
                        <h3 className="about-timeline-col-heading">
                            <i className="fa-solid fa-briefcase"></i> Experience
                        </h3>
                        <div className="about-timeline">
                            {experience.map((item) => (
                                <div key={item.title} className="about-timeline-item">
                                    <div className="about-timeline-icon">
                                        <i className={`fa-solid ${item.icon}`}></i>
                                    </div>
                                    <div className="about-timeline-title">{item.title}</div>
                                    <div className="about-timeline-sub">{item.sub}</div>
                                    <div className="about-timeline-meta">{item.meta}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
