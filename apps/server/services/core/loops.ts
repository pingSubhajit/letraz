import log from 'encore.dev/log'
import {secret} from 'encore.dev/config'
import {captureException} from '@/services/utils/sentry'
import {LoopsContact, LoopsContactResponse, LoopsFindContactResponse} from '@/services/core/interface'

const loopsApiKey = secret('LoopsApiKey')

/**
 * Mailing list IDs for Letraz waitlist subscribers
 * These are the specific lists from the Go implementation
 */
export const WAITLIST_MAILING_LISTS = {
	'cmg1qhuo83cnw0iyrfin309rk': true,
	'cmg1qihwo3g180iyz3nyu5prt': true,
	'cmg1qjtx73cyw0iu7d94d5gm6': true,
	'cmg1qkom33l1s0i0hhnvv91f6': true,
	'cmg1qlw4x3j1l0iw2fkl00tan': true
}

/**
 * Rate limiter state for Loops API
 */
let rateLimitRemaining = 10 // Start with default 10 req/sec
let rateLimitLimit = 10

/**
 * Sleep utility for rate limiting
 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

/**
 * Make a rate-limited request to Loops API with exponential backoff
 *
 * @param url - API endpoint URL
 * @param options - Fetch options
 * @param maxRetries - Maximum number of retries (default: 5)
 * @returns Response or null on failure
 */
const rateLimitedFetch = async (
	url: string,
	options: RequestInit,
	maxRetries = 5
): Promise<Response | null> => {
	for (let attempt = 0; attempt < maxRetries; attempt++) {
		try {
			// If we're running low on rate limit, wait a bit
			if (rateLimitRemaining <= 1) {
				log.info('Rate limit low, waiting before next request', {
					remaining: rateLimitRemaining,
					limit: rateLimitLimit
				})
				await sleep(1000) // Wait 1 second for rate limit to reset
				rateLimitRemaining = rateLimitLimit // Reset our counter
			}

			const response = await fetch(url, options)

			// Update rate limit state from response headers
			const limitHeader = response.headers.get('x-ratelimit-limit')
			const remainingHeader = response.headers.get('x-ratelimit-remaining')

			if (limitHeader) rateLimitLimit = parseInt(limitHeader, 10)
			if (remainingHeader) rateLimitRemaining = parseInt(remainingHeader, 10)

			// Handle rate limiting with exponential backoff
			if (response.status === 429) {
				const retryAfter = response.headers.get('retry-after')
				const waitTime = retryAfter
					? parseInt(retryAfter, 10) * 1000
					: Math.pow(2, attempt) * 1000 // Exponential backoff

				log.warn('Rate limited by Loops API, retrying...', {
					attempt: attempt + 1,
					maxRetries,
					waitTimeMs: waitTime,
					rateLimitRemaining
				})

				await sleep(waitTime)
				continue // Retry
			}

			return response

		} catch (err) {
			log.error('Error in rate-limited fetch', {
				err: String(err),
				attempt: attempt + 1,
				url
			})

			if (attempt < maxRetries - 1) {
				const waitTime = Math.pow(2, attempt) * 1000
				await sleep(waitTime)
			}
		}
	}

	return null
}

/**
 * Find a contact in Loops by email with rate limiting
 *
 * @param email - Email address to search for
 * @returns Contact object or null if not found
 */
export const findLoopsContact = async (email: string): Promise<LoopsFindContactResponse | null> => {
	try {
		const apiKey = loopsApiKey()
		if (!apiKey) {
			log.warn('Loops API key not configured; contact lookup disabled')
			return null
		}

		// Loops API endpoint for finding a contact
		const url = `https://app.loops.so/api/v1/contacts/find?email=${encodeURIComponent(email)}`

		const response = await rateLimitedFetch(url, {
			method: 'GET',
			headers: {
				'Authorization': `Bearer ${apiKey}`
			}
		})

		if (!response) {
			log.error('Failed to fetch contact from Loops after retries', {email})
			return null
		}

		if (!response.ok) {
			// 404 means contact doesn't exist
			if (response.status === 404) {
				return null
			}

			const errorText = await response.text()
			log.error('Loops find contact API error', {
				status: response.status,
				statusText: response.statusText,
				error: errorText,
				email
			})

			return null
		}

		const data = await response.json() as LoopsFindContactResponse[]

		// Loops returns an array, take the first match
		if (!data || data.length === 0) {
			return null
		}

		return data[0]

	} catch (err) {
		log.error('Failed to find contact in Loops', {
			err: String(err),
			email
		})

		return null
	}
}

/**
 * Check if a contact needs to be synced to Loops
 * Compares the local contact data with what exists in Loops
 *
 * @param contact - Local contact to check
 * @param existingContact - Existing contact in Loops (if any)
 * @returns true if sync is needed, false otherwise
 */
export const needsSync = (contact: LoopsContact, existingContact: LoopsFindContactResponse | null): boolean => {
	// No existing contact means we need to sync
	if (!existingContact) {
		return true
	}

	// Check if userId is different or missing
	if (contact.userId && contact.userId !== existingContact.userId) {
		return true
	}

	// Check if firstName is different
	if (contact.firstName && contact.firstName !== existingContact.firstName) {
		return true
	}

	// Check if lastName is different
	if (contact.lastName && contact.lastName !== existingContact.lastName) {
		return true
	}

	// Check if any mailing list subscription is different
	if (contact.mailingLists) {
		for (const [listId, subscribed] of Object.entries(contact.mailingLists)) {
			const existingSubscribed = existingContact.mailingLists?.[listId]
			if (subscribed !== existingSubscribed) {
				return true
			}
		}
	}

	// No differences found
	return false
}

/**
 * Create or update a contact in Loops with rate limiting
 * This operation is idempotent - if the contact already exists, it will be updated
 */
export const upsertLoopsContact = async (contact: LoopsContact): Promise<boolean> => {
	try {
		const apiKey = loopsApiKey()
		if (!apiKey) {
			log.warn('Loops API key not configured; contact sync disabled')
			return false
		}

		// Loops API endpoint for creating/updating contacts
		const url = 'https://app.loops.so/api/v1/contacts/update'

		const response = await rateLimitedFetch(url, {
			method: 'PUT',
			headers: {
				'Authorization': `Bearer ${apiKey}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(contact)
		})

		if (!response) {
			log.error('Failed to upsert contact in Loops after retries', {
				email: contact.email
			})
			return false
		}

		if (!response.ok) {
			const errorText = await response.text()
			log.error('Loops API error', {
				status: response.status,
				statusText: response.statusText,
				error: errorText,
				email: contact.email
			})

			captureException(new Error(`Loops API error: ${response.status}`), {
				tags: {
					operation: 'loops-contact-upsert',
					service: 'core'
				},
				extra: {
					email: contact.email,
					status: response.status,
					error: errorText
				}
			})

			return false
		}

		const data = await response.json() as LoopsContactResponse

		if (!data.success) {
			log.error('Loops contact upsert failed', {
				email: contact.email,
				message: data.message
			})
			return false
		}

		log.info('Successfully upserted contact in Loops', {
			email: contact.email,
			userId: contact.userId
		})

		return true

	} catch (err) {
		log.error('Failed to upsert contact in Loops', {
			err: String(err),
			email: contact.email
		})

		captureException(err, {
			tags: {
				operation: 'loops-contact-upsert',
				service: 'core'
			},
			extra: {email: contact.email}
		})

		return false
	}
}


