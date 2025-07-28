import {charter} from '@/components/resume/themes/DEFAULT_THEME/fonts'
import {SkillsData} from '@/components/resume/controllers/SkillsController'
import {useResumeHighlight} from '@/components/resume/contexts/ResumeHighlightContext'
import {cn} from '@/lib/utils'

const SkillsSection = ({data}: { data: SkillsData }) => {
	const {highlightedItem} = useResumeHighlight()
	const isHighlighted = highlightedItem?.type === 'skill'

	return (
		<div
			className={cn(
				charter.className,
				'skills-section transition-all duration-300',
				data.spacing.marginTop ? 'mt-2' : '',
				isHighlighted && 'bg-yellow-100/50 animate-pulse shadow-sm rounded-md px-2 py-1'
			)}
			data-resume-item="skill-section"
		>
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
