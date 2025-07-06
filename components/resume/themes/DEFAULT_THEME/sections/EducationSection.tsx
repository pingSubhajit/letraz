import {charter} from '@/components/resume/themes/DEFAULT_THEME/fonts'
import {EducationData} from '@/components/resume/controllers/EducationController'

const EducationSection = ({data}: { data: EducationData }) => {
	return (
		<div className={`${charter.className} education-item ${data.spacing.marginTop ? 'mt-2' : ''}`}>
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
