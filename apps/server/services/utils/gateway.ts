import {Gateway, Header} from 'encore.dev/api'
import {authHandler} from 'encore.dev/auth'
import {AuthData, clerkAuth} from '@/services/identity/auth'
import {adminAuth, AdminAuthData} from '@/services/utils/admin-auth'

/**
 * Unified Auth Parameters
 * Combines all possible auth headers for both regular and admin users
 */
interface UnifiedAuthParams {
	// Admin auth
	apiKey?: Header<'x-admin-api-key'>
	// Regular user auth
	authorization?: Header<'Authorization'>
	cookie?: Header<'Cookie'>
}

/**
 * Unified Auth Handler
 * Routes to appropriate auth handler based on request type:
 * - If x-admin-api-key header present -> admin authentication
 * - Otherwise -> Clerk user authentication
 */
const unifiedAuth = authHandler<UnifiedAuthParams, AuthData | AdminAuthData>(async params => {
	// Check if this is an admin request
	if (params.apiKey) {
		// Route to admin auth handler
		return await adminAuth({apiKey: params.apiKey})
	}

	// Otherwise, route to Clerk auth handler
	return await clerkAuth({
		authorization: params.authorization,
		cookie: params.cookie
	})
})

/**
 * Global API Gateway
 * Configures unified authentication for all services
 *
 * This gateway handles both:
 * - Admin requests (via x-admin-api-key header)
 * - User requests (via Clerk JWT tokens)
 *
 * Any endpoint with `auth: true` will use this authentication handler.
 */
export const gateway = new Gateway({
	authHandler: unifiedAuth
})
