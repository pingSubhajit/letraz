import {authHandler} from 'encore.dev/auth'
import {APIError, Header} from 'encore.dev/api'
import {importJWK, type JWTPayload, jwtVerify} from 'jose'
import {userCreated} from '@/services/identity/topics'
import {clerkSDK} from '@/services/identity/clerk'
import {IdentityService} from '@/services/identity/service'
import {User} from '@/services/identity/interface'

/**
 * Auth Parameters
 * Extracts authentication token from either Authorization header or Cookie header
 */
interface AuthParams {
	authorization?: Header<'Authorization'>
	cookie?: Header<'Cookie'>
}

/**
 * Auth Data
 * User information attached to authenticated requests
 */
export interface AuthData {
	userID: string
	userId: string
	user: User
}

/**
 * Extract Session Token from Cookie
 * Parses the __session cookie from the Cookie header
 */
const extractSessionFromCookie = (cookieHeader: string | undefined): string | null => {
	if (!cookieHeader) {
		return null
	}

	const cookies = cookieHeader.split(';').map(c => c.trim())
	const sessionCookie = cookies.find(c => c.startsWith('__session='))

	if (!sessionCookie) {
		return null
	}

	return sessionCookie.split('=')[1]
}

/**
 * Extract Bearer Token from Authorization Header
 */
const extractBearerToken = (authHeader: string | undefined): string | null => {
	if (!authHeader) {
		return null
	}

	const parts = authHeader.split(' ')
	if (parts.length !== 2 || parts[0] !== 'Bearer') {
		return null
	}

	return parts[1]
}

/**
 * Decode JWT header without verification
 */
const decodeJWTHeader = (token: string): {kid?: string; alg?: string} => {
	try {
		const parts = token.split('.')
		if (parts.length !== 3) {
			throw new Error('Invalid token structure')
		}

		const header = JSON.parse(Buffer.from(parts[0], 'base64url').toString())
		return header
	} catch (error) {
		throw APIError.unauthenticated('Invalid token format')
	}
}

/**
 * Decode JWT payload without verification
 */
const decodeJWTPayload = (token: string): JWTPayload => {
	try {
		const parts = token.split('.')
		if (parts.length !== 3) {
			throw new Error('Invalid token structure')
		}

		const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString())
		return payload
	} catch (error) {
		throw APIError.unauthenticated('Invalid token format')
	}
}

/**
 * Verify JWT Token
 * Verifies the JWT signature using the public key from JWKS
 */
const verifyJWT = async (token: string): Promise<string> => {
	// Step 1: Decode header to get kid (Key ID)
	const header = decodeJWTHeader(token)
	if (!header.kid) {
		throw APIError.unauthenticated('Invalid token: missing key ID')
	}
	const kid = header.kid

	// Step 2: Decode payload (unverified) to get issuer
	const payload = decodeJWTPayload(token)
	if (!payload.iss) {
		throw APIError.unauthenticated('Invalid token: missing issuer')
	}
	const issuer = payload.iss

	// Step 3: Fetch JWKS from issuer
	let jwksData
	try {
		jwksData = await clerkSDK.getJWKSFromIssuer(issuer)
	} catch (error) {
		throw APIError.unauthenticated(`Failed to get JWKS data: ${error}`)
	}

	// Step 4: Validate JWKS structure
	if (!jwksData || typeof jwksData !== 'object') {
		throw APIError.unauthenticated('Invalid JWKS format')
	}

	if (!jwksData.keys || !Array.isArray(jwksData.keys) || jwksData.keys.length === 0) {
		throw APIError.unauthenticated('Invalid JWKS format')
	}

	// Step 5: Find matching key by kid
	const jwkKey = jwksData.keys.find(key => key.kid === kid)
	if (!jwkKey) {
		const availableKids = jwksData.keys.map(k => k.kid).join(', ')
		throw APIError.unauthenticated(
			`No matching key found for kid: ${kid}. Available kids: ${availableKids}`
		)
	}

	// Step 6: Import JWK as crypto key
	let publicKey
	try {
		publicKey = await importJWK(jwkKey, jwkKey.alg)
	} catch (error) {
		throw APIError.unauthenticated(`Failed to import JWK: ${error}`)
	}

	// Step 7: Verify the JWT signature
	try {
		const {payload: verifiedPayload} = await jwtVerify(token, publicKey, {
			algorithms: ['RS256']
		})

		const userId = verifiedPayload.sub
		if (!userId) {
			throw APIError.unauthenticated('Token missing user ID (sub claim)')
		}

		return userId
	} catch (error) {
		if (error instanceof Error) {
			if (error.message.includes('exp')) {
				throw APIError.unauthenticated('Token has expired!')
			} else if (error.message.includes('signature')) {
				throw APIError.unauthenticated('Invalid token signature!')
			}
			throw APIError.unauthenticated(`Token validation failed: ${error.message}`)
		}
		throw APIError.unauthenticated('Token validation failed')
	}
}

/**
 * Clerk Authentication Handler
 * Authenticates requests using Clerk JWT tokens from cookies or Authorization header
 */
export const clerkAuth = authHandler<AuthParams, AuthData>(async params => {
	// Extract token from cookie or Authorization header
	const sessionToken = extractSessionFromCookie(params.cookie)
	const bearerToken = extractBearerToken(params.authorization)

	const token = sessionToken || bearerToken

	if (!token) {
		throw APIError.unauthenticated('No authentication token provided')
	}

	// Verify JWT and extract user ID
	const userId = await verifyJWT(token)

	// Check if user exists
	let user = await IdentityService.getUserById(userId)

	// If user doesn't exist, fetch info from Clerk and create
	if (!user) {
		const userInfoResult = await clerkSDK.fetchUserInfo(userId)

		if (userInfoResult.success && userInfoResult.data.email_address) {
			const {data: userInfo} = userInfoResult

			// Create user with Clerk data
			const result = await IdentityService.getOrCreateUser(userId, {
				email: userInfo.email_address,
				first_name: userInfo.first_name || 'User',
				last_name: userInfo.last_name || null,
				last_login: userInfo.last_login || new Date()
			})

			await userCreated.publish({...result.user})

			user = result.user
		} else {
			// If we can't get user info from Clerk, throw error
			throw APIError.internal('Unable to fetch user information from Clerk')
		}
	}

	return {
		userID: userId,
		userId,
		user
	}
})

