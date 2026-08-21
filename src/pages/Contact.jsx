import { useEffect, useRef, useState } from "react";
import usePageTitle from "../hooks/usePageTitle.js";
import useScrollReveal from "../hooks/useScrollReveal.js";

const socials = [
    { href: "https://www.linkedin.com/in/amjad-a-076262297/", icon: "fab fa-linkedin-in", label: "LinkedIn" },
    { href: "https://github.com/AmjadAzward", icon: "fab fa-github", label: "GitHub" },
    { href: "https://www.facebook.com/share/1EwajrGw48/", icon: "fab fa-facebook-f", label: "Facebook" },
    { href: "https://x.com/AmjadAzward?t=oksSngSxCLaVdut50v6cxA&s=08", icon: "fab fa-twitter", label: "Twitter / X" },
    { href: "https://www.instagram.com/amjadazward?igsh=ZXZoZjNhdHF0cDUw", icon: "fab fa-instagram", label: "Instagram" },
];

export default function Contact() {
    usePageTitle("Contact - Amjad Azward");
    useScrollReveal();

    const [status, setStatus] = useState("idle"); // idle | sending | error
    const [showSuccess, setShowSuccess] = useState(false);
    const formRef = useRef(null);
    const successTimer = useRef(null);

    useEffect(() => () => clearTimeout(successTimer.current), []);

    function hideSuccess() {
        setShowSuccess(false);
        clearTimeout(successTimer.current);
    }

    async function handleSubmit(e) {
        e.preventDefault();
        const form = formRef.current;
        setStatus("sending");

        try {
            const response = await fetch(form.action, {
                method: "POST",
                body: new FormData(form),
                headers: { Accept: "application/json" },
            });

            if (response.ok) {
                form.reset();
                setStatus("idle");
                setShowSuccess(true);
                successTimer.current = setTimeout(hideSuccess, 3000);
            } else {
                setStatus("error");
                alert("Something went wrong. Please try again later.");
            }
        } catch {
            setStatus("error");
            alert("Network error. Please check your connection and try again.");
        }
    }

    return (
        <section id="contact" className="section">
            <div className="section-inner container">
                <div className="section-header reveal">
                    <div className="section-label">Contact</div>
                    <h2 className="section-heading">Get in Touch</h2>
                    <p className="section-sub">
                        I'm open to opportunities and collaborations. Feel free to reach out for project inquiries,
                        freelance work, or just a friendly chat.
                    </p>
                </div>

                <div className="bento-grid">
                    <div className="bento-tile contact-tile-form reveal">
                        <form ref={formRef} action="https://formspree.io/f/xkgdonvg" method="POST" onSubmit={handleSubmit}>
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="name">Name *</label>
                                    <input className="form-control" id="name" type="text" placeholder="Your name" name="name" required />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="email">Email *</label>
                                    <input
                                        className="form-control"
                                        id="email"
                                        type="email"
                                        placeholder="you@example.com"
                                        name="email"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="subject">Subject *</label>
                                <input className="form-control" id="subject" type="text" placeholder="How can I help?" name="subject" required />
                            </div>

                            <div className="form-group">
                                <label htmlFor="message">Your message *</label>
                                <textarea id="message" placeholder="Tell me a little bit about your project..." name="message" required></textarea>
                            </div>

                            <div className="contact-submit">
                                <button type="submit" className="btn-primary" disabled={status === "sending"}>
                                    {status === "sending" ? "Sending…" : "Send Message"}
                                </button>
                            </div>
                        </form>

                        <div className={`form-toast${showSuccess ? " show" : ""}`} aria-live="polite" aria-hidden={!showSuccess}>
                            <div className="form-toast-inner">
                                <p>Message sent successfully!</p>
                                <button type="button" className="form-toast-btn" onClick={hideSuccess}>
                                    OK
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="bento-tile contact-tile-connect reveal">
                        <h3 className="project-title">Let's Connect</h3>
                        <p className="project-text">Prefer social? Reach out on any of these platforms.</p>
                        <div className="connect-socials">
                            {socials.map((social) => (
                                <a key={social.label} href={social.href} target="_blank" rel="noopener noreferrer">
                                    <i className={social.icon}></i> {social.label}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
