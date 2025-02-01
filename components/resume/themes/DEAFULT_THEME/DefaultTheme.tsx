'use client'

import {RefObject} from 'react'
import PersonalInfoSection from '@/components/resume/themes/DEAFULT_THEME/sections/PersonalInfoSection'
import EducationSection from '@/components/resume/themes/DEAFULT_THEME/sections/EducationSection'
import ExperienceSection from '@/components/resume/themes/DEAFULT_THEME/sections/ExperienceSection'
import {ResumeSection} from '@/lib/resume/types'
import {UserInfo} from '@/lib/user-info/types'

const DefaultTheme = ({sections, personalInfoData, resumeRef}: {
	sections?: ResumeSection[],
	personalInfoData?: UserInfo,
	resumeRef?: RefObject<HTMLDivElement | null>
}) => {
	return (
		<div ref={resumeRef}>
			<div className="p-12">
				<PersonalInfoSection personalInfoData={personalInfoData}/>
				{sections?.map((section, index) => (
					<div key={section.id} className="space-y-4">
						{section.type === 'Education' && <EducationSection
							section={section as any}
							previousSectionType={sections[index - 1]?.type}
						/>}

						{section.type === 'Experience' && <ExperienceSection
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
