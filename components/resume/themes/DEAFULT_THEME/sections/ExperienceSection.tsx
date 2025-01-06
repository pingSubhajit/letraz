import {ResumeSection, ResumeSections} from '@/db/resumes.schema'
import {experiences} from '@/db/schema'
import {cn} from '@/lib/utils'
import {Divider, SectionTitle} from '@/components/resume/themes/DEAFULT_THEME/shared/Components'

type ExperienceSectionProps = {
  section: ResumeSection & { type: ResumeSections.EXPERIENCE, data: typeof experiences.$inferSelect }
  previousSectionType?: ResumeSections
}

const ExperienceSection = ({section, previousSectionType}: ExperienceSectionProps) => {
	const {data: experience} = section

	return (
		<div className={cn('flex flex-col items-stretch pl-4', previousSectionType === ResumeSections.EXPERIENCE && 'mt-2')}>
			{/* TITLE */}
			{previousSectionType !== ResumeSections.EXPERIENCE && <div className="mt-8 -ml-4">
				<SectionTitle>Experience</SectionTitle>

				{/* DIVIDER */}
				<Divider className="mb-1.5"/>
			</div>}

			{/* COMPANY & DATES */}
			<div className="w-full flex flex-row items-center justify-between gap-4">
				{/* COMPANY */}
				<p className="text-sm leading-normal">
					{experience?.companyName && <span className="font-bold">{experience.companyName}</span>}
					{experience?.companyName && experience?.country && <span>, </span>}
					{experience?.country && <span>{experience.country}</span>}
				</p>

				<p className="text-sm">
					{experience.startedFromMonth && experience.startedFromYear &&
            <span>From {experience.startedFromMonth}/{experience.startedFromYear}</span>}
					{experience.startedFromMonth && experience.startedFromYear && experience.finishedAtMonth && experience.finishedAtYear &&
            <span>    </span>}
					{experience.finishedAtMonth && experience.finishedAtYear &&
            <span>To {experience.finishedAtMonth}/{experience.finishedAtYear}</span>}
				</p>
			</div>

			{/* Role */}
			<p className="text-sm italic">
				{experience.jobTitle && <span>{experience.jobTitle}</span>}
				{experience.jobTitle && experience.employmentType && <span>, </span>}
				{experience.jobTitle && <span>{experience.employmentType}</span>}
			</p>

			{/* DESCRIPTION */}
			{experience.description && <p className="text-sm leading-snug mt-0.5 pl-8">{experience.description}</p>}
		</div>
	)
}

export default ExperienceSection
