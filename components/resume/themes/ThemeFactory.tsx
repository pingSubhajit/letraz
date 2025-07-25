'use client'

import {RefObject} from 'react'
import {ResumeSection} from '@/lib/resume/types'
import {UserInfo} from '@/lib/user-info/types'
import {Education} from '@/lib/education/types'
import {Experience} from '@/lib/experience/types'
import {ResumeSkill} from '@/lib/skill/types'
import {Project} from '@/lib/project/types'
import SmoothScrollProvider from '@/components/providers/SmoothScrollProvider'
import ReorderableSections from '@/components/resume/ReorderableSections'
import {PersonalInfoController, PersonalInfoData} from '@/components/resume/controllers/PersonalInfoController'
import {EducationController, EducationData} from '@/components/resume/controllers/EducationController'
import {ExperienceController, ExperienceData} from '@/components/resume/controllers/ExperienceController'
import {SkillsController, SkillsData} from '@/components/resume/controllers/SkillsController'
import {ProjectController, ProjectData} from '@/components/resume/controllers/ProjectController'
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
	SkillsSection: React.ComponentType<{data: SkillsData}>
	ProjectsSection: React.ComponentType<{data: ProjectData}>
	EducationTitle: React.ComponentType
	ExperienceTitle: React.ComponentType
	SkillsTitle: React.ComponentType
	ProjectsTitle: React.ComponentType
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
		const renderSection = (section: ResumeSection, isFirstInGroup: boolean) => {
			// Return title and content separately
			const titleComponent = (() => {
				if (!isFirstInGroup) return null

				if (section.type === 'Education') {
					return <config.components.EducationTitle />
				} else if (section.type === 'Experience') {
					return <config.components.ExperienceTitle />
				} else if (section.type === 'Skill') {
					return <config.components.SkillsTitle />
				} else if (section.type === 'Project') {
					return <config.components.ProjectsTitle />
				}
				return null
			})()

			// Render section content
			const contentComponent = (() => {
				if (section.type === 'Education') {
					return (
						<EducationController
							section={section as ResumeSection & { type: 'Education', data: Education }}
							isFirstInGroup={isFirstInGroup}
						>
							{(data) => <config.components.EducationSection data={data} />}
						</EducationController>
					)
				} else if (section.type === 'Experience') {
					return (
						<ExperienceController
							section={section as ResumeSection & { type: 'Experience', data: Experience }}
							isFirstInGroup={isFirstInGroup}
						>
							{(data) => <config.components.ExperienceSection data={data} />}
						</ExperienceController>
					)
				} else if (section.type === 'Skill') {
					return (
						<SkillsController
							section={section as ResumeSection & { type: 'Skill', data: ResumeSkill[] }}
							isFirstInGroup={isFirstInGroup}
						>
							{(data) => <config.components.SkillsSection data={data} />}
						</SkillsController>
					)
				} else if (section.type === 'Project') {
					return (
						<ProjectController
							section={section as ResumeSection & { type: 'Project', data: Project }}
							isFirstInGroup={isFirstInGroup}
						>
							{(data) => <config.components.ProjectsSection data={data} />}
						</ProjectController>
					)
				}
				return null
			})()

			return {
				title: titleComponent,
				content: contentComponent
			}
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
