'use client'

import {personalInfo} from '@/db/personalInfo.schema'
import {ResumeSection, ResumeSections} from '@/db/resumes.schema'
import {LegacyRef} from 'react'
import PersonalInfoSection from '@/components/resume/themes/DEAFULT_THEME/sections/PersonalInfoSection'
import EducationSection from '@/components/resume/themes/DEAFULT_THEME/sections/EducationSection'
import ExperienceSection from '@/components/resume/themes/DEAFULT_THEME/sections/ExperienceSection'

const DefaultTheme = ({sections, personalInfoData, resumeRef}: {
	sections?: ResumeSection[],
	personalInfoData?: typeof personalInfo.$inferSelect,
	resumeRef?: LegacyRef<any>
}) => {
	return (
		<div ref={resumeRef}>
			<div className="p-12">
				<PersonalInfoSection personalInfoData={personalInfoData}/>
				{sections?.map((section, index) => (
					<div key={section.id} className="space-y-4">
						{section.type === ResumeSections.EDUCATION && <EducationSection
							section={section as any}
							previousSectionType={sections[index - 1]?.type}
						/>}

						{section.type === ResumeSections.EXPERIENCE && <ExperienceSection
							section={section as any}
							previousSectionType={sections[index - 1]?.type}
						/>}
					</div>
				))}
			</div>
		</div>
	)
}

export default DefaultTheme
