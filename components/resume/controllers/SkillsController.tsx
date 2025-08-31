import React from 'react'
import {ResumeSection} from '@/lib/resume/types'
import {ResumeSkill, skillLevels} from '@/lib/skill/types'

// Types for the processed data
export interface SkillData {
  id: string
  name: string
  category?: string
  level: {
    hasLevel: boolean
    label?: string
    color?: string
  }
}

export interface SkillsData {
  skills: SkillData[]
  groupedSkills: Record<string, SkillData[]>
  spacing: {
    marginTop: boolean
  }
}

// Controller hook that processes raw ResumeSkill data into display-ready data
export const useSkillsController = (
	section: ResumeSection & { type: 'Skill', data: { skills: ResumeSkill[] } },
	isFirstInGroup: boolean
): SkillsData => {
	return React.useMemo(() => {
		const {data: {skills: resumeSkills}} = section

		// Process individual skills
		const skills: SkillData[] = resumeSkills.map(resumeSkill => {
			const skill = resumeSkill.skill

			// Find level information
			const levelInfo = resumeSkill.level
				? skillLevels.find(level => level.value === resumeSkill.level)
				: null

			return {
				id: resumeSkill.id,
				name: skill.name,
				category: skill.category || 'Other',
				level: {
					hasLevel: Boolean(levelInfo),
					label: levelInfo?.label,
					color: levelInfo?.color
				}
			}
		})

		// Group skills by category
		const groupedSkills: Record<string, SkillData[]> = {}
		skills.forEach(skill => {
			const category = skill.category || 'Other'
			if (!groupedSkills[category]) {
				groupedSkills[category] = []
			}
			groupedSkills[category].push(skill)
		})

		// Spacing only between sections within the same group
		const spacing = {
			marginTop: !isFirstInGroup
		}

		return {
			skills,
			groupedSkills,
			spacing
		}
	}, [section, isFirstInGroup])
}

// HOC wrapper for theme components
export interface SkillsControllerProps {
  section: ResumeSection & { type: 'Skill', data: { skills: ResumeSkill[] } }
  isFirstInGroup: boolean
  children: (data: SkillsData) => React.ReactNode
}

export const SkillsController: React.FC<SkillsControllerProps> = ({
	section,
	isFirstInGroup,
	children
}) => {
	const processedData = useSkillsController(section, isFirstInGroup)
	return <>{children(processedData)}</>
}
