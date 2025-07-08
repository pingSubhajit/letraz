import {cn} from '@/lib/utils'
import {ExperienceData} from '@/components/resume/controllers/ExperienceController'

// Pure UI component - no logic, just presentation
const ExperienceSection = ({data}: { data: ExperienceData }) => {
	return (
		<div className={cn('flex flex-col items-stretch pl-4', data.spacing.marginTop && 'mt-2')}>
			{/* COMPANY & DATES */}
			<div className="w-full flex flex-row items-center justify-between gap-4">
				{/* COMPANY */}
				{data.company.hasCompany && <p className="text-sm leading-normal font-bold">
					{data.company.formatted}
				</p>}

				{/* DATES */}
				{data.dates.hasDates && <p className="text-sm">
					{data.dates.formatted}
				</p>}
			</div>

			{/* Role */}
			{data.role.hasRole && <p className="text-sm italic">
				{data.role.formatted}
			</p>}

			{/* DESCRIPTION */}
			{data.description.hasDescription && <div
				className="text-sm mt-0.5 pl-2 prose prose-sm leading-snug prose-p:m-0 max-w-none"
				dangerouslySetInnerHTML={{__html: data.description.sanitizedHtml || ''}}
			/>}
		</div>
	)
}

export default ExperienceSection
