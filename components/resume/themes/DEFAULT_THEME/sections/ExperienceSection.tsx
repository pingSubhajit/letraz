import {charter} from '@/components/resume/themes/DEFAULT_THEME/fonts'
import {ExperienceData} from '@/components/resume/controllers/ExperienceController'

// Pure UI component - no logic, just presentation
const ExperienceSection = ({data}: { data: ExperienceData }) => {
	return (
		<div className={`${charter.className} experience-item ${data.spacing.marginTop ? 'mt-2' : ''}`}>
			{/* JOB HEADER */}
			<div className="job-header">
				{/* JOB TITLE (Role + Company) */}
				<span className="job-title">
					{data.role.hasRole && (
						<span className="title-bold">{data.role.formatted}</span>
					)}
					{data.role.hasRole && data.company.hasCompany && ', '}
					{data.company.hasCompany && data.company.formatted}
				</span>

				{/* JOB DATE */}
				{data.dates.hasDates && (
					<span className="job-date">{data.dates.formatted}</span>
				)}
			</div>

			{/* JOB DETAILS */}
			{data.description.hasDescription && (
				<div
					className="job-details"
					dangerouslySetInnerHTML={{__html: data.description.sanitizedHtml || ''}}
				/>
			)}
		</div>
	)
}

export default ExperienceSection
