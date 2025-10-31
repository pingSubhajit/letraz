/**
 * Clerk Webhook Event Types
 */
export type ClerkEventType = 'user.deleted' | 'user.created' | 'user.updated'

/**
 * Clerk Webhook Payload
 */
export interface ClerkWebhookPayload {
	type: ClerkEventType
	object: 'event'
	data: {
		id: string
		object: string
		deleted?: boolean
		[key: string]: any
	}
	event_attributes?: {
		http_request?: {
			client_ip: string
			user_agent: string
		}
	}
	timestamp: number
}

/**
 * Clerk User Deleted Event
 */
export interface ClerkUserDeletedEvent {
	data: {
		deleted: true
		id: string
		object: 'user'
	}
	event_attributes?: {
		http_request?: {
			client_ip: string
			user_agent: string
		}
	}
	object: 'event'
	timestamp: number
	type: 'user.deleted'
}
