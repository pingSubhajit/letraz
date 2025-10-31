import {APIError} from 'encore.dev/api'
import {secret} from 'encore.dev/config'
import {captureException} from '@/services/utils/sentry'

// Configuration variables - to be filled in later
const CLERK_FRONTEND_API_URL = secret('ClerkFrontEndApiUrl')()
const CLERK_SECRET_KEY = secret('ClerkSecretKey')()

// Types
interface UserInfo {
	email_address: string;
	first_name: string;
	last_name: string;
	avatar_url: string;
	last_login: Date | null;
}

interface FetchUserInfoResult {
	success: boolean;
	data: UserInfo;
}

interface JWKSData {
	keys: Array<{
		use?: string;
		kty: string;
		kid: string;
		alg: string;
		n?: string;
		e?: string;
	}>;
}

/**
 * Cache entry for JWKS data
 */
interface CacheEntry<T> {
	data: T;
	expiresAt: number;
}

interface ClerkUserResponse {
	email_addresses: Array<{
		email_address: string;
	}>;
	first_name: string;
	last_name: string;
	image_url?: string;
	last_sign_in_at?: number;
}

export class ClerkSDK {
	private readonly API_URL = 'https://api.clerk.com/v1'

	private readonly FRONTEND_API_URL: string

	private readonly SECRET_KEY: string

	/**
	 * In-memory cache for JWKS data
	 * Key is the base URL (either frontend API URL or issuer URL)
	 */
	private jwksCache: Map<string, CacheEntry<JWKSData>> = new Map()

	/**
	 * JWKS cache TTL in milliseconds (1 hour)
	 * JWKS rarely change, so 1 hour is a reasonable default
	 */
	private readonly JWKS_CACHE_TTL = 60 * 60 * 1000

	constructor() {
		this.FRONTEND_API_URL = CLERK_FRONTEND_API_URL
		this.SECRET_KEY = CLERK_SECRET_KEY
	}

	async fetchUserInfo(userId: string): Promise<FetchUserInfoResult> {
		if (!userId) {
			throw APIError.unauthenticated('Invalid user!')
		}

		try {
			const response = await fetch(`${this.API_URL}/users/${userId}`, {
				headers: {
					Authorization: `Bearer ${this.SECRET_KEY}`
				}
			})

			const data = (await response.json()) as ClerkUserResponse

			if (response.status === 200) {
				return {
					success: true,
					data: {
						email_address: data.email_addresses[0]?.email_address || '',
						first_name: data.first_name || '',
						last_name: data.last_name || '',
						avatar_url: data.image_url || '',
						last_login: data.last_sign_in_at
							? new Date(data.last_sign_in_at)
							: null
					}
				}
			} else {
				return {
					success: false,
					data: {
						email_address: '',
						first_name: '',
						last_name: '',
						avatar_url: '',
						last_login: null
					}
				}
			}
		} catch (error) {
			// Report Clerk API failures to Sentry
			captureException(error, {
				tags: {
					operation: 'clerk-fetch-user-info',
					user_id: userId
				},
				extra: {
					api_endpoint: `${this.API_URL}/users/${userId}`
				},
				level: 'error'
			})

			return {
				success: false,
				data: {
					email_address: '',
					first_name: '',
					last_name: '',
					avatar_url: '',
					last_login: null
				}
			}
		}
	}

	/**
	 * Get JWKS from the configured frontend API URL
	 */
	async getJWKS(): Promise<JWKSData> {
		return this._fetchJWKS(this.FRONTEND_API_URL)
	}

	/**
	 * Get JWKS from the issuer URL (extracted from JWT token)
	 */
	async getJWKSFromIssuer(issuerUrl: string): Promise<JWKSData> {
		return this._fetchJWKS(issuerUrl)
	}

	/**
	 * Check if cached JWKS is still valid
	 */
	private isCacheValid(entry: CacheEntry<JWKSData> | undefined): boolean {
		if (!entry) return false
		return Date.now() < entry.expiresAt
	}

	/**
	 * Get JWKS from cache or fetch if not available/expired
	 */
	private async getCachedOrFetchJWKS(baseUrl: string): Promise<JWKSData> {
		// Check if we have a valid cached entry
		const cachedEntry = this.jwksCache.get(baseUrl)
		if (this.isCacheValid(cachedEntry)) {
			return cachedEntry!.data
		}

		// Cache miss or expired - fetch new JWKS
		const jwksData = await this._fetchJWKSFromNetwork(baseUrl)

		// Store in cache with expiry
		this.jwksCache.set(baseUrl, {
			data: jwksData,
			expiresAt: Date.now() + this.JWKS_CACHE_TTL
		})

		return jwksData
	}

	/**
	 * Internal method to fetch JWKS from network (no caching)
	 */
	private async _fetchJWKSFromNetwork(baseUrl: string): Promise<JWKSData> {
		const jwksUrl = `${baseUrl}/.well-known/jwks.json`

		try {
			const response = await fetch(jwksUrl, {
				signal: AbortSignal.timeout(10000) // 10 second timeout
			})

			if (response.status === 200) {
				return (await response.json()) as JWKSData
			} else {
				throw APIError.unauthenticated(
					`Failed to fetch JWKS! Status: ${response.status}`
				)
			}
		} catch (error) {
			if (error instanceof APIError) {
				throw error
			}

			// Report JWKS fetch failures to Sentry
			captureException(error, {
				tags: {
					operation: 'clerk-jwks-fetch',
					base_url: baseUrl
				},
				extra: {
					jwks_url: jwksUrl,
					error_type: error instanceof Error ? error.name : 'unknown'
				},
				level: 'error'
			})

			if (error instanceof Error) {
				if (error.name === 'AbortError' || error.name === 'TimeoutError') {
					throw APIError.unauthenticated('JWKS request timeout')
				}

				if (error.message.includes('JSON')) {
					throw APIError.unauthenticated('Invalid JWKS response format')
				}

				throw APIError.unauthenticated(`JWKS request failed: ${error.message}`)
			}

			throw APIError.unauthenticated('Unexpected JWKS error')
		}
	}

	/**
	 * Internal method to fetch JWKS from a given base URL (with caching)
	 */
	private async _fetchJWKS(baseUrl: string): Promise<JWKSData> {
		return this.getCachedOrFetchJWKS(baseUrl)
	}
}

// Export a singleton instance
export const clerkSDK = new ClerkSDK()

