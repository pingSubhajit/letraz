/**
 * Sync Users to Knock Response
 * Response returned when syncing all users from waitlist and user base to Knock
 */
export interface SyncUsersToKnockResponse {
	message: string
	waitlist_synced: number
	users_synced: number
	total_synced: number
	deleted_count?: number
	failed_count: number
	failed_emails?: string[]
}

