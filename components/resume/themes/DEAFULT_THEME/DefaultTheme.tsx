'use client'

import {RefObject} from 'react'
import PersonalInfoSection from '@/components/resume/themes/DEAFULT_THEME/sections/PersonalInfoSection'
import EducationSection from '@/components/resume/themes/DEAFULT_THEME/sections/EducationSection'
import ExperienceSection from '@/components/resume/themes/DEAFULT_THEME/sections/ExperienceSection'
import {ResumeSection, ResumeSectionSchema} from '@/lib/resume/types'
import {UserInfo} from '@/lib/user-info/types'
import {Education} from '@/lib/education/types'
import {Experience} from '@/lib/experience/types'
import SmoothScrollProvider from '@/components/providers/SmoothScrollProvider'
import ReorderableSections from '@/components/resume/ReorderableSections'
import {PersonalInfoController} from '@/components/resume/controllers/PersonalInfoController'
import {EducationController} from '@/components/resume/controllers/EducationController'
import {ExperienceController} from '@/components/resume/controllers/ExperienceController'

const DefaultTheme = ({sections, personalInfoData, resumeRef, resumeId}: {
	sections?: ResumeSection[],
	personalInfoData?: UserInfo,
	resumeRef?: RefObject<HTMLDivElement | null>,
	resumeId?: string
}) => {
	// Theme-specific section rendering logic
	const renderSection = (section: ResumeSection, previousSectionType?: typeof ResumeSectionSchema._type.type) => {
		if (section.type === 'Education') {
			return (
				<EducationController
					section={section as ResumeSection & { type: 'Education', data: Education }}
					previousSectionType={previousSectionType}
				>
					{(data) => <EducationSection data={data} />}
				</EducationController>
			)
		} else if (section.type === 'Experience') {
			return (
				<ExperienceController
					section={section as ResumeSection & { type: 'Experience', data: Experience }}
					previousSectionType={previousSectionType}
				>
					{(data) => <ExperienceSection data={data} />}
				</ExperienceController>
			)
		}
		return null
	}

	return (
		<SmoothScrollProvider className="h-full p-12 overflow-y-auto">
			<PersonalInfoController personalInfoData={personalInfoData}>
				{(data) => <PersonalInfoSection data={data} />}
			</PersonalInfoController>

			{sections && sections.length > 0 && resumeId && (
				<ReorderableSections
					sections={sections}
					resumeId={resumeId}
					className="mt-6"
					renderSection={renderSection}
				/>
			)}

			<div className="absolute w-full h-24 bg-gradient-to-b from-transparent to-neutral-50 bottom-0 inset-x-0" />
		</SmoothScrollProvider>
	)
}

export default DefaultTheme
