import {cn} from '@/lib/utils'
import {Divider, SectionTitle} from '@/components/resume/themes/DEAFULT_THEME/shared/Components'
import {EducationData} from '@/components/resume/controllers/EducationController'

// Pure UI component - no logic, just presentation
const EducationSection = ({data}: { data: EducationData }) => {
	return (
		<div className={cn('flex flex-col items-stretch pl-4', data.spacing.marginTop && 'mt-2')}>
			{/* TITLE */}
			{data.showSectionTitle && <div className="mt-2 -ml-4">
				<SectionTitle>Education</SectionTitle>

				{/* DIVIDER */}
				<Divider className="mb-1.5"/>
			</div>}

			{/* INSTITUTION & DATES */}
			<div className="w-full flex flex-row items-center justify-between gap-4">
				{/* INSTITUTION */}
				{data.institution.hasInstitution && <p className="text-sm leading-normal font-bold">
					{data.institution.formatted}
				</p>}

				{/* DATES */}
				{data.dates.hasDates && <p className="text-sm">
					{data.dates.formatted}
				</p>}
			</div>

			{/* DEGREE */}
			{data.degree.hasDegree && <p className="text-sm italic">
				{data.degree.formatted}
			</p>}

			{/* DESCRIPTION */}
			{data.description.hasDescription && <div
				className="text-sm mt-0.5 pl-2 prose prose-sm leading-snug prose-p:m-0 max-w-none"
				dangerouslySetInnerHTML={{__html: data.description.sanitizedHtml || ''}}
			/>}
		</div>
	)
}

export default EducationSection
