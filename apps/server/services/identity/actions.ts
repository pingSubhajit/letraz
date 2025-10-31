import {Subscription} from 'encore.dev/pubsub'
import log from 'encore.dev/log'
import {APIError} from 'encore.dev/api'
import {userDeleted} from '@/services/webhooks/topics'
import {IdentityService} from '@/services/identity/service'
import {captureException} from '@/services/utils/sentry'

/**
 * User Deleted Subscription
 * Handles user deletion events from webhooks service
 * Deletes the user record from the identity database
 */
const userDeletedListener = new Subscription(
	userDeleted,
	'delete-user-identity',
	{
		handler: async (event) => {
			log.info('Processing user deletion - deleting identity record', {
				user_id: event.user_id,
				source: event.source
			})

			try {
				await IdentityService.deleteUser(event.user_id)

				log.info('Successfully deleted user identity', {
					user_id: event.user_id
				})
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : 'Unknown error'

				// If user not found, log but don't throw (idempotency)
				if (error instanceof APIError && error.code === 'not_found') {
					log.warn('User identity already deleted or not found', {
						user_id: event.user_id
					})
					return
				}

				log.error(error, 'Failed to delete user identity', {
					user_id: event.user_id,
					error: errorMessage
				})

				captureException(error, {
					tags: {
						operation: 'user-deletion-identity',
						user_id: event.user_id
					},
					extra: {
						source: event.source,
						deleted_at: event.deleted_at
					},
					level: 'error'
				})

				// Re-throw to trigger retry
				throw error
			}
		}
	}
)
