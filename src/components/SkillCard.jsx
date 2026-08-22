export default function SkillCard({ skill, ariaHidden }) {
    return (
        <div className="skill-tile" aria-hidden={ariaHidden || undefined}>
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
    );
}
