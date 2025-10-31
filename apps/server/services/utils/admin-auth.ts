import {authHandler} from 'encore.dev/auth'
import {APIError, Header} from 'encore.dev/api'
import {secret} from 'encore.dev/config'

/**
 * Admin API Key Secret
 * Set this secret using: encore secret set --type local,dev,prod AdminApiKey
 */
const ADMIN_API_KEY = secret('AdminApiKey')

/**
 * Admin Auth Parameters
 * Extracts admin API key from x-admin-api-key header
 */
interface AdminAuthParams {
	apiKey?: Header<'x-admin-api-key'>
}

/**
 * Admin Auth Data
 * Simple flag indicating admin authentication
 * Includes both userID and userId for compatibility
 */
export interface AdminAuthData {
	isAdmin: boolean
	userID: string // Set to 'admin' for admin requests
	userId: string // Lowercase for compatibility with identity service
}

/**
 * Admin Authentication Handler
 * Validates requests using admin API key from x-admin-api-key header
 *
 * Usage:
 * - Add x-admin-api-key header with the secret value
 * - If valid, request is authenticated as admin
 * - If invalid or missing, request is rejected
 */
export const adminAuth = authHandler<AdminAuthParams, AdminAuthData>(async params => {
	const providedKey = params.apiKey

	if (!providedKey) {
		throw APIError.unauthenticated('Admin API key is required in x-admin-api-key header')
	}

	// Compare with secret
	const validKey = ADMIN_API_KEY()
	if (providedKey !== validKey) {
		throw APIError.unauthenticated('Invalid admin API key')
	}

	// Return admin auth data
	return {
		isAdmin: true,
		userID: 'admin',
		userId: 'admin'
	}
})
