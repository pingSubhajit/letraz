import {eq} from 'drizzle-orm'
import type {ClearDatabaseResponse, CreateUserInput, UpdateUserInput, User} from './interface'
import {APIError} from 'encore.dev/api'
import {users} from '@/services/identity/schema'
import {db} from '@/services/identity/database'
import log from 'encore.dev/log'

/**
 * Helper Functions
 */
const IdentityHelpers = {
	/**
	 * Parse date input - accepts Date objects or date strings
	 * Returns Date object or null
	 */
	parseDate: (dateInput: string | Date | null | undefined): Date | null => {
		if (dateInput === undefined || dateInput === null) {
			return null
		}

		if (dateInput instanceof Date) {
			return dateInput
		}

		if (typeof dateInput === 'string') {
			const parsed = new Date(dateInput)
			if (isNaN(parsed.getTime())) {
				throw APIError.invalidArgument('Invalid date format. Expected ISO date string (e.g., "2023-11-10")')
			}
			return parsed
		}

		throw APIError.invalidArgument('Date must be a string or Date object')
	},

	/**
	 * Format user response - converts Date fields to strings
	 */
	formatUserResponse: (user: typeof users.$inferSelect): User => {
		return {
			...user,
			dob: user.dob ? user.dob.toISOString().split('T')[0] : null
		}
	}
}

/**
 * Identity Service
 * Provides user identity management and CRUD operations
 */
export const IdentityService = {
	/**
	 * Get or Create User
	 * Retrieves a user by ID or creates a new one if it doesn't exist
	 */
	getOrCreateUser: async (
		userId: string,
		userInfo?: {
			email: string
			first_name: string
			last_name?: string | null
			last_login?: Date | null
		}
	): Promise<{user: User; created: boolean}> => {
		// Try to find existing user
		const existingUser = await db.query.users.findFirst({
			where: eq(users.id, userId)
		})

		if (existingUser) {
			return {
				user: IdentityHelpers.formatUserResponse(existingUser),
				created: false
			}
		}

		// Create new user
		if (!userInfo) {
			throw APIError.internal('User info required to create new user')
		}

		const [newUser] = await db
			.insert(users)
			.values({
				id: userId,
				email: userInfo.email,
				first_name: userInfo.first_name,
				last_name: userInfo.last_name || null,
				last_login: userInfo.last_login || null,
				is_active: true,
				is_staff: false
			})
			.returning()

		return {
			user: IdentityHelpers.formatUserResponse(newUser),
			created: true
		}
	},

	/**
	 * Get User by ID
	 */
	getUserById: async (userId: string): Promise<User | null> => {
		const user = await db.query.users.findFirst({
			where: eq(users.id, userId)
		})

		return user ? IdentityHelpers.formatUserResponse(user) : null
	},

	/**
	 * Get User by Email
	 */
	getUserByEmail: async (email: string): Promise<User | null> => {
		const user = await db.query.users.findFirst({
			where: eq(users.email, email)
		})

		return user ? IdentityHelpers.formatUserResponse(user) : null
	},

	/**
	 * Update User
	 */
	updateUser: async (userId: string, data: UpdateUserInput): Promise<User> => {
		// Parse dob if provided
		const updateData: Partial<typeof users.$inferInsert> = {
			...data,
			dob: data.dob !== undefined ? IdentityHelpers.parseDate(data.dob) : undefined
		}

		const [updatedUser] = await db.update(users).set(updateData).where(eq(users.id, userId)).returning()

		if (!updatedUser) {
			throw APIError.notFound(`User with ID ${userId} not found`)
		}

		return IdentityHelpers.formatUserResponse(updatedUser)
	},

	/**
	 * Create User
	 */
	createUser: async (data: CreateUserInput): Promise<User> => {
		const [newUser] = await db
			.insert(users)
			.values({
				...data,
				is_active: true,
				is_staff: false
			})
			.returning()

		return IdentityHelpers.formatUserResponse(newUser)
	},

	/**
	 * Delete User
	 */
	deleteUser: async (userId: string): Promise<void> => {
		const result = await db.delete(users).where(eq(users.id, userId)).returning()

		if (result.length === 0) {
			throw APIError.notFound(`User with ID ${userId} not found`)
		}
	},

	/**
	 * Get Full Name
	 * Formats the user's full name with title if available
	 */
	getFullName: (user: User): string => {
		const parts = []

		if (user.title) {
			parts.push(`${user.title}.`)
		}

		parts.push(user.first_name)

		if (user.last_name) {
			parts.push(user.last_name)
		}

		return parts.join(' ')
	},

	/**
	 * Clear identity service database
	 * Deletes all data from users table
	 *
	 * WARNING: This is a destructive operation and cannot be undone
	 */
	clearDatabase: async (): Promise<ClearDatabaseResponse> => {
		const timestamp = new Date().toISOString()
		const clearedTables: string[] = []

		log.info('Starting identity database clearing operation')

		try {
			// Clear users table
			await db.delete(users)
			clearedTables.push('users')
			log.info('Cleared users table')

			log.info('Identity database clearing operation completed', {
				cleared_tables: clearedTables,
				timestamp
			})

			return {
				success: true,
				message: `Successfully cleared ${clearedTables.length} table(s) from identity database`,
				cleared_tables: clearedTables,
				timestamp
			}
		} catch (error) {
			log.error(error as Error, 'Failed to clear identity database', {
				cleared_tables: clearedTables,
				timestamp
			})
			throw error
		}
	}
}
