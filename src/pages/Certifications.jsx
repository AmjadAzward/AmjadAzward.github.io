import usePageTitle from "../hooks/usePageTitle.js";
import useScrollReveal from "../hooks/useScrollReveal.js";

const certs = [
    {
        img: "01.png",
        alt: "AI/ML Engineer - Stage 2",
        title: "AI/ML Engineer - Stage 2",
        meta: "SLIIT • 2025",
        href: "https://code.sliit.org/certificates/y0lmoqcrhs",
    },
    {
        img: "02.png",
        alt: "Software Engineer Certificate",
        title: "Software Engineer Certificate",
        meta: "HackerRank • 2025",
        href: "https://www.hackerrank.com/certificates/b405637ac777",
    },
    {
        img: "03.png",
        alt: "DevNet Associate",
        title: "DevNet Associate",
        meta: "Cisco • 2025",
        href: "https://www.credly.com/badges/27413818-45b4-4819-a433-2aae855b8310/public_url",
    },
    {
        img: "04.png",
        alt: "LFS158: Introduction to Kubernetes",
        title: "LFS158: Introduction to Kubernetes",
        meta: "The Linux Foundation • 2025",
        href: "https://www.credly.com/badges/450f8697-50f5-48dc-8df0-eac063a52023/public_url",
    },
    {
        img: "05.png",
        alt: "IT Essentials",
        title: "IT Essentials",
        meta: "Cisco • 2025",
        href: "https://www.credly.com/badges/5197df95-7c07-4111-93a7-1444bbf37c16/public_url",
    },
    {
        img: "06.png",
        alt: "Oracle Certified Foundations Associate",
        title: "Oracle Certified Foundations Associate",
        meta: "Oracle • 2025",
        href: "https://catalog-education.oracle.com/ords/certview/sharebadge?id=DB47386D62052DEA24A8133024E7D270C454AFA6A0D828EA0DFAA4A121961732#",
    },
    {
        img: "07.png",
        alt: "Oracle Certified Generative AI Professional",
        title: "Oracle Certified Generative AI Professional",
        meta: "Oracle • 2025",
        href: "https://catalog-education.oracle.com/ords/certview/sharebadge?id=3BA77EDF9B5ECA71F584AB106A29CA6592981B9245AFB824EAF97242B456D13E",
    },
    {
        img: "08.png",
        alt: "SQL (Advanced)",
        title: "SQL (Advanced)",
        meta: "HackerRank • 2025",
        href: "https://www.hackerrank.com/certificates/4f1ae8b7a464",
    },
    {
        img: "09.jpg",
        alt: "R (Intermediate)",
        title: "R (Intermediate)",
        meta: "HackerRank • 2025",
        href: "https://www.hackerrank.com/certificates/a95e038143d7",
    },
];

export default function Certifications() {
    usePageTitle("Certifications - Amjad Azward");
    useScrollReveal();

    return (
        <section id="certifications" className="section">
            <div className="section-inner container">
                <div className="section-header reveal">
                    <div className="section-label">Certifications</div>
                    <h2 className="section-heading">My Certifications</h2>
                    <p className="section-sub">
                        A selection of certificates and training programs that contributed to my skills and
                        professional growth.
                    </p>
                </div>

                <div className="cert-grid">
                    {certs.map((cert) => (
                        <a
                            key={cert.img}
                            className="bento-tile cert-card reveal"
                            href={cert.href}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <div className="cert-card-image">
                                <img src={`/certifications/${cert.img}`} alt={cert.alt} />
                            </div>
                            <div className="cert-card-body">
                                <div className="cert-meta">{cert.meta}</div>
                                <h3 className="cert-title">{cert.title}</h3>
                                <div className="cert-card-link">
                                    Verify Certificate <i className="fa-solid fa-arrow-up-right-from-square"></i>
                                </div>
                            </div>
                        </a>
                    ))}
                </div>

                <a
                    href="https://www.linkedin.com/in/amjad-a-076262297/details/certifications/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bento-tile bento-tile-cta reveal"
                >
                    Browse more on LinkedIn
                    <i className="fab fa-linkedin-in"></i>
                </a>
            </div>
        </section>
    );
}
