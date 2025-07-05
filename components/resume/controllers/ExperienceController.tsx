import React from 'react'
import {ResumeSection, ResumeSectionSchema} from '@/lib/resume/types'
import {Experience} from '@/lib/experience/types'
import {sanitizeHtml} from '@/lib/utils'

// Types for the processed data
export interface ExperienceData {
  showSectionTitle: boolean
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
	previousSectionType?: typeof ResumeSectionSchema._type.type
): ExperienceData => {
	return React.useMemo(() => {
		const {data: experience} = section

		// Determine if we should show section title
		const showSectionTitle = previousSectionType !== 'Experience'

		// Process company information
		const companyParts = [
			experience.company_name,
			experience.country?.name
		].filter(Boolean)

		const company = {
			hasCompany: companyParts.length > 0,
			name: experience.company_name || undefined,
			location: experience.country?.name || undefined,
			formatted: companyParts.join(', ')
		}

		// Process dates
		const dateParts = []
		if (experience.started_from_month && experience.started_from_year) {
			dateParts.push(`From ${experience.started_from_month}/${experience.started_from_year}`)
		}
		if (experience.finished_at_month && experience.finished_at_year) {
			dateParts.push(`To ${experience.finished_at_month}/${experience.finished_at_year}`)
		}

		const dates = {
			hasDates: dateParts.length > 0,
			formatted: dateParts.join('    ')
		}

		// Process role information
		const roleParts = [
			experience.job_title,
			experience.employment_type
		].filter(Boolean)

		const role = {
			hasRole: roleParts.length > 0,
			title: experience.job_title || undefined,
			employmentType: experience.employment_type || undefined,
			formatted: roleParts.join(', ')
		}

		// Process description
		const description = {
			hasDescription: Boolean(experience.description),
			sanitizedHtml: experience.description
				? sanitizeHtml(experience.description)
				: undefined
		}

		// Determine spacing
		const spacing = {
			marginTop: previousSectionType === 'Experience'
		}

		return {
			showSectionTitle,
			company,
			dates,
			role,
			description,
			spacing
		}
	}, [section, previousSectionType])
}

// HOC wrapper for theme components
export interface ExperienceControllerProps {
  section: ResumeSection & { type: 'Experience', data: Experience }
  previousSectionType?: typeof ResumeSectionSchema._type.type
  children: (data: ExperienceData) => React.ReactNode
}

export const ExperienceController: React.FC<ExperienceControllerProps> = ({
	section,
	previousSectionType,
	children
}) => {
	const processedData = useExperienceController(section, previousSectionType)
	return <>{children(processedData)}</>
}
