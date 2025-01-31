import {cn} from '@/lib/utils'
import {Divider, SectionTitle} from '@/components/resume/themes/DEAFULT_THEME/shared/Components'
import {ResumeSection, ResumeSectionSchema} from '@/lib/resume/types'
import {Education} from '@/lib/education/types'

type EducationSectionProps = {
	section: ResumeSection & { type: 'Education', data: Education }
	previousSectionType?: typeof ResumeSectionSchema._type.type
}

const EducationSection = ({section, previousSectionType}: EducationSectionProps) => {
	const {data: education} = section

	return (
		<div className={cn('flex flex-col items-stretch pl-4', previousSectionType === 'Education' && 'mt-2')}>
			{/* TITLE */}
			{previousSectionType !== 'Education' && <div className="mt-8 -ml-4">
				<SectionTitle>Education</SectionTitle>

				{/* DIVIDER */}
				<Divider className="mb-1.5"/>
			</div>}

			{/* INSTITUTION & DATES */}
			<div className="w-full flex flex-row items-center justify-between gap-4">
				{/* INSTITUTION */}
				<p className="text-sm leading-normal">
					{education?.institution_name && <span className="font-bold">{education.institution_name}</span>}
					{education?.institution_name && education?.country && <span>, </span>}
					{education?.country && <span>{education.country.name}</span>}
				</p>

				<p className="text-sm">
					{education.started_from_month && education.started_from_year &&
            <span>From {education.started_from_month}/{education.started_from_year}</span>}
					{education.started_from_month && education.started_from_year && education.finished_at_month && education.finished_at_year &&
            <span>&nbsp; &nbsp;</span>}
					{education.finished_at_month && education.finished_at_year &&
            <span>To {education.finished_at_month}/{education.finished_at_year}</span>}
				</p>
			</div>

			{/* DEGREE */}
			<p className="text-sm italic">
				{education.degree && <span>{education.degree}</span>}
				{education.degree && education.field_of_study && <span> in </span>}
				{education.field_of_study && <span>{education.field_of_study}</span>}
			</p>

			{/* DESCRIPTION */}
			{education.description && <div className="text-sm mt-0.5 pl-2 prose prose-sm leading-snug prose-p:m-0 max-w-none" dangerouslySetInnerHTML={{__html: education.description}} />}
		</div>
	)
}

export default EducationSection
