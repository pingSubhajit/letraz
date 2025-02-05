'use client'

import {RefObject} from 'react'
import PersonalInfoSection from '@/components/resume/themes/DEAFULT_THEME/sections/PersonalInfoSection'
import EducationSection from '@/components/resume/themes/DEAFULT_THEME/sections/EducationSection'
import ExperienceSection from '@/components/resume/themes/DEAFULT_THEME/sections/ExperienceSection'
import {ResumeSection} from '@/lib/resume/types'
import {UserInfo} from '@/lib/user-info/types'
import {motion} from 'motion/react'
import {cn} from '@/lib/utils'
import SmoothScrollProvider from '@/components/providers/SmoothScrollProvider'

const DefaultTheme = ({sections, personalInfoData, resumeRef}: {
	sections?: ResumeSection[],
	personalInfoData?: UserInfo,
	resumeRef?: RefObject<HTMLDivElement | null>
}) => {
	return (
		<SmoothScrollProvider className="h-full p-12 overflow-y-auto">
			<PersonalInfoSection personalInfoData={personalInfoData}/>
			{sections?.map((section, index) => (
				<motion.div
					key={section.id}
					className={cn('space-y-4', index === sections.length - 1 ? 'pb-4' : '')}
				>
					{section.type === 'Education' && <EducationSection
						section={section as any}
						previousSectionType={sections[index - 1]?.type}
					/>}

					{section.type === 'Experience' && <ExperienceSection
						section={section as any}
						previousSectionType={sections[index - 1]?.type}
					/>}
				</motion.div>
			))}

			<div className="absolute w-full h-24 bg-gradient-to-b from-transparent to-neutral-50 bottom-0 inset-x-0" />
		</SmoothScrollProvider>
	)
}

export default DefaultTheme
