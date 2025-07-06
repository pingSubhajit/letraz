import React from 'react'
import {ResumeSection} from '@/lib/resume/types'
import {Experience} from '@/lib/experience/types'
import {sanitizeHtml} from '@/lib/utils'

// Types for the processed data
export interface ExperienceData {
  company: {
    hasCompany: boolean
    name?: string
    location?: string
    formatted: string
  }
  dates: {
    hasDates: boolean
    formatted: string
  }
  role: {
    hasRole: boolean
    title?: string
    employmentType?: string
    formatted: string
  }
  description: {
    hasDescription: boolean
    sanitizedHtml?: string
  }
  spacing: {
    marginTop: boolean
  }
}

// Controller hook that processes raw Experience data into display-ready data
export const useExperienceController = (
	section: ResumeSection & { type: 'Experience', data: Experience },
	isFirstInGroup: boolean
): ExperienceData => {
	return React.useMemo(() => {
		const {data: experience} = section

		// Process company information
		const companyParts = [
			experience.company_name,
			experience.city,
			experience.country?.name
		].filter(Boolean)

		const company = {
			hasCompany: Boolean(experience.company_name),
			name: experience.company_name || undefined,
			location: [experience.city, experience.country?.name].filter(Boolean).join(', ') || undefined,
			formatted: companyParts.join(', ')
		}

		// Process dates - format like "Jul 2023 – Present" or "May 2023 – Jul 2024"
		const formatDate = (month: number, year: number) => {
			const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
				'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
			const monthIndex = month - 1
			return `${monthNames[monthIndex]} ${year}`
		}

		let dateRange = ''
		if (experience.started_from_month && experience.started_from_year) {
			const startDate = formatDate(experience.started_from_month, experience.started_from_year)
			if (experience.current) {
				dateRange = `${startDate} – Present`
			} else if (experience.finished_at_month && experience.finished_at_year) {
				const endDate = formatDate(experience.finished_at_month, experience.finished_at_year)
				dateRange = `${startDate} – ${endDate}`
			} else {
				dateRange = startDate
			}
		}

		const dates = {
			hasDates: Boolean(dateRange),
			formatted: dateRange
		}

		// Process role information
		const roleParts = []
		if (experience.job_title) {
			roleParts.push(experience.job_title)
		}
		if (experience.employment_type) {
			roleParts.push(`(${experience.employment_type})`)
		}

		const role = {
			hasRole: Boolean(experience.job_title),
			title: experience.job_title || undefined,
			employmentType: experience.employment_type || undefined,
			formatted: roleParts.join(' ')
		}

		// Process description
		const description = {
			hasDescription: Boolean(experience.description),
			sanitizedHtml: experience.description
				? sanitizeHtml(experience.description)
				: undefined
		}

		// Spacing only between sections within the same group
		const spacing = {
			marginTop: !isFirstInGroup
		}

		return {
			company,
			dates,
			role,
			description,
			spacing
		}
	}, [section, isFirstInGroup])
}

// HOC wrapper for theme components
export interface ExperienceControllerProps {
  section: ResumeSection & { type: 'Experience', data: Experience }
  isFirstInGroup: boolean
  children: (data: ExperienceData) => React.ReactNode
}

export const ExperienceController: React.FC<ExperienceControllerProps> = ({
	section,
	isFirstInGroup,
	children
}) => {
	const processedData = useExperienceController(section, isFirstInGroup)
	return <>{children(processedData)}</>
}
