import {api} from 'encore.dev/api'
import {ClearAllDatabasesResponse} from '@/services/admin/interface'
import {AdminService} from '@/services/admin/service'

/**
 * Clear all databases across all services
 *
 * This endpoint clears all database tables except:
 * - waitlist table (core service)
 * - countries table (core service)
 *
 * Admin endpoint - requires x-admin-api-key header for authentication.
 * Accessible at DELETE /admin/databases/clear
 *
 * WARNING: This is a destructive operation and cannot be undone
 */
export const clearAllDatabases = api({
	method: 'DELETE',
	path: '/admin/databases/clear',
	auth: true,
	expose: true
}, async (): Promise<ClearAllDatabasesResponse> => {
	return AdminService.clearAllDatabases()
})

