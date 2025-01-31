'use server'

import {z} from 'zod'
import {auth} from '@clerk/nextjs/server'
import {Experience, ExperienceMutation, ExperienceMutationSchema, ExperienceSchema} from '@/lib/experience/types'

/**
 * Adds new experience information in the database
 * @param {ExperienceMutation} experienceValues - The experience information
 * @returns {Promise<Experience>} - The updated experience object
 */
export const addExperienceToDB = async (experienceValues: ExperienceMutation): Promise<Experience> => {
	const session = await auth()
	const token = await session.getToken()

	const params = ExperienceMutationSchema.parse(experienceValues)

	const response = await fetch(`${process.env.API_URL}/resume/${'base'}/experience/`, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${token}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			...params
		})
	})

	return ExperienceSchema.parse(await response.json())
}

/**
 * Retrieves a single experience object from the database by its ID
 * @param {string} [resumeId] - The ID of the resume to retrieve experience entries from. Defaults to 'base'.
 * @returns {Promise<Experience[]>} - The retrieved experience objects
 */
export const getExperiencesFromDB = async (resumeId?: string | 'base'): Promise<Experience[]> => {
	const session = await auth()
	const token = await session.getToken()

	const response = await fetch(`${process.env.API_URL}/resume/${resumeId ?? 'base'}/experience/`, {
		headers: {
			Authorization: `Bearer ${token}`
		}
	})

	return z.array(ExperienceSchema).parse(await response.json())
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

	const response = await fetch(`${process.env.API_URL}/resume/${resumeId ?? 'base'}/experience/${experienceId}/`, {
		method: 'DELETE',
		headers: {
			Authorization: `Bearer ${token}`
		}
	})
}
