'use server'

import {z} from 'zod'
import {Experience, ExperienceMutation, ExperienceMutationSchema, ExperienceSchema} from '@/lib/experience/types'
import {api} from '@/lib/config/api-client'
import {handleErrors} from '@/lib/misc/error-handler'

/**
 * Adds new experience information in the database
 * @param {ExperienceMutation} experienceValues - The experience information
 * @returns {Promise<Experience>} - The updated experience object
 * @throws {Error} If validation, authentication, or API request fails.
 */
export const addExperienceToDB = async (
	experienceValues: ExperienceMutation,
	resumeId: string = 'base'
): Promise<Experience> => {
	try {
		const params = ExperienceMutationSchema.parse(experienceValues)
		const data = await api.post<Experience>(`/resume/${resumeId}/experience/`, params)
		return ExperienceSchema.parse(data)
	} catch (error) {
		return handleErrors(error, 'add experience')
	}
}

/**
 * Retrieves all experience entries for a specific resume from the database.
 * @param {string} [resumeId='base'] - The ID of the resume to retrieve experience entries from. Defaults to 'base'.
 * @returns {Promise<Experience[]>} - The retrieved experience objects
 * @throws {Error} If authentication or API request fails.
 */
export const getExperiencesFromDB = async (
	resumeId: string = 'base'
): Promise<Experience[]> => {
	try {
		const data = await api.get<Experience[]>(`/resume/${resumeId}/experience/`)
		return z.array(ExperienceSchema).parse(data)
	} catch (error) {
		return handleErrors(error, 'fetch experiences')
	}
}

/**
 * Updates an existing experience entry in the database.
 * @param {string} experienceId - The ID of the experience entry to update.
 * @param {Partial<ExperienceMutation>} experienceValues - The updated experience information.
 * @param {string} [resumeId='base'] - The ID of the resume the experience entry belongs to. Defaults to 'base'.
 * @returns {Promise<Experience>} The updated experience object.
 * @throws {Error} If validation, authentication, or API request fails.
 */
export const updateExperienceInDB = async (
	experienceId: string,
	experienceValues: Partial<ExperienceMutation>,
	resumeId: string = 'base'
): Promise<Experience> => {
	try {
		const data = await api.patch<Experience>(`/resume/${resumeId}/experience/${experienceId}/`, experienceValues)
		return ExperienceSchema.parse(data)
	} catch (error) {
		return handleErrors(error, 'update experience')
	}
}

/**
 * Deletes a specific experience entry from the database.
 * @param {string} experienceId - The ID of the experience entry to delete
 * @param {string} [resumeId='base'] - The ID of the resume the experience entry belongs to. Defaults to 'base'.
 * @returns {Promise<void>} - A promise that resolves when the experience entry is deleted
 * @throws {Error} If authentication or API request fails.
 */
export const deleteExperienceFromDB = async (experienceId: string, resumeId: string = 'base'): Promise<void> => {
	try {
		await api.delete<void>(`/resume/${resumeId}/experience/${experienceId}/`)
	} catch (error) {
		return handleErrors(error, 'delete experience')
	}
}
