import {charter} from '@/components/resume/themes/DEFAULT_THEME/fonts'
import {SkillsData} from '@/components/resume/controllers/SkillsController'

const SkillsSection = ({data}: { data: SkillsData }) => {
	return (
		<div className={`${charter.className} skills-section ${data.spacing.marginTop ? 'mt-2' : ''}`}>
			{Object.entries(data.groupedSkills).map(([category, skills]) => (
				<div key={category} className="skill-category">
					<span className="skill-category-name">{category}:</span>
					{' '}
					<span className="skill-list">
						{skills.map((skill, index) => (
							<span key={skill.name}>
								{skill.name}
								{index < skills.length - 1 && ', '}
							</span>
						))}
					</span>
				</div>
			))}
		</div>
	)
}

export default SkillsSection