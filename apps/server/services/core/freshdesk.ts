import log from 'encore.dev/log'
import {secret} from 'encore.dev/config'
import {captureException} from '@/services/utils/sentry'

const freshdeskApiKey = secret('FreshdeskApiKey')
const freshdeskDomain = secret('FreshdeskDomain')

/**
 * Freshdesk Ticket Creation Parameters
 */
export interface FreshdeskTicketParams {
	customerEmail: string
	customerName: string
	subject: string
	message: string
}

/**
 * Freshdesk API Response for ticket creation
 */
interface FreshdeskTicketResponse {
	id?: number
	subject?: string
	status?: number
	priority?: number
	requester_id?: number
}

/**
 * Create a ticket in Freshdesk
 * Uses Freshdesk API v2 to create a new support ticket
 *
 * @param params - Ticket parameters including customer info and message
 * @returns true if ticket was created successfully, false otherwise
 */
export const createFreshdeskTicket = async (
	params: FreshdeskTicketParams
): Promise<boolean> => {
	try {
		const apiKey = freshdeskApiKey()
		const domain = freshdeskDomain()

		if (!apiKey || !domain) {
			log.warn('Freshdesk API key or domain not configured; ticket creation disabled', {
				hasApiKey: !!apiKey,
				hasDomain: !!domain
			})
			return false
		}

		log.info('Creating Freshdesk ticket', {
			customerEmail: params.customerEmail,
			subject: params.subject
		})

		// Freshdesk API endpoint for creating tickets
		const url = `https://${domain}.freshdesk.com/api/v2/tickets`

		// Prepare the ticket payload
		const payload = {
			subject: params.subject,
			description: params.message,
			email: params.customerEmail,
			name: params.customerName,
			priority: 2, // 1=Low, 2=Medium, 3=High, 4=Urgent
			status: 2, // 2=Open, 3=Pending, 4=Resolved, 5=Closed
			type: 'Question' // Type of ticket
		}

		// Freshdesk uses Basic Auth with API key
		const authHeader = `Basic ${Buffer.from(`${apiKey}:X`).toString('base64')}`

		const response = await fetch(url, {
			method: 'POST',
			headers: {
				'Authorization': authHeader,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(payload)
		})

		if (!response.ok) {
			const errorText = await response.text()
			log.error('Freshdesk API error', {
				status: response.status,
				statusText: response.statusText,
				error: errorText,
				customerEmail: params.customerEmail,
				subject: params.subject
			})

			captureException(new Error(`Freshdesk API error: ${response.status}`), {
				tags: {
					operation: 'freshdesk-ticket-create',
					service: 'core'
				},
				extra: {
					customerEmail: params.customerEmail,
					subject: params.subject,
					status: response.status,
					error: errorText
				}
			})

			return false
		}

		// Freshdesk returns 201 Created with ticket details
		const data = await response.json() as FreshdeskTicketResponse

		log.info('Successfully created Freshdesk ticket', {
			ticketId: data.id,
			subject: data.subject,
			customerEmail: params.customerEmail
		})

		return true

	} catch (err) {
		log.error('Failed to create Freshdesk ticket', {
			err: String(err),
			customerEmail: params.customerEmail,
			subject: params.subject
		})

		captureException(err, {
			tags: {
				operation: 'freshdesk-ticket-create',
				service: 'core'
			},
			extra: {
				customerEmail: params.customerEmail,
				subject: params.subject
			}
		})

		return false
	}
}

