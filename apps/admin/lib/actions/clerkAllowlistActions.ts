'use server'

import {clerkClient} from '@clerk/nextjs/server'

export interface ClerkAllowlistResponse {
  success: boolean
  error?: string
}

export const addEmailsToClerkAllowlist = async (emails: string[]): Promise<ClerkAllowlistResponse> => {
	try {
		const clerk = await clerkClient()

		// Add each email to Clerk's allowlist
		const results = await Promise.allSettled(
			emails.map(email => clerk.allowlistIdentifiers.createAllowlistIdentifier({
				identifier: email,
				notify: false // Don't send notification emails
			}))
		)

		// Check if any operations failed
		const failedOperations = results.filter(result => result.status === 'rejected')

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

export const removeEmailsFromClerkAllowlist = async (emails: string[]): Promise<ClerkAllowlistResponse> => {
	try {
		const clerk = await clerkClient()

		// First, get all allowlist identifiers
		const allowlistResponse = await clerk.allowlistIdentifiers.getAllowlistIdentifierList()

		// Find the IDs of the emails we want to remove
		const emailsToRemove = allowlistResponse.data.filter(
			item => emails.includes(item.identifier)
		)

		if (emailsToRemove.length === 0) {
			return {
				success: true // No emails to remove is considered success
			}
		}

		// Remove each email from the allowlist
		const results = await Promise.allSettled( // @ts-ignore
			emailsToRemove.map(item => clerk.allowlistIdentifiers.deleteAllowlistIdentifier({allowlistIdentifierId: item.id}))
		)

		// Check if any operations failed
		const failedOperations = results.filter(result => result.status === 'rejected')

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

export const checkEmailInClerkAllowlist = async (email: string): Promise<{
  success: boolean
  inAllowlist: boolean
  error?: string
}> => {
	try {
		const clerk = await clerkClient()

		const allowlistResponse = await clerk.allowlistIdentifiers.getAllowlistIdentifierList()
		const inAllowlist = allowlistResponse.data.some(item => item.identifier === email)

		return {
			success: true,
			inAllowlist
		}
	} catch (error) {
		return {
			success: false,
			inAllowlist: false,
			error: error instanceof Error ? error.message : 'Unknown error occurred'
		}
	}
}
