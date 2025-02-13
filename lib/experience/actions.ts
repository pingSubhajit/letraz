'use server'

import {z, ZodError} from 'zod'
import {auth} from '@clerk/nextjs/server'
import {Experience, ExperienceMutation, ExperienceMutationSchema, ExperienceSchema} from '@/lib/experience/types'
import {api} from '../config/api-client'

/**
 * Adds new experience information in the database
 * @param {ExperienceMutation} experienceValues - The experience information
 * @returns {Promise<Experience>} - The updated experience object
 */
export const addExperienceToDB = async (experienceValues: ExperienceMutation): Promise<Experience> => {
	const session = await auth()
	const token = await session.getToken()

	const params = ExperienceMutationSchema.parse(experienceValues)

	const data = await api.post<Experience>('/resume/base/experience/', params, {
		headers: {
			Authorization: `Bearer ${token}`
		}
	})

	return ExperienceSchema.parse(data)
}

/**
 * Retrieves a single experience object from the database by its ID
 * @param {string} [resumeId] - The ID of the resume to retrieve experience entries from. Defaults to 'base'.
 * @returns {Promise<Experience[]>} - The retrieved experience objects
 */
export const getExperiencesFromDB = async (resumeId?: string | 'base'): Promise<Experience[]> => {
	const session = await auth()
	const token = await session.getToken()

	const data = await api.get<Experience[]>(`/resume/${resumeId ?? 'base'}/experience/`, {
		headers: {
			Authorization: `Bearer ${token}`
		}
	})

	return z.array(ExperienceSchema).parse(data)
}

/**
 * Deletes a single experience object from the database by its ID
 * @param {string} experienceId - The ID of the experience entry to delete
 * @param {string} [resumeId] - The ID of the resume the experience entry belongs to. Defaults to 'base'.
 * @returns {Promise<void>} - A promise that resolves when the experience entry is deleted
 */
export const deleteExperienceFromDB = async (experienceId: string, resumeId?: string | 'base'): Promise<void> => {
	const session = await auth()
	const token = await session.getToken()

	await api.delete<void>(`/resume/${resumeId ?? 'base'}/experience/${experienceId}/`, {
		headers: {
			Authorization: `Bearer ${token}`
		}
	})
}

/**
 * Updates an existing experience entry in the database
 * @param {ExperienceMutation} experienceValues - The experience information to update
 * @returns {Promise<Experience>} - The updated experience object
 */
export const updateExperienceOnDB = async (
	experienceValues: ExperienceMutation
): Promise<Experience> => {
	try {
		const session = await auth()
		if (!session) {
			throw new Error('Unauthorized: No session found')
		}

		const token = await session.getToken()
		if (!token) {
			throw new Error('Unauthorized: No token found')
		}

		const params = ExperienceMutationSchema.parse(experienceValues)

		const data = await api.post<Experience>('/resume/base/experience/', params, {
			headers: {
				Authorization: `Bearer ${token}`
			}
		})

		return ExperienceSchema.parse(data)
	} catch (error) {
		if (error instanceof ZodError) {
			throw new Error(
				`Validation failed: ${error.errors.map((e) => e.message).join(', ')}`
			)
		}

		if (error instanceof Error) {
			throw new Error(`Failed to update experience: ${error.message}`)
		}

		throw new Error('An unknown error occurred while updating experience')
	}
}
