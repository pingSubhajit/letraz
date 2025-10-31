import {Topic} from 'encore.dev/pubsub'

/**
 * User Deleted Event
 * Published when a user is deleted from the system (via Clerk webhook)
 */
export interface UserDeletedEvent {
	user_id: string
	user_email: string
	deleted_at: Date
	source: 'clerk' | 'manual'
}

/**
 * User Deleted Topic
 */
export const userDeleted = new Topic<UserDeletedEvent>('user-deleted', {
	deliveryGuarantee: 'at-least-once'
})
