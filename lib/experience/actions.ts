'use server'

import {z} from 'zod'
import {Experience, ExperienceMutation, ExperienceMutationSchema, ExperienceSchema} from '@/lib/experience/types'
import {api} from '@/lib/config/api-client'

/**
 * Adds new experience information in the database
 * @param {ExperienceMutation} experienceValues - The experience information
 * @returns {Promise<Experience>} - The updated experience object
 * @throws {Error} If validation, authentication, or API request fails.
 */
export const addExperienceToDB = async (experienceValues: ExperienceMutation): Promise<Experience> => {
	const params = ExperienceMutationSchema.parse(experienceValues)
	const data = await api.post<Experience>('/resume/base/experience/', params)
	return ExperienceSchema.parse(data)
}

/**
 * Retrieves a single experience object from the database by its ID
 * @param {string} [resumeId] - The ID of the resume to retrieve experience entries from. Defaults to 'base'.
 * @returns {Promise<Experience[]>} - The retrieved experience objects
 * @throws {Error} If authentication or API request fails.
 */
export const getExperiencesFromDB = async (resumeId?: string | 'base'): Promise<Experience[]> => {
	const data = await api.get<Experience[]>(`/resume/${resumeId ?? 'base'}/experience/`)
	return z.array(ExperienceSchema).parse(data)
}

/**
 * Deletes a single experience object from the database by its ID
 * @param {string} experienceId - The ID of the experience entry to delete
 * @param {string} [resumeId] - The ID of the resume the experience entry belongs to. Defaults to 'base'.
 * @returns {Promise<void>} - A promise that resolves when the experience entry is deleted
 */
export const deleteExperienceFromDB = async (experienceId: string, resumeId?: string | 'base'): Promise<void> => {
	await api.delete<void>(`/resume/${resumeId ?? 'base'}/experience/${experienceId}/`)
}
