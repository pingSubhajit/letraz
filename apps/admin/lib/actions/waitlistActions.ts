'use server'

import {revalidatePath} from 'next/cache'
import {addEmailsToClerkAllowlist} from './clerkAllowlistActions'

export interface WaitlistEntry {
  id: string
  email: string
  created_at: string
  has_access: boolean
  first_name?: string
  last_name?: string
  signup_date?: string
}

export interface WaitlistResponse {
  success: boolean
  data?: WaitlistEntry[]
  error?: string
}

export interface UpdateWaitlistResponse {
  success: boolean
  error?: string
}

const BACKEND_HOST = process.env.BACKEND_HOST
const ADMIN_API_KEY = process.env.ADMIN_API_KEY

if (!BACKEND_HOST) {
	throw new Error('BACKEND_HOST environment variable is not set')
}

if (!ADMIN_API_KEY) {
	throw new Error('ADMIN_API_KEY environment variable is not set')
}

export const fetchWaitlistEntries = async (): Promise<WaitlistResponse> => {
	try {
		const response = await fetch(`${BACKEND_HOST}/admin/waitlist/`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'x-admin-api-key': ADMIN_API_KEY
			}
		})

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`)
		}

		const data = await response.json()

		return {
			success: true,
			data: data.waitlists
		}
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error occurred'
		}
	}
}

export const updateWaitlistEntry = async (id: string, hasAccess: boolean, email?: string): Promise<UpdateWaitlistResponse> => {
	try {
		const response = await fetch(`${BACKEND_HOST}/admin/waitlist/${id}/`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'x-admin-api-key': ADMIN_API_KEY
			},
			body: JSON.stringify({
				has_access: hasAccess
			})
		})

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`)
		}

		// If granting access and email is provided, also add to Clerk allowlist
		if (hasAccess && email) {
			const clerkResult = await addEmailsToClerkAllowlist([email])
		}

		revalidatePath('/waitlist')
		return {
			success: true
		}
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error occurred'
		}
	}
}

export const bulkUpdateWaitlistEntries = async (waitlistIds: string[], hasAccess: boolean, entries?: WaitlistEntry[]): Promise<UpdateWaitlistResponse> => {
	try {
		const response = await fetch(`${BACKEND_HOST}/admin/waitlist/bulk-update/`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'x-admin-api-key': ADMIN_API_KEY
			},
			body: JSON.stringify({
				waitlist_ids: waitlistIds,
				has_access: hasAccess
			})
		})

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`)
		}

		// If granting access, also add emails to Clerk allowlist
		if (hasAccess && entries) {
			const emailsToAdd = entries
				.filter(entry => waitlistIds.includes(entry.id))
				.map(entry => entry.email)

			if (emailsToAdd.length > 0) {
				const clerkResult = await addEmailsToClerkAllowlist(emailsToAdd)
			}
		}

		revalidatePath('/waitlist')
		return {
			success: true
		}
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error occurred'
		}
	}
}
