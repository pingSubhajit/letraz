import React from 'react'
import {ResumeSection, ResumeSectionSchema} from '@/lib/resume/types'
import {Education} from '@/lib/education/types'
import {sanitizeHtml} from '@/lib/utils'

// Types for the processed data
export interface EducationData {
  showSectionTitle: boolean
  institution: {
    hasInstitution: boolean
    name?: string
    location?: string
    formatted: string
  }
  dates: {
    hasDates: boolean
    formatted: string
  }
  degree: {
    hasDegree: boolean
    degreeType?: string
    fieldOfStudy?: string
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

// Controller hook that processes raw Education data into display-ready data
export const useEducationController = (
	section: ResumeSection & { type: 'Education', data: Education },
	previousSectionType?: typeof ResumeSectionSchema._type.type
): EducationData => {
	return React.useMemo(() => {
		const {data: education} = section

		// Determine if we should show section title
		const showSectionTitle = previousSectionType !== 'Education'

		// Process institution information
		const institutionParts = [
			education.institution_name,
			education.country?.name
		].filter(Boolean)

		const institution = {
			hasInstitution: institutionParts.length > 0,
			name: education.institution_name || undefined,
			location: education.country?.name || undefined,
			formatted: institutionParts.join(', ')
		}

		// Process dates
		const dateParts = []
		if (education.started_from_month && education.started_from_year) {
			dateParts.push(`From ${education.started_from_month}/${education.started_from_year}`)
		}
		if (education.finished_at_month && education.finished_at_year) {
			dateParts.push(`To ${education.finished_at_month}/${education.finished_at_year}`)
		}

		const dates = {
			hasDates: dateParts.length > 0,
			formatted: dateParts.join('    ')
		}

		// Process degree information
		const degreeParts = []
		if (education.degree) {
			degreeParts.push(education.degree)
		}
		if (education.degree && education.field_of_study) {
			degreeParts.push('in')
		}
		if (education.field_of_study) {
			degreeParts.push(education.field_of_study)
		}

		const degree = {
			hasDegree: Boolean(education.degree || education.field_of_study),
			degreeType: education.degree || undefined,
			fieldOfStudy: education.field_of_study || undefined,
			formatted: degreeParts.join(' ')
		}

		// Process description
		const description = {
			hasDescription: Boolean(education.description),
			sanitizedHtml: education.description
				? sanitizeHtml(education.description)
				: undefined
		}

		// Determine spacing
		const spacing = {
			marginTop: previousSectionType === 'Education'
		}

		return {
			showSectionTitle,
			institution,
			dates,
			degree,
			description,
			spacing
		}
	}, [section, previousSectionType])
}

// HOC wrapper for theme components
export interface EducationControllerProps {
  section: ResumeSection & { type: 'Education', data: Education }
  previousSectionType?: typeof ResumeSectionSchema._type.type
  children: (data: EducationData) => React.ReactNode
}

export const EducationController: React.FC<EducationControllerProps> = ({
	section,
	previousSectionType,
	children
}) => {
	const processedData = useEducationController(section, previousSectionType)
	return <>{children(processedData)}</>
}
