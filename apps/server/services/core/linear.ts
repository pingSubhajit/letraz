import log from 'encore.dev/log'
import {secret} from 'encore.dev/config'
import {captureException} from '@/services/utils/sentry'

const linearApiKey = secret('LinearApiKey')
const linearTeamId = secret('LinearTeamId')

/**
 * Linear Issue Creation Parameters
 */
export interface LinearIssueParams {
	title: string
	description: string
	priority: number // 0=No priority, 1=Urgent, 2=High, 3=Medium, 4=Low
	userId: string
	userEmail: string
}

/**
 * Linear GraphQL API Response
 */
interface LinearIssueResponse {
	data?: {
		issueCreate?: {
			success: boolean
			issue?: {
				id: string
				identifier: string
				title: string
			}
		}
	}
	errors?: Array<{
		message: string
		extensions?: Record<string, any>
	}>
}

/**
 * Map priority string to Linear priority number
 * @param priority - Priority level from AI analysis
 * @returns Linear priority number (1=Urgent, 2=High, 3=Medium, 4=Low, 0=No priority)
 */
export const mapPriorityToLinear = (priority: string): number => {
	const mapping: Record<string, number> = {
		'urgent': 1,
		'high': 2,
		'medium': 3,
		'low': 4
	}
	return mapping[priority.toLowerCase()] || 0
}

/**
 * Create a triage issue in Linear
 * Uses Linear GraphQL API to create a new issue that will appear in the Triage inbox
 *
 * @param params - Issue parameters including title, description, priority, and user info
 * @returns true if issue was created successfully, false otherwise
 */
export const createLinearTriageIssue = async (
	params: LinearIssueParams
): Promise<boolean> => {
	try {
		const apiKey = linearApiKey()
		const teamId = linearTeamId()

		if (!apiKey) {
			log.warn('Linear API key not configured; issue creation disabled')
			return false
		}

		if (!teamId) {
			log.warn('Linear Team ID not configured; issue creation disabled')
			return false
		}

		log.info('Creating Linear triage issue', {
			title: params.title,
			priority: params.priority,
			userEmail: params.userEmail
		})

		// Linear GraphQL API endpoint
		const url = 'https://api.linear.app/graphql'

		/*
		 * Prepare GraphQL mutation
		 * Include user information in the description
		 */
		const enrichedDescription = `${params.description}

---
**Submitted by:** ${params.userEmail}
**User ID:** ${params.userId}`

		const mutation = `
			mutation IssueCreate($input: IssueCreateInput!) {
				issueCreate(input: $input) {
					success
					issue {
						id
						identifier
						title
					}
				}
			}
		`

		// Build the input object conditionally
		const input: Record<string, any> = {
			teamId: teamId,
			title: params.title,
			description: enrichedDescription
		}

		// Only add priority if it's not 0 (no priority)
		if (params.priority > 0) {
			input.priority = params.priority
		}

		const variables = {
			input: input
		}

		const response = await fetch(url, {
			method: 'POST',
			headers: {
				'Authorization': apiKey,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				query: mutation,
				variables: variables
			})
		})

		if (!response.ok) {
			const errorText = await response.text()
			log.error('Linear API HTTP error', {
				status: response.status,
				statusText: response.statusText,
				error: errorText,
				title: params.title,
				requestPayload: {
					mutation: mutation.substring(0, 100) + '...',
					variables: variables
				}
			})

			captureException(new Error(`Linear API HTTP error: ${response.status}`), {
				tags: {
					operation: 'linear-issue-create',
					service: 'core'
				},
				extra: {
					title: params.title,
					userEmail: params.userEmail,
					status: response.status,
					error: errorText,
					variables: variables
				}
			})

			return false
		}

		const data = await response.json() as LinearIssueResponse

		// Check for GraphQL errors
		if (data.errors && data.errors.length > 0) {
			log.error('Linear GraphQL errors', {
				errors: data.errors,
				title: params.title,
				requestPayload: {
					variables: variables
				}
			})

			captureException(new Error(`Linear GraphQL error: ${data.errors[0].message}`), {
				tags: {
					operation: 'linear-issue-create',
					service: 'core'
				},
				extra: {
					title: params.title,
					userEmail: params.userEmail,
					errors: data.errors,
					variables: variables
				}
			})

			return false
		}

		// Check if issue creation was successful
		if (!data.data?.issueCreate?.success) {
			log.error('Linear issue creation failed', {
				title: params.title,
				response: data
			})
			return false
		}

		const issue = data.data.issueCreate.issue

		log.info('Successfully created Linear triage issue', {
			issueId: issue?.id,
			issueIdentifier: issue?.identifier,
			title: issue?.title,
			userEmail: params.userEmail
		})

		return true

	} catch (err) {
		log.error('Failed to create Linear triage issue', {
			err: String(err),
			title: params.title,
			userEmail: params.userEmail
		})

		captureException(err, {
			tags: {
				operation: 'linear-issue-create',
				service: 'core'
			},
			extra: {
				title: params.title,
				userEmail: params.userEmail
			}
		})

		return false
	}
}

