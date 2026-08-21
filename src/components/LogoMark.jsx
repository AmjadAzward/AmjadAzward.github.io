import { useId } from "react";

export default function LogoMark() {
    const gradientId = useId();

    return (
        <svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">
            <defs>
                <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: "var(--accent-soft)" }} />
                    <stop offset="35%" style={{ stopColor: "var(--accent)" }} />
                    <stop offset="70%" style={{ stopColor: "var(--accent-purple)" }} />
                    <stop offset="100%" style={{ stopColor: "var(--accent-blue)" }} />
                </linearGradient>
            </defs>
            <circle cx="20" cy="20" r="20" fill={`url(#${gradientId})`} />
            <g stroke="#04121c" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <line x1="13" y1="27" x2="20" y2="12" />
                <line x1="20" y1="12" x2="27" y2="27" />
                <line x1="13" y1="27" x2="27" y2="27" />
            </g>
            <circle cx="20" cy="12" r="3.2" fill="#04121c" />
            <circle cx="13" cy="27" r="3.2" fill="#04121c" />
            <circle cx="27" cy="27" r="3.2" fill="#04121c" />
        </svg>
    );
}
