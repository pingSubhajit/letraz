import {api} from 'encore.dev/api'
import {SyncUsersToKnockResponse} from '@/services/notifications/interface'
import {NotificationsService} from '@/services/notifications/service'

/**
 * Sync All Users to Knock
 *
 * Admin endpoint that performs a full sync of all users from the waitlist and user base to Knock.
 *
 * This operation:
 * 1. Deletes all existing users from Knock
 * 2. Fetches all waitlist entries
 * 3. Fetches all registered users
 * 4. Adds all of them to Knock using their email addresses as IDs
 *
 * The operation processes users in batches to respect API rate limits and provides
 * detailed statistics about the sync operation.
 *
 * Admin endpoint - requires x-admin-api-key header for authentication.
 * Accessible at POST /admin/notifications/sync-users
 */
export const syncUsersToKnock = api({
	method: 'POST',
	path: '/admin/notifications/sync-users',
	auth: true,
	expose: true
}, async (): Promise<SyncUsersToKnockResponse> => {
	return NotificationsService.syncAllUsersToKnock()
})

