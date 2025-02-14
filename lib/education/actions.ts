'use server'

import {z, ZodError} from 'zod'
import {Education, EducationMutation, EducationMutationSchema, EducationSchema} from '@/lib/education/types'
import {api} from '@/lib/config/api-client'

/**
 * Adds new education information to the database.
 * @param {EducationMutation} educationValues - The education information to add.
 * @returns {Promise<Education|undefined>} The newly added education object.
 * @throws {Error} If validation, authentication, or API request fails.
 */
export const addEducationToDB = async (
	educationValues: EducationMutation
): Promise<Education|undefined> => {
	try {
		const params = EducationMutationSchema.parse(educationValues)
		const data = await api.post<Education>('/resume/base/education/', params)
		return EducationSchema.parse(data)
	} catch (error) {
		handleErrors(error, 'add education')
	}
}

/**
 * Retrieves all education entries for a specific resume from the database.
 * @param {string} [resumeId='base'] - The ID of the resume to retrieve education entries for. Defaults to 'base'.
 * @returns {Promise<Education[]|undefined>} An array of education objects.
 * @throws {Error} If authentication or API request fails.
 */
export const getEducationsFromDB = async (
	resumeId: string = 'base'
): Promise<Education[]|undefined > => {
	try {
		const data = await api.get<Education[]>(`/resume/${resumeId}/education/`)
		return z.array(EducationSchema).parse(data)
	} catch (error) {
		handleErrors(error, 'fetch educations')
	}
}

/**
 * Deletes a specific education entry from the database.
 * @param {string} educationId - The ID of the education entry to delete.
 * @param {string} [resumeId='base'] - The ID of the resume the education entry belongs to. Defaults to 'base'.
 * @throws {Error} If authentication or API request fails.
 */
export const deleteEducationFromDB = async (
	educationId: string,
	resumeId: string = 'base'
): Promise<void> => {
	try {
		await api.delete(`/resume/${resumeId}/education/${educationId}/`)
	} catch (error) {
		handleErrors(error, 'delete education')
	}
}

// TODO make an util
/**
 * Handles errors consistently across all functions.
 * @param {unknown} error - The error object.
 * @param {string} context - The context in which the error occurred (e.g., 'add education').
 * @throws {Error} A formatted error message based on the error type.
 */
const handleErrors = (error: unknown, context: string): never => {
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
