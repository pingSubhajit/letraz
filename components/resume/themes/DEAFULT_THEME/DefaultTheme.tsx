'use client'

import {RefObject} from 'react'
import PersonalInfoSection from '@/components/resume/themes/DEAFULT_THEME/sections/PersonalInfoSection'
import {ResumeSection} from '@/lib/resume/types'
import {UserInfo} from '@/lib/user-info/types'
import SmoothScrollProvider from '@/components/providers/SmoothScrollProvider'
import ReorderableSections from '@/components/resume/ReorderableSections'

const DefaultTheme = ({sections, personalInfoData, resumeRef, resumeId}: {
	sections?: ResumeSection[],
	personalInfoData?: UserInfo,
	resumeRef?: RefObject<HTMLDivElement | null>,
	resumeId?: string
}) => {
	return (
		<SmoothScrollProvider className="h-full p-12 overflow-y-auto">
			<PersonalInfoSection personalInfoData={personalInfoData}/>

			{sections && sections.length > 0 && resumeId && (
				<ReorderableSections
					sections={sections}
					resumeId={resumeId}
					className="mt-6"
				/>
			)}

			<div className="absolute w-full h-24 bg-gradient-to-b from-transparent to-neutral-50 bottom-0 inset-x-0" />
		</SmoothScrollProvider>
	)
}

export default DefaultTheme
