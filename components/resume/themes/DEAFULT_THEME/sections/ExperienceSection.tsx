import {cn} from '@/lib/utils'
import {Divider, SectionTitle} from '@/components/resume/themes/DEAFULT_THEME/shared/Components'
import {ResumeSection, ResumeSectionSchema} from '@/lib/resume/types'
import {Experience} from '@/lib/experience/types'

type ExperienceSectionProps = {
  section: ResumeSection & { type: 'Experience', data: Experience }
  previousSectionType?: typeof ResumeSectionSchema._type.type
}

const ExperienceSection = ({section, previousSectionType}: ExperienceSectionProps) => {
	const {data: experience} = section

	return (
		<div className={cn('flex flex-col items-stretch pl-4', previousSectionType === 'Experience' && 'mt-2')}>
			{/* TITLE */}
			{previousSectionType !== 'Experience' && <div className="mt-8 -ml-4">
				<SectionTitle>Experience</SectionTitle>

				{/* DIVIDER */}
				<Divider className="mb-1.5"/>
			</div>}

			{/* COMPANY & DATES */}
			<div className="w-full flex flex-row items-center justify-between gap-4">
				{/* COMPANY */}
				<p className="text-sm leading-normal">
					{experience?.company_name && <span className="font-bold">{experience.company_name}</span>}
					{experience?.company_name && experience?.country && <span>, </span>}
					{experience?.country && <span>{experience.country.name}</span>}
				</p>

				<p className="text-sm">
					{experience.started_from_month && experience.started_from_year &&
            <span>From {experience.started_from_month}/{experience.started_from_year}</span>}
					{experience.started_from_month && experience.started_from_year && experience.finished_at_month && experience.finished_at_year &&
            <span>    </span>}
					{experience.finished_at_month && experience.finished_at_year &&
            <span>To {experience.finished_at_month}/{experience.finished_at_year}</span>}
				</p>
			</div>

			{/* Role */}
			<p className="text-sm italic">
				{experience.job_title && <span>{experience.job_title}</span>}
				{experience.job_title && experience.employment_type && <span>, </span>}
				{experience.job_title && <span>{experience.employment_type}</span>}
			</p>

			{/* DESCRIPTION */}
			{experience.description && <div className="text-sm mt-0.5 pl-2 prose prose-sm leading-snug prose-p:m-0 max-w-none" dangerouslySetInnerHTML={{__html: experience.description}}/>}
		</div>
	)
}

export default ExperienceSection
