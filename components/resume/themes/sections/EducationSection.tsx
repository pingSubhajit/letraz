import {ResumeSection, ResumeSections} from '@/db/resumes.schema'
import {educations} from '@/db/schema'
import {cn} from '@/lib/utils'
import {Divider, SectionTitle} from '../shared/Components'

type EducationSectionProps = {
  section: ResumeSection & { type: ResumeSections.EDUCATION, data: typeof educations.$inferSelect }
  previousSectionType?: ResumeSections
}

const EducationSection = ({section, previousSectionType}: EducationSectionProps) => {
	const {data: education} = section

	return (
		<div className={cn('flex flex-col items-stretch pl-4', previousSectionType === ResumeSections.EDUCATION && 'mt-2')}>
			{/* TITLE */}
			{previousSectionType !== ResumeSections.EDUCATION && <div className="mt-8 -ml-4">
				<SectionTitle>Education</SectionTitle>

				{/* DIVIDER */}
				<Divider className="mb-1.5"/>
			</div>}

			{/* INSTITUTION & DATES */}
			<div className="w-full flex flex-row items-center justify-between gap-4">
				{/* INSTITUTION */}
				<p className="text-sm leading-normal">
					{education?.institutionName && <span className="font-bold">{education.institutionName}</span>}
					{education?.institutionName && education?.country && <span>, </span>}
					{education?.country && <span>{education.country}</span>}
				</p>

				<p className="text-sm">
					{education.startedFromMonth && education.startedFromYear &&
            <span>From {education.startedFromMonth}/{education.startedFromYear}</span>}
					{education.startedFromMonth && education.startedFromYear && education.finishedAtMonth && education.finishedAtYear &&
            <span>&nbsp; &nbsp;</span>}
					{education.finishedAtMonth && education.finishedAtYear &&
            <span>To {education.finishedAtMonth}/{education.finishedAtYear}</span>}
				</p>
			</div>

			{/* DEGREE */}
			<p className="text-sm italic">
				{education.degree && <span>{education.degree}</span>}
				{education.degree && education.fieldOfStudy && <span> in </span>}
				{education.fieldOfStudy && <span>{education.fieldOfStudy}</span>}
			</p>

			{/* DESCRIPTION */}
			{education.description && <p className="text-sm leading-snug mt-0.5 pl-8">{education.description}</p>}
		</div>
	)
}

export default EducationSection
