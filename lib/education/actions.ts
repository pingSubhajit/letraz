'use server'

import {z, ZodError} from 'zod'
import {auth} from '@clerk/nextjs/server'
import {
	Education,
	EducationMutation,
	EducationMutationSchema,
	EducationSchema
} from '@/lib/education/types'
import {api} from '../config/api-client'

/**
 * Handles authentication and retrieves the session token.
 * @returns {Promise<string>} The authentication token.
 * @throws {Error} If no token is found.
 */
const handleAuth = async (): Promise<string> => {
	const session = await auth()
	const token = await session?.getToken()
	if (!token) throw new Error('Unauthorized: No authentication token found')
	return token
}

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
		const token = await handleAuth()
		const params = EducationMutationSchema.parse(educationValues)

		const data = await api.post<Education>('/resume/base/education/', params, {
			headers: {Authorization: `Bearer ${token}`}
		})

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
		const token = await handleAuth()

		const data = await api.get<Education[]>(
			`/resume/${resumeId}/education/`,
			{headers: {Authorization: `Bearer ${token}`}}
		)

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
		const token = await handleAuth()

		await api.delete(
			`/resume/${resumeId}/education/${educationId}/`,
			{headers: {Authorization: `Bearer ${token}`}}
		)
	} catch (error) {
		handleErrors(error, 'delete education')
	}
}

/**
 * Updates an existing education entry in the database.
 * @param {EducationMutation} educationValues - The updated education information.
 * @returns {Promise<Education|undefined>} The updated education object.
 * @throws {Error} If validation, authentication, or API request fails.
 */
export const updateEducationOnDB = async (
	educationValues: EducationMutation
): Promise<Education|undefined> => {
	try {
		const token = await handleAuth()
		const params = EducationMutationSchema.parse(educationValues)

		const data = await api.patch<Education>(
			'/resume/base/education/',
			params,
			{headers: {Authorization: `Bearer ${token}`}}
		)

		return EducationSchema.parse(data)
	} catch (error) {
		handleErrors(error, 'update education')
	}
}

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
