'use client'

import {RefObject} from 'react'
import {ResumeSection, ResumeSectionSchema} from '@/lib/resume/types'
import {UserInfo} from '@/lib/user-info/types'
import {Education} from '@/lib/education/types'
import {Experience} from '@/lib/experience/types'
import SmoothScrollProvider from '@/components/providers/SmoothScrollProvider'
import ReorderableSections from '@/components/resume/ReorderableSections'
import {PersonalInfoController, PersonalInfoData} from '@/components/resume/controllers/PersonalInfoController'
import {EducationController, EducationData} from '@/components/resume/controllers/EducationController'
import {ExperienceController, ExperienceData} from '@/components/resume/controllers/ExperienceController'
import {cn} from '@/lib/utils'

// Standard theme props interface
export interface ThemeProps {
	sections?: ResumeSection[]
	personalInfoData?: UserInfo
	resumeRef?: RefObject<HTMLDivElement | null>
	resumeId?: string
}

// Theme components interface - what each theme must provide
export interface ThemeComponents {
	PersonalInfoSection: React.ComponentType<{data: PersonalInfoData}>
	EducationSection: React.ComponentType<{data: EducationData}>
	ExperienceSection: React.ComponentType<{data: ExperienceData}>
}

// Theme configuration interface
export interface ThemeConfig {
	components: ThemeComponents
	className?: string
	/*
	 * Future: add more theme-specific configuration options
	 * - colors, fonts, spacing, layout variants, etc.
	 */
}

// Theme factory function
export const createTheme = (config: ThemeConfig) => {
	return ({sections, personalInfoData, resumeRef, resumeId}: ThemeProps) => {
		const renderSection = (section: ResumeSection, previousSectionType?: typeof ResumeSectionSchema._type.type) => {
			if (section.type === 'Education') {
				return (
					<EducationController
						section={section as ResumeSection & { type: 'Education', data: Education }}
						previousSectionType={previousSectionType}
					>
						{(data) => <config.components.EducationSection data={data} />}
					</EducationController>
				)
			} else if (section.type === 'Experience') {
				return (
					<ExperienceController
						section={section as ResumeSection & { type: 'Experience', data: Experience }}
						previousSectionType={previousSectionType}
					>
						{(data) => <config.components.ExperienceSection data={data} />}
					</ExperienceController>
				)
			}
			return null
		}

		// Common theme structure - consistent across all themes
		return (
			<SmoothScrollProvider className={cn('h-full p-12 overflow-y-auto', config.className)}>
				<PersonalInfoController personalInfoData={personalInfoData}>
					{(data) => <config.components.PersonalInfoSection data={data} />}
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
}

// Helper type for theme creators
export type ThemeCreator = (config: ThemeConfig) => React.ComponentType<ThemeProps>
