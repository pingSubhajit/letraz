import React from 'react'
import {ResumeSection} from '@/lib/resume/types'
import {Project} from '@/lib/project/types'
import {sanitizeHtml} from '@/lib/utils'

// Types for the processed data
export interface ProjectData {
  id: string
  name: string
  category: {
    hasCategory: boolean
    value?: string
  }
  description: {
    hasDescription: boolean
    sanitizedHtml?: string
  }
  technologies: {
    hasTechnologies: boolean
    list: string[]
  }
  role: {
    hasRole: boolean
    value?: string
  }
  links: {
    hasLinks: boolean
    github?: string
    live?: string
  }
  dates: {
    hasDates: boolean
    formatted: string
    // raw fields for editors
    startMonth?: number | null
    startYear?: number | null
    endMonth?: number | null
    endYear?: number | null
    current?: boolean | null
  }
  spacing: {
    marginTop: boolean
  }
}

// Controller hook that processes raw Project data into display-ready data
export const useProjectController = (
	section: ResumeSection & { type: 'Project', data: Project },
	isFirstInGroup: boolean
): ProjectData => {
	return React.useMemo(() => {
		const {data: project} = section

		// Process category
		const category = {
			hasCategory: Boolean(project.category),
			value: project.category || undefined
		}

		// Process description
		const description = {
			hasDescription: Boolean(project.description),
			sanitizedHtml: project.description
				? sanitizeHtml(project.description)
				: undefined
		}

		// Process technologies from skills_used
		const technologies = {
			hasTechnologies: project.skills_used && project.skills_used.length > 0,
			list: project.skills_used?.map(skill => skill.name) || []
		}

		// Process role
		const role = {
			hasRole: Boolean(project.role),
			value: project.role || undefined
		}

		// Process links
		const links = {
			hasLinks: Boolean(project.github_url || project.live_url),
			github: project.github_url || undefined,
			live: project.live_url || undefined
		}

		// Process dates - similar to Experience dates formatting
		const formatDate = (month: number | null | undefined, year: number) => {
			if (!month) {
				return year.toString()
			}

			const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
				'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
			const monthIndex = month - 1

			if (monthIndex < 0 || monthIndex >= monthNames.length) {
				return year.toString()
			}

			return `${monthNames[monthIndex]} ${year}`
		}

		let dateRange = ''
		if (project.started_from_year) {
			const startDate = formatDate(project.started_from_month, project.started_from_year)
			if (project.current) {
				dateRange = `${startDate} – Present`
			} else if (project.finished_at_year) {
				const endDate = formatDate(project.finished_at_month, project.finished_at_year)
				dateRange = `${startDate} – ${endDate}`
			} else {
				dateRange = startDate
			}
		}

		const dates = {
			hasDates: Boolean(dateRange),
			formatted: dateRange,
			startMonth: project.started_from_month,
			startYear: project.started_from_year,
			endMonth: project.finished_at_month,
			endYear: project.finished_at_year,
			current: project.current
		}

		// Spacing only between sections within the same group
		const spacing = {
			marginTop: !isFirstInGroup
		}

		return {
			id: project.id,
			name: project.name,
			category,
			description,
			technologies,
			role,
			links,
			dates,
			spacing
		}
	}, [section, isFirstInGroup])
}

// HOC wrapper for theme components
export interface ProjectControllerProps {
  section: ResumeSection & { type: 'Project', data: Project }
  isFirstInGroup: boolean
  children: (data: ProjectData) => React.ReactNode
}

export const ProjectController: React.FC<ProjectControllerProps> = ({
	section,
	isFirstInGroup,
	children
}) => {
	const processedData = useProjectController(section, isFirstInGroup)
	return <>{children(processedData)}</>
}
