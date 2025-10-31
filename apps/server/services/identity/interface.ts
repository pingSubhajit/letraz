import {MinLen} from 'encore.dev/validate'

/**
 * User Interface
 * Represents a user in the system
 */
export interface User {
	id: string
	title?: string | null
	first_name: string
	last_name?: string | null
	email: string
	phone?: string | null
	dob?: string | null
	nationality?: string | null
	address?: string | null
	city?: string | null
	postal?: string | null
	country_id?: number | null
	website?: string | null
	profile_text?: string | null
	is_active: boolean
	is_staff: boolean
	last_login?: Date | null
	created_at: Date
	updated_at: Date
}

/**
 * Create User Input
 */
export interface CreateUserInput {
	id: string
	email: string
	first_name: string
	last_name?: string | null
	title?: string | null
	phone?: string | null
	dob?: Date | null
	nationality?: string | null
	address?: string | null
	city?: string | null
	postal?: string | null
	country_id?: number | null
	website?: string | null
	profile_text?: string | null
	last_login?: Date | null
}

/**
 * Update User Input (Admin)
 */
export interface UpdateUserInput {
	title?: string | null
	first_name?: string
	last_name?: string | null
	email?: string
	phone?: string | null
	dob?: string | Date | null
	nationality?: string | null
	address?: string | null
	city?: string | null
	postal?: string | null
	country_id?: number | null
	website?: string | null
	profile_text?: string | null
	is_active?: boolean
	is_staff?: boolean
	last_login?: Date | null
}

/**
 * Update Profile Request
 * Fields that a user can update on their own profile
 */
export interface UpdateProfileRequest {
	title?: string | null
	first_name?: string & MinLen<1>
	last_name?: string | null
	phone?: string | null
	dob?: string | Date | null
	nationality?: string | null
	address?: string | null
	city?: string | null
	postal?: string | null
	country_id?: number | null
	website?: string | null
	profile_text?: string | null
}

export interface UserCreatedEvent extends User {}

/**
 * Response for clear database operation
 */
export interface ClearDatabaseResponse {
	/** Success status */
	success: boolean
	/** Message describing the operation result */
	message: string
	/** Tables that were cleared */
	cleared_tables: string[]
	/** Timestamp of the operation */
	timestamp: string
}
