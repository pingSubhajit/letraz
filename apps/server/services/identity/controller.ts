import {api, APIError} from 'encore.dev/api'
import {getAuthData} from '~encore/auth'
import type {AuthData} from '@/services/identity/auth'
import type {ClearDatabaseResponse, UpdateProfileRequest, User} from '@/services/identity/interface'
import {IdentityService} from '@/services/identity/service'

/**
 * User Response
 */
interface UserResponse extends User {}

/**
 * Get Current User
 * Returns the currently authenticated user's information
 */
export const getCurrentUser = api(
	{expose: true, method: 'GET', path: '/user', auth: true},
	async (): Promise<UserResponse> => {
		const authData = getAuthData() as AuthData

		return {...authData.user}
	}
)

/**
 * Update Current User Profile
 * Allows authenticated users to update their own profile information
 */
export const updateCurrentUser = api(
	{expose: true, method: 'PATCH', path: '/user', auth: true},
	async (data: UpdateProfileRequest): Promise<UserResponse> => {
		const authData = getAuthData() as AuthData
		const userId = authData.user.id

		// Update the user profile
		const updatedUser = await IdentityService.updateUser(userId, data)

		return updatedUser
	}
)

interface UserByEmailParams {
	email: string
}

/**
 * Get User by email
 * Returns the information of the user identified by their email
 */
export const getUserByEmail = api(
	{expose: true, method: 'GET', path: '/identity/email/:email', auth: true},
	async ({email}: UserByEmailParams): Promise<UserResponse> => {
		const user = await IdentityService.getUserByEmail(email)

		if (!user) {
			throw APIError.notFound(`User with email ${email} not found`)
		}

		return user
	}
)

interface UserByIdParams {
	id: string
}

/**
 * Get User by ID (Internal)
 * Returns the information of the user identified by their ID
 * This is an internal endpoint for service-to-service communication
 */
export const getUserById = api(
	{expose: false, method: 'GET', path: '/identity/user/:id'},
	async ({id}: UserByIdParams): Promise<UserResponse> => {
		const user = await IdentityService.getUserById(id)

		if (!user) {
			throw APIError.notFound(`User with id ${id} not found`)
		}

		return user
	}
)

/**
 * Clear identity service database.
 * Deletes all data from users table.
 *
 * Internal endpoint for use by admin service.
 * Accessible at DELETE /identity/database/clear
 *
 * WARNING: This is a destructive operation and cannot be undone
 */
export const clearDatabase = api({
	method: 'DELETE', path: '/identity/database/clear'
}, async (): Promise<ClearDatabaseResponse> => {
	return IdentityService.clearDatabase()
})
