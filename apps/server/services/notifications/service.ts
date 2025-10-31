import {db as coreDb} from '@/services/core/database'
import {db as identityDb} from '@/services/identity/database'
import {waitlist} from '@/services/core/schema'
import {users} from '@/services/identity/schema'
import {getKnock} from '@/services/notifications/knock'
import {SyncUsersToKnockResponse} from '@/services/notifications/interface'
import log from 'encore.dev/log'
import {APIError} from 'encore.dev/api'
import {captureException} from '@/services/utils/sentry'

export const NotificationsService = {
	/**
	 * Sync all users to Knock
	 *
	 * This admin operation:
	 * 1. Deletes all existing users from Knock using bulk delete
	 * 2. Fetches all waitlist entries from the core database
	 * 3. Fetches all users from the identity database
	 * 4. Adds all of them to Knock using bulk identify with email addresses as IDs
	 *
	 * The operation is batched to respect Knock's API limits (up to 1,000 users per bulk operation).
	 *
	 * @returns Statistics about the sync operation
	 */
	syncAllUsersToKnock: async (): Promise<SyncUsersToKnockResponse> => {
		const knock = getKnock()
		if (!knock) {
			throw APIError.unavailable('Knock is not configured. Cannot perform sync operation.')
		}

		log.info('Starting full user sync to Knock')

		// Step 1: Delete all users from Knock using bulk delete
		let deletedCount = 0
		try {
			log.info('Fetching all users from Knock for deletion')

			// Collect all user IDs from Knock
			const allUserIds: string[] = []
			for await (const user of knock.users.list()) {
				allUserIds.push(user.id)
			}

			if (allUserIds.length > 0) {
				log.info(`Found ${allUserIds.length} users to delete from Knock`)

				// Delete in batches of 1,000 (Knock's bulk delete limit)
				const BULK_DELETE_BATCH_SIZE = 1000

				for (let i = 0; i < allUserIds.length; i += BULK_DELETE_BATCH_SIZE) {
					const batch = allUserIds.slice(i, i + BULK_DELETE_BATCH_SIZE)

					try {
						const bulkOp = await knock.users.bulk.delete({
							user_ids: batch
						})

						deletedCount += batch.length
						log.info('Bulk delete operation initiated', {
							operation_id: bulkOp.id,
							batch_size: batch.length,
							total_deleted: deletedCount,
							remaining: allUserIds.length - deletedCount
						})
					} catch (err) {
						log.error(err as Error, 'Failed to initiate bulk delete', {
							batch_size: batch.length
						})

						captureException(err, {
							tags: {
								operation: 'knock-bulk-delete',
								service: 'notifications'
							},
							extra: {batch_size: batch.length},
							level: 'error'
						})
					}
				}
			} else {
				log.info('No existing users found in Knock to delete')
			}
		} catch (err) {
			log.error(err as Error, 'Error during Knock user deletion', {
				deleted_so_far: deletedCount
			})

			captureException(err, {
				tags: {
					operation: 'knock-bulk-delete',
					service: 'notifications'
				},
				level: 'error'
			})

			// Continue with sync even if deletion fails
		}

		// Step 2: Fetch all waitlist entries
		log.info('Fetching all waitlist entries')
		const waitlistEntries = await coreDb.select({
			email: waitlist.email
		}).from(waitlist)

		log.info(`Found ${waitlistEntries.length} waitlist entries`)

		// Step 3: Fetch all users
		log.info('Fetching all users')
		const allUsers = await identityDb.select({
			email: users.email,
			first_name: users.first_name,
			last_name: users.last_name
		}).from(users)

		log.info(`Found ${allUsers.length} registered users`)

		// Step 4: Add all users to Knock using bulk identify
		let waitlistSynced = 0
		let usersSynced = 0
		let failedCount = 0
		const failedEmails: string[] = []

		// Knock's bulk identify limit is 1,000 users per request
		const BULK_IDENTIFY_BATCH_SIZE = 1000

		// Sync waitlist entries
		log.info('Syncing waitlist entries to Knock using bulk identify')
		for (let i = 0; i < waitlistEntries.length; i += BULK_IDENTIFY_BATCH_SIZE) {
			const batch = waitlistEntries.slice(i, i + BULK_IDENTIFY_BATCH_SIZE)

			try {
				const usersToIdentify = batch.map((entry) => ({
					id: entry.email,
					email: entry.email
				}))

				const bulkOp = await knock.users.bulk.identify({
					users: usersToIdentify
				})

				waitlistSynced += batch.length

				log.info('Bulk identify operation for waitlist initiated', {
					operation_id: bulkOp.id,
					batch_size: batch.length,
					total_synced: waitlistSynced,
					remaining: waitlistEntries.length - waitlistSynced
				})
			} catch (err) {
				log.error(err as Error, 'Failed to bulk identify waitlist entries', {
					batch_size: batch.length
				})

				captureException(err, {
					tags: {
						operation: 'knock-bulk-identify',
						source: 'waitlist'
					},
					extra: {batch_size: batch.length},
					level: 'error'
				})

				failedCount += batch.length
				batch.forEach((entry) => failedEmails.push(entry.email))
			}
		}

		// Sync registered users
		log.info('Syncing registered users to Knock using bulk identify')
		for (let i = 0; i < allUsers.length; i += BULK_IDENTIFY_BATCH_SIZE) {
			const batch = allUsers.slice(i, i + BULK_IDENTIFY_BATCH_SIZE)

			try {
				const usersToIdentify = batch.map((user) => {
					const name = user.last_name
						? `${user.first_name} ${user.last_name}`
						: user.first_name

					return {
						id: user.email,
						email: user.email,
						name
					}
				})

				const bulkOp = await knock.users.bulk.identify({
					users: usersToIdentify
				})

				usersSynced += batch.length

				log.info('Bulk identify operation for registered users initiated', {
					operation_id: bulkOp.id,
					batch_size: batch.length,
					total_synced: usersSynced,
					remaining: allUsers.length - usersSynced
				})
			} catch (err) {
				log.error(err as Error, 'Failed to bulk identify registered users', {
					batch_size: batch.length
				})

				captureException(err, {
					tags: {
						operation: 'knock-bulk-identify',
						source: 'registered_users'
					},
					extra: {batch_size: batch.length},
					level: 'error'
				})

				failedCount += batch.length
				batch.forEach((user) => failedEmails.push(user.email))
			}
		}

		const totalSynced = waitlistSynced + usersSynced

		log.info('Completed full user sync to Knock', {
			deleted: deletedCount,
			waitlist_synced: waitlistSynced,
			users_synced: usersSynced,
			total_synced: totalSynced,
			failed: failedCount,
			failed_emails: failedEmails.slice(0, 10) // Log first 10 failed emails
		})

		return {
			message: `Successfully synced ${totalSynced} users to Knock (${waitlistSynced} from waitlist, ${usersSynced} registered users). Bulk operations are processed asynchronously - check Knock dashboard for final status.`,
			waitlist_synced: waitlistSynced,
			users_synced: usersSynced,
			total_synced: totalSynced,
			deleted_count: deletedCount,
			failed_count: failedCount,
			failed_emails: failedEmails.length > 0 ? failedEmails.slice(0, 20) : undefined
		}
	}
}

