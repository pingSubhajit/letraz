import {api} from 'encore.dev/api'
import log from 'encore.dev/log'
import {json} from 'node:stream/consumers'
import type {ClerkWebhookPayload} from '@/services/webhooks/interface'
import {WebhooksService} from '@/services/webhooks/service'

/**
 * Clerk Webhook Endpoint
 * Handles webhook events from Clerk
 * Path starts with /admin for admin-only access
 */
export const clerkWebhook = api.raw(
	{
		expose: true,
		path: '/admin/webhooks/clerk',
		method: 'POST'
	},
	async (req, res) => {
		try {
			// Parse the webhook payload
			const payload = (await json(req)) as ClerkWebhookPayload

			// Process the webhook through the service layer
			await WebhooksService.processClerkWebhook(payload)

			// Return success response
			res.writeHead(200, {'Content-Type': 'application/json'})
			res.end(JSON.stringify({success: true, type: payload.type}))
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Unknown error'
			log.error(error, 'Error processing Clerk webhook', {
				error: errorMessage
			})

			res.writeHead(500, {'Content-Type': 'application/json'})
			res.end(JSON.stringify({error: 'Internal server error'}))
		}
	}
)
