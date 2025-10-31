'use client'

import {RefObject} from 'react'
import {ResumeSection} from '@/lib/resume/types'
import {UserInfo} from '@/lib/user-info/types'
import {Education} from '@/lib/education/types'
import {Experience} from '@/lib/experience/types'
import {Project} from '@/lib/project/types'
import {ResumeSkillSection} from '@/lib/skill/types'
import {Certification} from '@/lib/certification/types'
import SmoothScrollProvider from '@/components/providers/SmoothScrollProvider'
import ReorderableSections from '@/components/resume/ReorderableSections'
import {PersonalInfoController, PersonalInfoData} from '@/components/resume/controllers/PersonalInfoController'
import {EducationController, EducationData} from '@/components/resume/controllers/EducationController'
import {ExperienceController, ExperienceData} from '@/components/resume/controllers/ExperienceController'
import {SkillsController, SkillsData} from '@/components/resume/controllers/SkillsController'
import {ProjectController, ProjectData} from '@/components/resume/controllers/ProjectController'
import {CertificationController, CertificationData} from '@/components/resume/controllers/CertificationController'
import {cn} from '@/lib/utils'
import {useResumeHighlight} from '../contexts/ResumeHighlightContext'

// Wrapper that subscribes to ResumeHighlightContext and applies dim/bright classes
const HighlightWrapper: React.FC<{
	itemType: 'education' | 'experience' | 'project' | 'skill' | 'certification' | 'personal'
	itemId?: string | number
	children: React.ReactNode
}> = ({itemType, itemId, children}) => {
	const {highlightedItem} = useResumeHighlight()

	const isHighlighted =
		highlightedItem?.type === itemType &&
		(itemId === undefined || highlightedItem.id === itemId)

	const isDimmed = highlightedItem !== null && !isHighlighted

	return (
		<div className={cn(
			'transition-all duration-300 ease-in-out',
			isDimmed && 'opacity-20 blur-[1px]',
			isHighlighted && 'opacity-100'
		)}>
			{children}
		</div>
	)
}

// Title wrapper: dims (opacity-20 blur) when any item is highlighted; never brightens
const TitleDimWrapper: React.FC<{children: React.ReactNode}> = ({children}) => {
	const {highlightedItem} = useResumeHighlight()
	return (
		<div className={cn(
			'transition-all duration-300 ease-in-out',
			highlightedItem && 'opacity-20 blur-[1px]'
		)}>
			{children}
		</div>
	)
}

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
	CertificationSection: React.ComponentType<{data: CertificationData}>
	EducationTitle: React.ComponentType
	ExperienceTitle: React.ComponentType
	SkillsTitle: React.ComponentType
	ProjectsTitle: React.ComponentType
	CertificationTitle: React.ComponentType
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
					return (
						<TitleDimWrapper>
							<config.components.EducationTitle />
						</TitleDimWrapper>
					)
				} else if (section.type === 'Experience') {
					return (
						<TitleDimWrapper>
							<config.components.ExperienceTitle />
						</TitleDimWrapper>
					)
				} else if (section.type === 'Skill') {
					return (
						<TitleDimWrapper>
							<config.components.SkillsTitle />
						</TitleDimWrapper>
					)
				} else if (section.type === 'Project') {
					return (
						<TitleDimWrapper>
							<config.components.ProjectsTitle />
						</TitleDimWrapper>
					)
				} else if (section.type === 'Certification') {
					return (
						<TitleDimWrapper>
							<config.components.CertificationTitle />
						</TitleDimWrapper>
					)
				}
				return null
			})()

			// Render section content
			const contentComponent = (() => {
				if (section.type === 'Education') {
					return (
						<HighlightWrapper itemType="education" itemId={(section.data as any).id}>
							<EducationController
								section={section as ResumeSection & { type: 'Education', data: Education }}
								isFirstInGroup={isFirstInGroup}
							>
								{(data) => <config.components.EducationSection data={data} />}
							</EducationController>
						</HighlightWrapper>
					)
				} else if (section.type === 'Experience') {
					return (
						<HighlightWrapper itemType="experience" itemId={(section.data as any).id}>
							<ExperienceController
								section={section as ResumeSection & { type: 'Experience', data: Experience }}
								isFirstInGroup={isFirstInGroup}
							>
								{(data) => <config.components.ExperienceSection data={data} />}
							</ExperienceController>
						</HighlightWrapper>
					)
				} else if (section.type === 'Skill') {
					return (
						<HighlightWrapper itemType="skill">
							<SkillsController
								section={section as ResumeSection & { type: 'Skill', data: ResumeSkillSection }}
								isFirstInGroup={isFirstInGroup}
							>
								{(data) => <config.components.SkillsSection data={data} />}
							</SkillsController>
						</HighlightWrapper>
					)
				} else if (section.type === 'Project') {
					return (
						<HighlightWrapper itemType="project" itemId={(section.data as any).id}>
							<ProjectController
								section={section as ResumeSection & { type: 'Project', data: Project }}
								isFirstInGroup={isFirstInGroup}
							>
								{(data) => <config.components.ProjectsSection data={data} />}
							</ProjectController>
						</HighlightWrapper>
					)
				} else if (section.type === 'Certification') {
					return (
						<HighlightWrapper itemType="certification" itemId={(section.data as any).id}>
							<CertificationController
								section={section as ResumeSection & { type: 'Certification', data: Certification }}
								isFirstInGroup={isFirstInGroup}
							>
								{(data) => <config.components.CertificationSection data={data} />}
							</CertificationController>
						</HighlightWrapper>
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
			<SmoothScrollProvider className={cn('h-full p-12 overflow-y-auto hide-scrollbar', config.className)}>
				<PersonalInfoController personalInfoData={personalInfoData}>
					{(data) => (
						<HighlightWrapper itemType="personal">
							<config.components.PersonalInfoSection data={data} />
						</HighlightWrapper>
					)}
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
