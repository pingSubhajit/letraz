import {ZodError} from 'zod'

/**
 * Handles errors consistently across all functions.
 * @param {unknown} error - The error object.
 * @param {string} context - The context in which the error occurred (e.g., 'add education').
 * @throws {Error} A formatted error message based on the error type.
 */
export const handleErrors = (error: unknown, context: string): never => {
	if (error instanceof ZodError) {
		throw new Error(
			`Validation failed for ${context}: ${error.errors.map(e => e.message).join(', ')}`
		)
	}
	if (error instanceof Error) {
		throw new Error(`Failed to ${context}: ${error.message}`)
	}
	throw new Error(`An unknown error occurred while trying to ${context}`)
}
