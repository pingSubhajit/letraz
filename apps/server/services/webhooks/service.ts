import log from 'encore.dev/log'
import type {ClerkWebhookPayload} from '@/services/webhooks/interface'
import {userDeleted} from '@/services/webhooks/topics'
import {identity} from '~encore/clients'

/**
 * Webhooks Service
 * Business logic for handling webhook events
 */
export const WebhooksService = {
	/**
	 * Process Clerk webhook event
	 * Handles different event types from Clerk
	 */
	processClerkWebhook: async (payload: ClerkWebhookPayload): Promise<void> => {
		log.info('Processing Clerk webhook', {
			event_type: payload.type,
			user_id: payload.data?.id,
			timestamp: payload.timestamp
		})

		// Handle user.deleted event
		if (payload.type === 'user.deleted') {
			await WebhooksService.handleUserDeleted(payload)
		}

		// Add other event handlers here as needed
	},

	/**
	 * Handle user.deleted event from Clerk
	 * Publishes a user-deleted event to the pub/sub system
	 */
	handleUserDeleted: async (payload: ClerkWebhookPayload): Promise<void> => {
		const userId = payload.data.id

		if (!userId) {
			throw new Error('Missing user ID in user.deleted event')
		}

		log.info('Processing user deletion', {
			user_id: userId,
			timestamp: payload.timestamp
		})

		// Fetch user email before deletion (needed for Knock notification)
		let userEmail: string
		try {
			const user = await identity.getUserById({id: userId})
			userEmail = user.email
		} catch (error) {
			log.error(error as Error, 'Failed to fetch user email for deletion event', {
				user_id: userId
			})
			/*
			 * If we can't get the email, we can't send notifications
			 * But we should still publish the event for other subscribers
			 */
			throw error
		}

		// Publish user-deleted event
		await userDeleted.publish({
			user_id: userId,
			user_email: userEmail,
			deleted_at: new Date(payload.timestamp),
			source: 'clerk'
		})

		log.info('Published user-deleted event', {
			user_id: userId,
			user_email: userEmail
		})
	}
}
