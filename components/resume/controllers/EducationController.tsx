import React from 'react'
import {ResumeSection} from '@/lib/resume/types'
import {Education} from '@/lib/education/types'
import {sanitizeHtml} from '@/lib/utils'

// Types for the processed data
export interface EducationData {
  educationId:string
  institution: {
    hasInstitution: boolean
    name?: string
    location?: string
    formatted: string
  }
  dates: {
    hasDates: boolean
	startMonth?:number|null
	startYear?:number|null
	endMonth?:number|null
	endYear?:number|null
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
	isFirstInGroup: boolean
): EducationData => {
	return React.useMemo(() => {
		const {data: education} = section

		// Process institution information
		const institutionParts = [
			education.institution_name,
			education.country?.name
		].filter(Boolean)

		const institution :EducationData['institution'] = {
			hasInstitution: institutionParts.length > 0,
			name: education.institution_name || undefined,
			location: education.country?.name || undefined,
			formatted: institutionParts.join(', ')
		}

		// Process dates - format like HTML: 2015 – 2019
		const dateParts = []
		if (education.started_from_year) {
			dateParts.push(education.started_from_year.toString())
		}
		if (education.finished_at_year) {
			dateParts.push(education.finished_at_year.toString())
		} else if (education.current) {
			dateParts.push('Present')
		}

		const dates :EducationData['dates'] = {
			hasDates: dateParts.length > 0,
			startMonth: education.started_from_month,
			startYear: education.started_from_year,
			endMonth: education.finished_at_month,
			endYear: education.finished_at_year
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

		// Spacing only between sections within the same group
		const spacing = {
			marginTop: !isFirstInGroup
		}

		return {
			educationId: education.id,
			institution,
			dates,
			degree,
			description,
			spacing
		}
	}, [section, isFirstInGroup])
}

// HOC wrapper for theme components
export interface EducationControllerProps {
  section: ResumeSection & { type: 'Education', data: Education }
  isFirstInGroup: boolean
  children: (data: EducationData) => React.ReactNode
  className?: string
}

export const EducationController: React.FC<EducationControllerProps> = ({
	section,
	isFirstInGroup,
	children,
	className
}) => {
	const processedData = useEducationController(section, isFirstInGroup)
	return <div className={className}>{children(processedData)}</div>
}
