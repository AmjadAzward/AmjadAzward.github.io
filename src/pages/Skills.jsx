import usePageTitle from "../hooks/usePageTitle.js";
import useScrollReveal from "../hooks/useScrollReveal.js";

const groups = [
    {
        title: "Languages & Concepts",
        icon: "fa-code",
        skills: [
            {
                img: "oop.png",
                alt: "OOP",
                label: "OOP",
                category: "Concept",
                desc: "A programming paradigm built around objects, encapsulation, and reusable class-based design.",
                level: 88,
            },
            {
                img: "sdlc.png",
                alt: "SDLC",
                label: "SDLC",
                category: "Concept",
                desc: "A structured process for planning, building, testing, and maintaining software systems.",
                level: 85,
            },
            {
                img: "design.PNG",
                alt: "Design Patterns",
                label: "Design Patterns",
                category: "Concept",
                desc: "Reusable solutions to common software design problems, from Singleton to Observer.",
                level: 82,
            },
            {
                img: "java.png",
                alt: "Java",
                label: "Java",
                category: "Language",
                desc: "An object-oriented language widely used for enterprise, Android, and backend development.",
                level: 90,
            },
            {
                img: "c.png",
                alt: "C",
                label: "C",
                category: "Language",
                desc: "A foundational procedural language known for performance and low-level system control.",
                level: 78,
            },
            {
                img: "csharp.png",
                alt: "C#",
                label: "C#",
                category: "Language",
                desc: "A modern, type-safe language for building desktop, web, and game applications.",
                level: 80,
            },
            {
                img: "python.png",
                alt: "Python",
                label: "Python",
                category: "Language",
                desc: "A versatile language popular for scripting, data science, and machine learning.",
                level: 92,
            },
            {
                img: "javascript.PNG",
                alt: "JavaScript",
                label: "JavaScript",
                category: "Language",
                desc: "The core scripting language of the web, powering interactive front-end and back-end apps.",
                level: 90,
            },
            {
                img: "php.png",
                alt: "PHP",
                label: "PHP",
                category: "Language",
                desc: "A server-side scripting language widely used for building dynamic web applications.",
                level: 75,
            },
            {
                img: "sql.png",
                alt: "SQL",
                label: "SQL",
                category: "Language",
                desc: "The standard language for querying and managing relational databases.",
                level: 88,
            },
            {
                img: "plsql.png",
                alt: "PL/SQL",
                label: "PL/SQL",
                category: "Language",
                desc: "Oracle's procedural extension to SQL for writing stored procedures and triggers.",
                level: 76,
            },
            {
                img: "r.png",
                alt: "R",
                label: "R",
                category: "Language",
                desc: "A language purpose-built for statistical computing and data analysis.",
                level: 74,
            },
        ],
    },
    {
        title: "Web & Backend",
        icon: "fa-globe",
        skills: [
            {
                img: "html.png",
                alt: "HTML",
                label: "HTML",
                category: "Markup",
                desc: "The standard markup language for structuring content on the web.",
                level: 93,
            },
            {
                img: "css.png",
                alt: "CSS",
                label: "CSS",
                category: "Styling",
                desc: "A stylesheet language used to control the layout and appearance of web pages.",
                level: 90,
            },
            {
                img: "react.png",
                alt: "React",
                label: "React",
                category: "Framework",
                desc: "A JavaScript library for building fast, component-based user interfaces.",
                level: 88,
            },
            {
                img: "nodejs.png",
                alt: "Node.js",
                label: "Node.js",
                category: "Runtime",
                desc: "A JavaScript runtime for building scalable server-side and networked applications.",
                level: 82,
            },
            {
                img: "rest.PNG",
                alt: "REST APIs",
                label: "REST APIs",
                category: "Architecture",
                desc: "An architectural style for designing stateless, resource-based web services.",
                level: 85,
            },
        ],
    },
    {
        title: "Databases, Cloud & Tools",
        icon: "fa-database",
        skills: [
            {
                img: "aws.png",
                alt: "AWS",
                label: "AWS",
                category: "Cloud",
                desc: "A leading cloud platform offering compute, storage, and deployment services.",
                level: 78,
            },
            {
                img: "mysql.png",
                alt: "MySQL",
                label: "MySQL",
                category: "Database",
                desc: "A popular open-source relational database management system.",
                level: 85,
            },
            {
                img: "oracle.png",
                alt: "Oracle",
                label: "Oracle",
                category: "Database",
                desc: "An enterprise-grade relational database system used for large-scale applications.",
                level: 80,
            },
            {
                img: "sqlite.png",
                alt: "SQLite",
                label: "SQLite",
                category: "Database",
                desc: "A lightweight, file-based relational database engine for embedded applications.",
                level: 83,
            },
            {
                img: "mongodb.png",
                alt: "MongoDB",
                label: "MongoDB",
                category: "Database",
                desc: "A NoSQL document database designed for flexible, scalable data storage.",
                level: 80,
            },
            {
                img: "firebase.PNG",
                alt: "Firebase",
                label: "Firebase",
                category: "Cloud",
                desc: "A Google platform offering real-time databases, hosting, and backend services.",
                level: 84,
            },
            {
                img: "postman.webp",
                alt: "Postman",
                label: "Postman",
                category: "Tool",
                desc: "A tool for testing, documenting, and debugging REST APIs.",
                level: 88,
            },
            {
                img: "git.png",
                alt: "Git",
                label: "Git",
                category: "Tool",
                desc: "A distributed version control system for tracking and managing code changes.",
                level: 92,
            },
            {
                img: "vscode.png",
                alt: "VS Code",
                label: "VS Code",
                category: "Tool",
                desc: "A lightweight, extensible code editor for modern software development.",
                level: 95,
            },
            {
                img: "IntelliJ.png",
                alt: "IntelliJ",
                label: "IntelliJ",
                category: "Tool",
                desc: "A powerful IDE for Java and JVM-based application development.",
                level: 85,
            },
            {
                img: "android.webp",
                alt: "Android Studio",
                label: "Android Studio",
                category: "Tool",
                desc: "The official IDE for building native Android applications.",
                level: 82,
            },
        ],
    },
    {
        title: "Other",
        icon: "fa-layer-group",
        skills: [
            {
                img: "project.png",
                alt: "Project Management",
                label: "Project Management",
                category: "Skill",
                desc: "Planning, coordinating, and delivering projects within scope, time, and budget.",
                level: 80,
            },
            {
                img: "machine.png",
                alt: "ML Basics",
                label: "ML Basics",
                category: "Skill",
                desc: "Foundational machine learning concepts, including supervised and unsupervised models.",
                level: 76,
            },
            {
                img: "powerbi.png",
                alt: "PowerBI",
                label: "PowerBI",
                category: "Tool",
                desc: "A business analytics tool for visualizing data and building dashboards.",
                level: 79,
            },
            {
                img: "figma.png",
                alt: "Figma",
                label: "Figma",
                category: "Tool",
                desc: "A collaborative interface design tool for wireframing and prototyping.",
                level: 77,
            },
            {
                img: "hop.png",
                alt: "Apache Hop",
                label: "Apache Hop",
                category: "Tool",
                desc: "An open-source data integration platform for building ETL workflows.",
                level: 74,
            },
        ],
    },
];

export default function Skills() {
    usePageTitle("Skills - Amjad Azward");
    useScrollReveal();

    return (
        <section id="skills" className="section">
            <div className="section-inner container">
                <div className="section-header reveal">
                    <div className="section-label">Skills</div>
                    <h2 className="section-heading">Technical Skills</h2>
                    <p className="section-sub">
                        The tools, languages, and technologies I work with to develop efficient and user-friendly
                        solutions.
                    </p>
                </div>

                {groups.map((group) => (
                    <div key={group.title} className="skill-group reveal">
                        <div className="skill-group-title">
                            <h3 className="skill-group-title-text">
                                <i className={`fa-solid ${group.icon}`}></i> {group.title}
                            </h3>
                            <span className="skill-group-count">{group.skills.length} skills</span>
                        </div>
                        <div className="skills-mosaic">
                            {group.skills.map((skill) => (
                                <div key={skill.label} className="skill-tile reveal-pop">
                                    <div className="skill-tile-icon">
                                        <img src={`/images/${skill.img}`} alt={skill.alt} width="26" height="26" />
                                    </div>
                                    <div className="skill-tile-title">{skill.label}</div>
                                    <div className="skill-tile-category">{skill.category}</div>
                                    <p className="skill-tile-desc">{skill.desc}</p>
                                    <div className="skill-proficiency-row">
                                        <span>Proficiency</span>
                                        <span className="skill-proficiency-value">{skill.level}%</span>
                                    </div>
                                    <div className="skill-proficiency-bar">
                                        <div className="skill-proficiency-fill" style={{ width: `${skill.level}%` }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
