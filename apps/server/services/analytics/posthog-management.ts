import log from 'encore.dev/log'
import {secret} from 'encore.dev/config'
import {captureException} from '@/services/utils/sentry'

const posthogManagementKey = secret('PosthogManagementKey')
const posthogProjectId = secret('PosthogProjectId')
const posthogHost = secret('PosthogHost') || 'https://us.i.posthog.com'

/**
 * PostHog Person data structure from management API
 */
interface PostHogPerson {
	id: string
	distinct_ids: string[]
	properties: Record<string, any>
	created_at: string
}

/**
 * PostHog API response for person search
 */
interface PostHogSearchResponse {
	results: PostHogPerson[]
	next?: string | null
}

/**
 * Get a person from PostHog by email
 * Uses the PostHog management API to search for a person by their email property
 *
 * @param email - Email address to search for
 * @returns PostHog person object or null if not found
 */
export const getPostHogPersonByEmail = async (email: string): Promise<PostHogPerson | null> => {
	try {
		const apiKey = posthogManagementKey()
		const projectId = posthogProjectId()

		if (!apiKey || !projectId) {
			log.warn('PostHog management key or project ID not configured; person lookup disabled')
			return null
		}

		const host = posthogHost()

		/*
		 * Use the persons API with property filter
		 * PostHog API: GET /api/projects/:project_id/persons/?properties=[{"key":"email","value":"user@example.com","type":"person"}]
		 */
		const url = new URL(`${host}/api/projects/${projectId}/persons/`)

		// Build property filter for email search
		const propertyFilter = JSON.stringify([
			{
				key: 'email',
				value: email,
				type: 'person'
			}
		])

		url.searchParams.set('properties', propertyFilter)

		const response = await fetch(url.toString(), {
			method: 'GET',
			headers: {
				'Authorization': `Bearer ${apiKey}`,
				'Content-Type': 'application/json'
			}
		})

		if (!response.ok) {
			if (response.status === 404) {
				log.info('Person not found in PostHog', {email})
				return null
			}

			const errorText = await response.text()
			log.error('PostHog API error', {
				status: response.status,
				statusText: response.statusText,
				error: errorText,
				email
			})

			captureException(new Error(`PostHog API error: ${response.status}`), {
				tags: {
					operation: 'posthog-person-lookup',
					service: 'analytics'
				},
				extra: {
					email,
					status: response.status,
					error: errorText
				}
			})

			// Return null instead of throwing to make the sync operation resilient
			return null
		}

		const data = await response.json() as PostHogSearchResponse

		if (!data.results || data.results.length === 0) {
			log.info('Person not found in PostHog', {email})
			return null
		}

		// Return the first matching person
		const person = data.results[0]
		log.info('Found person in PostHog', {
			email,
			person_id: person.id,
			has_firstName: !!person.properties?.firstName,
			has_lastName: !!person.properties?.lastName
		})

		return person

	} catch (err) {
		log.error('Failed to get person from PostHog', {
			err: String(err),
			email
		})

		captureException(err, {
			tags: {
				operation: 'posthog-person-lookup',
				service: 'analytics'
			},
			extra: {email}
		})

		// Return null to make the operation resilient
		return null
	}
}

/**
 * PostHog Event data structure from management API
 */
interface PostHogEvent {
	id: string
	distinct_id: string
	properties: Record<string, any>
	event: string
	timestamp: string
	person?: {
		id: string
		properties: Record<string, any>
	}
}

/**
 * PostHog API response for events query
 */
interface PostHogEventsResponse {
	results: PostHogEvent[]
	next?: string | null
}

/**
 * Check if a specific event exists in PostHog with given properties
 * Uses the PostHog management API to query events
 *
 * @param params - Query parameters
 * @param params.distinctId - The distinct ID (email address used to identify the person in PostHog)
 * @param params.eventName - The event name to search for
 * @param params.propertyFilters - Property filters to apply (e.g., {resume_id: 'abc', status: 'success'})
 * @returns True if at least one matching event exists, false otherwise
 */
export const checkEventExists = async (params: {
	distinctId: string
	eventName: string
	propertyFilters?: Record<string, string | boolean | null>
}): Promise<boolean> => {
	try {
		const apiKey = posthogManagementKey()
		const projectId = posthogProjectId()

		if (!apiKey || !projectId) {
			log.warn('PostHog management key or project ID not configured; event check disabled')
			return false
		}

		const host = posthogHost()

		/*
		 * Use the events API to query for specific events
		 * PostHog API: GET /api/projects/:project_id/events
		 *
		 * Note: Using distinct_id instead of person_id because:
		 * - distinct_id accepts string values (like email addresses)
		 * - person_id expects integer values
		 * - PostHog uses distinct_id (typically email) to identify users
		 */
		const url = new URL(`${host}/api/projects/${projectId}/events/`)

		// Filter by event name
		url.searchParams.set('event', params.eventName)

		// Filter by distinct_id (email or user identifier)
		url.searchParams.set('distinct_id', params.distinctId)

		// Add property filters if provided
		if (params.propertyFilters && Object.keys(params.propertyFilters).length > 0) {
			const propertyFilters = Object.entries(params.propertyFilters).map(([key, value]) => ({
				key,
				value,
				operator: 'exact',
				type: 'event'
			}))

			url.searchParams.set('properties', JSON.stringify(propertyFilters))
		}

		// Limit to 1 result since we only care about existence
		url.searchParams.set('limit', '1')

		const response = await fetch(url.toString(), {
			method: 'GET',
			headers: {
				'Authorization': `Bearer ${apiKey}`,
				'Content-Type': 'application/json'
			}
		})

		if (!response.ok) {
			const errorText = await response.text()
			log.error('PostHog API error during event check', {
				status: response.status,
				statusText: response.statusText,
				error: errorText,
				eventName: params.eventName,
				distinctId: params.distinctId
			})

			captureException(new Error(`PostHog API error: ${response.status}`), {
				tags: {
					operation: 'posthog-event-check',
					service: 'analytics'
				},
				extra: {
					eventName: params.eventName,
					distinctId: params.distinctId,
					status: response.status,
					error: errorText
				}
			})

			// Return false to make the operation resilient
			return false
		}

		const data = await response.json() as PostHogEventsResponse

		// Check if any events were found
		const exists = data.results && data.results.length > 0

		log.info('PostHog event check completed', {
			eventName: params.eventName,
			distinctId: params.distinctId,
			exists,
			propertyFilters: params.propertyFilters
		})

		return exists

	} catch (err) {
		log.error('Failed to check event in PostHog', {
			err: String(err),
			eventName: params.eventName,
			distinctId: params.distinctId
		})

		captureException(err, {
			tags: {
				operation: 'posthog-event-check',
				service: 'analytics'
			},
			extra: {
				eventName: params.eventName,
				distinctId: params.distinctId
			}
		})

		// Return false to make the operation resilient
		return false
	}
}

