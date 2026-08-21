import { Link } from "react-router-dom";
import usePageTitle from "../hooks/usePageTitle.js";
import useScrollReveal from "../hooks/useScrollReveal.js";

const stats = [
    { icon: "fa-diagram-project", number: "9+", label: "Projects Built" },
    { icon: "fa-certificate", number: "9+", label: "Certifications" },
    { icon: "fa-graduation-cap", number: "3.81", label: "CGPA" },
    { icon: "fa-briefcase", number: "3", label: "Roles Held" },
];

const education = [
    {
        title: "BSc (Hons) Computer Science with Data Science",
        sub: "NIBM (Coventry University BSc Year 03), Sri Lanka",
        meta: "Nov 2023 – Present",
    },
    {
        title: "G.C.E Advanced Level (Math Stream)",
        sub: "Royal College, Colombo 07",
        meta: "2022",
    },
];

const experience = [
    {
        title: "Freelancer - Software Developer",
        sub: "Spark Solutions",
        meta: "Mar 2025 – Present",
    },
    {
        title: "Remote - Intern AI Enabled Software Engineer",
        sub: "SoftwarePlus Pvt Ltd",
        meta: "Nov 2025 – Jan 2026",
    },
    {
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
                        IT undergraduate and machine learning enthusiast with knowledge in software engineering,
                        cloud computing, networking, and automation. Skilled in problem-solving and system design,
                        actively gaining hands-on experience through projects and certifications.
                    </p>
                </div>

                <div className="stats-grid">
                    {stats.map((stat, i) => (
                        <div
                            key={stat.label}
                            className="bento-tile stat-card reveal"
                            style={{ transitionDelay: `${i * 0.06}s` }}
                        >
                            <div className="stat-icon">
                                <i className={`fa-solid ${stat.icon}`}></i>
                            </div>
                            <div className="stat-number">{stat.number}</div>
                            <div className="stat-label">{stat.label}</div>
                        </div>
                    ))}
                </div>

                <div className="bento-tile about-bio reveal">
                    <p className="about-bio-text">
                        I'm currently in my third year of a BSc (Hons) in Computer Science with Data Science at
                        NIBM, affiliated with Coventry University. Alongside my degree, I split my time between
                        freelance software development at Spark Solutions and hands-on internships in AI-enabled
                        engineering — work that has taken me across web platforms, Android apps, data warehousing,
                        and machine learning prototypes. I back that experience with certifications from SLIIT,
                        Cisco, Oracle, HackerRank, and the Linux Foundation, and I'm always looking for the next
                        problem worth solving.
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

                <div className="timeline-wrap">
                    <div className="bento-tile reveal-left">
                        <h3 className="timeline-heading">
                            <i className="fa-solid fa-graduation-cap"></i> Education
                        </h3>
                        <div className="timeline">
                            {education.map((item, i) => (
                                <div key={item.title} className="timeline-item reveal-left" style={{ transitionDelay: `${i * 0.12}s` }}>
                                    <div className="about-item-title">{item.title}</div>
                                    <div className="about-item-sub">{item.sub}</div>
                                    <div className="about-item-meta">{item.meta}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bento-tile reveal-left">
                        <h3 className="timeline-heading">
                            <i className="fa-solid fa-briefcase"></i> Experience
                        </h3>
                        <div className="timeline">
                            {experience.map((item, i) => (
                                <div key={item.title} className="timeline-item reveal-left" style={{ transitionDelay: `${i * 0.06}s` }}>
                                    <div className="about-item-title">{item.title}</div>
                                    <div className="about-item-sub">{item.sub}</div>
                                    <div className="about-item-meta">{item.meta}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
