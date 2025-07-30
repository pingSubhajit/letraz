import React from 'react'
import {ResumeSection} from '@/lib/resume/types'
import {Certification} from '@/lib/certification/types'

// Types for the processed data
export interface CertificationData {
  name: string
  issuingOrganization: {
    hasOrganization: boolean
    value?: string
  }
  issueDate: {
    hasDate: boolean
    formatted?: string
  }
  credentialUrl: {
    hasUrl: boolean
    value?: string
  }
  spacing: {
    marginTop: boolean
  }
}

// Controller hook that processes raw Certification data into display-ready data
export const useCertificationController = (
	section: ResumeSection & { type: 'Certification', data: Certification },
	isFirstInGroup: boolean
): CertificationData => {
	return React.useMemo(() => {
		const {data: certification} = section

		// Process issuing organization
		const issuingOrganization = {
			hasOrganization: Boolean(certification.issuing_organization),
			value: certification.issuing_organization || undefined
		}

		const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
			'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

		// Process issue date
		const formatDate = (dateString: string | null | undefined) => {
			if (!dateString) return undefined

			try {
				const date = new Date(dateString)
				const month = MONTH_NAMES[date.getMonth()]
				const year = date.getFullYear()
				return `${month} ${year}`
			} catch {
				return dateString
			}
		}

		const issueDate = {
			hasDate: Boolean(certification.issue_date),
			formatted: formatDate(certification.issue_date)
		}

		// Process credential URL
		const credentialUrl = {
			hasUrl: Boolean(certification.credential_url),
			value: certification.credential_url || undefined
		}

		// Spacing only between sections within the same group
		const spacing = {
			marginTop: !isFirstInGroup
		}

		return {
			name: certification.name,
			issuingOrganization,
			issueDate,
			credentialUrl,
			spacing
		}
	}, [section, isFirstInGroup])
}

// HOC wrapper for theme components
export interface CertificationControllerProps {
  section: ResumeSection & { type: 'Certification', data: Certification }
  isFirstInGroup: boolean
  children: (data: CertificationData) => React.ReactNode
}

export const CertificationController: React.FC<CertificationControllerProps> = ({
	section,
	isFirstInGroup,
	children
}) => {
	const processedData = useCertificationController(section, isFirstInGroup)
	return <>{children(processedData)}</>
}
