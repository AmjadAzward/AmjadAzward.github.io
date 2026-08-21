import usePageTitle from "../hooks/usePageTitle.js";
import useScrollReveal from "../hooks/useScrollReveal.js";

const projects = [
    {
        img: "01.png",
        title: "Mind Map Builder",
        text: "A web-based concept map builder with drag-and-drop interface, supporting grouping, resizing, connectors, undo/redo, and saving/loading maps.",
        href: "https://github.com/AmjadAzward/Mind_Map_Builder",
    },
    {
        img: "02.png",
        title: "Complaint ChainLK",
        text: "Complaint ChainLK is a web platform for submitting and tracking complaints, using AI for categorization and dashboards for authorities.",
        href: "https://github.com/AmjadAzward/Complaint-chain-LK?tab=readme-ov-file",
    },
    {
        img: "03.png",
        title: "Detectify",
        text: "Detectify is a real-time object detection system using YOLOv5 and OpenCV. It recognizes multiple objects via webcam or video stream, displaying bounding boxes, labels, and confidence scores.",
        href: "https://github.com/AmjadAzward/Object_detection",
    },
    {
        img: "04.png",
        title: "MedSynora",
        text: "Medsynora Data Warehouse integrates hospital data for efficient analytics, using ETL, dimensional modeling, and BI visualization to support healthcare decision-making.",
        href: "https://github.com/AmjadAzward/MedSynora",
    },
    {
        img: "05.png",
        title: "Tuition Hub",
        text: "Tuition Hub is an Android app that automates tuition center operations, offering tailored features for admins, teachers, and students.",
        href: "https://github.com/AmjadAzward/Tution-Hub",
    },
    {
        img: "06.png",
        title: "Car Rent Management System",
        text: "Car Rent Management System automates bookings, customer handling, vehicle tracking, payments, and maintenance, improving efficiency and reporting.",
        href: "https://github.com/AmjadAzward/Car-Rent-System",
    },
    {
        img: "07.png",
        title: "SPICE WORLD",
        text: "Spice World is a comprehensive web app for managing a wholesale spice business, streamlining client management, orders, invoicing, inventory tracking, and customer interactions.",
        href: "https://github.com/AmjadAzward/Spice-World",
    },
    {
        img: "08.jpg",
        title: "Online Recipe Collection System",
        text: "A web platform where admins manage recipes and users can browse and review them, with all data stored in MySQL.",
        href: "https://github.com/AmjadAzward/Online-Recipe-Collection",
    },
    {
        img: "09.jpg",
        title: "Urban Food",
        text: "Urban Food is an e-commerce web app for online food ordering, using PHP, Oracle DB for business logic, and MongoDB for user reviews.",
        href: "https://github.com/AmjadAzward/E-Commerce-System",
    },
];

export default function Portfolio() {
    usePageTitle("Portfolio - Amjad Azward");
    useScrollReveal();

    return (
        <section id="portfolio" className="section">
            <div className="section-inner container">
                <div className="section-header reveal">
                    <div className="section-label">Portfolio</div>
                    <h2 className="section-heading">My Latest Work</h2>
                    <p className="section-sub">
                        A selection of work ranging from marketing sites to product dashboards and experimental
                        concepts.
                    </p>
                </div>

                <div className="project-grid">
                    {projects.map((project) => (
                        <article key={project.img} className="bento-tile project-tile reveal">
                            <div className="project-image">
                                <img src={`/projects/${project.img}`} alt={project.title} />
                            </div>
                            <div className="project-body">
                                <div className="project-tag">Web Design</div>
                                <h3 className="project-title">{project.title}</h3>
                                <p className="project-text">{project.text}</p>
                                <a href={project.href} className="project-link" target="_blank" rel="noopener noreferrer">
                                    View Project <i className="fa-solid fa-arrow-up-right-from-square"></i>
                                </a>
                            </div>
                        </article>
                    ))}
                </div>

                <a
                    href="https://github.com/AmjadAzward"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bento-tile bento-tile-cta reveal"
                >
                    Browse more on GitHub
                    <i className="fab fa-github"></i>
                </a>
            </div>
        </section>
    );
}
