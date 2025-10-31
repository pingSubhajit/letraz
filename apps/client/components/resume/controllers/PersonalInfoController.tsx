import React from 'react'
import {UserInfo} from '@/lib/user-info/types'
import {DateTime} from 'luxon'
import {sanitizeHtml} from '@/lib/utils'

// Types for the processed data
export interface PersonalInfoData {
  name: {
    first: string
    last: string
    full: string
  }
  contact: {
    email?: string
    phone?: string
    website?: string
  }
  location: {
    hasLocation: boolean
    address?: string
    city?: string
    postal?: string
    country?: string
    formatted: string
  }
  dateOfBirth: {
    hasDate: boolean
    formatted?: string
  }
  profile: {
    hasProfile: boolean
    sanitizedText?: string
  }
}

// Controller hook that processes raw UserInfo into display-ready data
export const usePersonalInfoController = (personalInfoData?: UserInfo): PersonalInfoData => {
	return React.useMemo(() => {
		if (!personalInfoData) {
			return {
				name: {first: '', last: '', full: ''},
				contact: {},
				location: {hasLocation: false, formatted: ''},
				dateOfBirth: {hasDate: false},
				profile: {hasProfile: false}
			}
		}

		// Process name
		const name = {
			first: personalInfoData.first_name || '',
			last: personalInfoData.last_name || '',
			full: `${personalInfoData.first_name || ''} ${personalInfoData.last_name || ''}`.trim()
		}

		// Process contact info
		const contact = {
			email: personalInfoData.email || undefined,
			phone: personalInfoData.phone || undefined,
			website: personalInfoData.website || undefined
		}

		// Process location
		const locationParts = [
			personalInfoData.address,
			personalInfoData.city,
			personalInfoData.postal,
			personalInfoData.country?.name
		].filter(Boolean)

		const location = {
			hasLocation: locationParts.length > 0,
			address: personalInfoData.address || undefined,
			city: personalInfoData.city || undefined,
			postal: personalInfoData.postal || undefined,
			country: personalInfoData.country?.name || undefined,
			formatted: locationParts.join(', ')
		}

		// Process date of birth
		let dateOfBirth: PersonalInfoData['dateOfBirth'] = {hasDate: false, formatted: undefined}
		if (personalInfoData.dob) {
			const dateTime = DateTime.fromISO(personalInfoData.dob.toString())
			if (dateTime.isValid) {
				dateOfBirth = {
					hasDate: true,
					formatted: dateTime.toLocaleString()
				}
			}
		}

		// Process profile
		const profile = {
			hasProfile: Boolean(personalInfoData.profile_text),
			sanitizedText: personalInfoData.profile_text
				? sanitizeHtml(personalInfoData.profile_text)
				: undefined
		}

		return {
			name,
			contact,
			location,
			dateOfBirth,
			profile
		}
	}, [personalInfoData])
}

// HOC wrapper for theme components
export interface PersonalInfoControllerProps {
  personalInfoData?: UserInfo
  children: (data: PersonalInfoData) => React.ReactNode
}

export const PersonalInfoController: React.FC<PersonalInfoControllerProps> = ({
	personalInfoData,
	children
}) => {
	const processedData = usePersonalInfoController(personalInfoData)
	return <>{children(processedData)}</>
}
