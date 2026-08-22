import SkillCard from "./SkillCard.jsx";

const SECONDS_PER_CARD = 6;

// A continuous marquee, not a paginated carousel: the track holds the skill
// list twice back-to-back and animates from translateX(0) to translateX(-50%)
// on a linear infinite loop, so the second copy seamlessly picks up where the
// first ends. Hovering anywhere over the row pauses the CSS animation.
export default function SkillCarousel({ skills }) {
    const duration = skills.length * SECONDS_PER_CARD;

    return (
        <div className="skill-carousel">
            <div className="skill-carousel-viewport">
                <div className="skill-carousel-track" style={{ animationDuration: `${duration}s` }}>
                    {skills.map((skill) => (
                        <SkillCard key={`primary-${skill.label}`} skill={skill} />
                    ))}
                    {skills.map((skill) => (
                        <SkillCard key={`repeat-${skill.label}`} skill={skill} ariaHidden />
                    ))}
                </div>
            </div>
        </div>
    );
}
