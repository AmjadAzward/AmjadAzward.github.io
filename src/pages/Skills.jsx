import usePageTitle from "../hooks/usePageTitle.js";
import useScrollReveal from "../hooks/useScrollReveal.js";

const groups = [
    {
        title: "Languages & Concepts",
        icon: "fa-code",
        skills: [
            { img: "oop.png", alt: "OOP", label: "OOP" },
            { img: "sdlc.png", alt: "SDLC", label: "SDLC" },
            { img: "design.PNG", alt: "Design Patterns", label: "Design Patterns" },
            { img: "java.png", alt: "Java", label: "Java" },
            { img: "c.png", alt: "C", label: "C" },
            { img: "csharp.png", alt: "C#", label: "C#" },
            { img: "python.png", alt: "Python", label: "Python" },
            { img: "javascript.PNG", alt: "JavaScript", label: "JavaScript" },
            { img: "php.png", alt: "PHP", label: "PHP" },
            { img: "sql.png", alt: "SQL", label: "SQL" },
            { img: "plsql.png", alt: "PL/SQL", label: "PL/SQL" },
            { img: "r.png", alt: "R", label: "R" },
        ],
    },
    {
        title: "Web & Backend",
        icon: "fa-globe",
        skills: [
            { img: "html.png", alt: "HTML", label: "HTML" },
            { img: "css.png", alt: "CSS", label: "CSS" },
            { img: "react.png", alt: "React", label: "React" },
            { img: "nodejs.png", alt: "Node.js", label: "Node.js" },
            { img: "rest.PNG", alt: "REST APIs", label: "REST APIs" },
        ],
    },
    {
        title: "Databases, Cloud & Tools",
        icon: "fa-database",
        skills: [
            { img: "aws.png", alt: "AWS", label: "AWS" },
            { img: "mysql.png", alt: "MySQL", label: "MySQL" },
            { img: "oracle.png", alt: "Oracle", label: "Oracle" },
            { img: "sqlite.png", alt: "SQLite", label: "SQLite" },
            { img: "mongodb.png", alt: "MongoDB", label: "MongoDB" },
            { img: "firebase.PNG", alt: "Firebase", label: "Firebase" },
            { img: "postman.webp", alt: "Postman", label: "Postman" },
            { img: "git.png", alt: "Git", label: "Git" },
            { img: "vscode.png", alt: "VS Code", label: "VS Code" },
            { img: "IntelliJ.png", alt: "IntelliJ", label: "IntelliJ" },
            { img: "android.webp", alt: "Android Studio", label: "Android Studio" },
        ],
    },
    {
        title: "Other",
        icon: "fa-layer-group",
        skills: [
            { img: "project.png", alt: "Project Management", label: "Project Management" },
            { img: "machine.png", alt: "ML Basics", label: "ML Basics" },
            { img: "powerbi.png", alt: "PowerBI", label: "PowerBI" },
            { img: "figma.png", alt: "Figma", label: "Figma" },
            { img: "hop.png", alt: "Apache Hop", label: "Apache Hop" },
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
                        <h3 className="skill-group-title">
                            <i className={`fa-solid ${group.icon}`}></i> {group.title}
                        </h3>
                        <div className="skills-mosaic">
                            {group.skills.map((skill) => (
                                <div key={skill.label} className="skill-tile reveal-pop">
                                    <img src={`/images/${skill.img}`} alt={skill.alt} width="34" height="34" />
                                    <span>{skill.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
