import usePageTitle from "../hooks/usePageTitle.js";
import useScrollReveal from "../hooks/useScrollReveal.js";

const services = [
    {
        index: "SERVICE 01",
        icon: "fa-mobile-screen-button",
        title: "Mobile App Development",
        text: "Building responsive and feature-rich mobile applications using Android Studio, React Native, and Firebase for seamless user experiences.",
        tags: ["Android Studio", "React Native", "Firebase"],
    },
    {
        index: "SERVICE 02",
        icon: "fa-globe",
        title: "Web Development",
        text: "Creating dynamic and interactive web applications with React.js, Node.js, and modern web technologies for optimal performance.",
        tags: ["React.js", "Node.js"],
    },
    {
        index: "SERVICE 03",
        icon: "fa-desktop",
        title: "Desktop Applications",
        text: "Developing robust desktop software using C#, Java, and Electron framework with intuitive user interfaces and efficient backends.",
        tags: ["C#", "Java", "Electron"],
    },
    {
        index: "SERVICE 04",
        icon: "fa-robot",
        title: "AI & Machine Learning",
        text: "Implementing intelligent solutions with Python, TensorFlow, and custom ML models for data-driven decision making and automation.",
        tags: ["Python", "TensorFlow"],
    },
    {
        index: "SERVICE 05",
        icon: "fa-network-wired",
        title: "IoT & Robotics",
        text: "Building connected IoT systems and robotics solutions with embedded systems, sensors, and real-time data processing capabilities.",
        tags: ["Embedded Systems", "Sensors"],
    },
    {
        index: "SERVICE 06",
        icon: "fa-chart-line",
        title: "Data Analytics",
        text: "Analyzing complex datasets and creating insightful dashboards using Power BI, Python, and SQL for actionable business intelligence.",
        tags: ["Power BI", "SQL"],
    },
];

export default function Services() {
    usePageTitle("Services - Amjad Azward");
    useScrollReveal();

    return (
        <section id="services" className="section">
            <div className="section-inner container">
                <div className="section-header reveal">
                    <div className="section-label">Services</div>
                    <h2 className="section-heading">What I Can Do</h2>
                    <p className="section-sub">
                        I specialize in developing web, mobile, and desktop applications, as well as AI, IoT, and
                        data solutions to solve real-world problems.
                    </p>
                </div>

                <div className="services-grid">
                    {services.map((service) => (
                        <article key={service.title} className="bento-tile service-card reveal">
                            <div className="service-index">{service.index}</div>
                            <div className="service-icon">
                                <i className={`fa-solid ${service.icon}`}></i>
                            </div>
                            <h3 className="service-title">{service.title}</h3>
                            <p className="service-text">{service.text}</p>
                            <div className="service-tags">
                                {service.tags.map((tag) => (
                                    <span key={tag} className="tag">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}
