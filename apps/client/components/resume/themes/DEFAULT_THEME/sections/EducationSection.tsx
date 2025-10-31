import {charter} from '@/components/resume/themes/DEFAULT_THEME/fonts'
import {EducationData} from '@/components/resume/controllers/EducationController'
import {cn} from '@/lib/utils'

const EducationSection = ({data}: { data: EducationData }) => {
	return (
		<div
			className={cn(
				charter.className,
				'education-item transition-all duration-300',
				data.spacing.marginTop ? 'mt-2' : ''
			)}
			data-resume-item={`education-${data.id}`}
		>
			<div className="education-header">
				<span className="education-title">
					{data.institution.name && (
						<span className="title-bold">{data.institution.name}</span>
					)}
					{data.institution.name && data.degree.hasDegree && ', '}
					{data.degree.hasDegree && data.degree.formatted}
				</span>
				{data.dates.hasDates && (
					<span className="education-date">
						{data.dates.formatted}
					</span>
				)}
			</div>
			{data.description.hasDescription && (
				<div
					className="education-details"
					dangerouslySetInnerHTML={{__html: data.description.sanitizedHtml || ''}}
				/>
			)}
		</div>
	)
}

export default EducationSection
