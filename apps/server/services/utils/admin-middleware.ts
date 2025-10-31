import {APIError, middleware} from 'encore.dev/api'
import {getAuthData} from '~encore/auth'
import {AdminAuthData} from '@/services/utils/admin-auth'
import {AuthData} from '@/services/identity/auth'

/**
 * Admin Path Protection Middleware
 * Enforces that /admin/* paths can only be accessed with admin API key authentication
 *
 * This middleware:
 * 1. Checks if the request path starts with /admin
 * 2. If yes, verifies the auth data has userId === 'admin'
 * 3. If not admin, rejects the request with PermissionDenied
 * 4. Regular user tokens (Bearer/Cookie) are NOT allowed on admin paths
 * 5. Non-admin paths pass through without checks
 */
export const adminPathMiddleware = middleware({}, async (req, next) => {
	// Get the request metadata
	const meta = req.requestMeta

	// Check if this is an API call (not PubSub) and get the path
	if (meta && meta.type === 'api-call') {
		const path = meta.path || ''

		// Only check admin auth for /admin/* paths
		if (path.startsWith('/admin')) {
			// Get auth data - could be AdminAuthData or regular AuthData
			const authData = getAuthData() as (AdminAuthData | AuthData)

			// Check if this is an admin user
			if (authData.userId !== 'admin') {
				throw APIError.permissionDenied(
					'Admin API key required. Use x-admin-api-key header to access admin endpoints.'
				)
			}
		}
	}

	// Admin authenticated or non-admin path - proceed
	return next(req)
})
