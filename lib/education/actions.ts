'use server'

import {z} from 'zod'
import {auth} from '@clerk/nextjs/server'
import {Education, EducationMutation, EducationMutationSchema, EducationSchema} from '@/lib/education/types'

/**
 * Adds new education information in the database
 * @param {EducationMutation} educationValues - The education information
 * @returns {Promise<Education>} - The updated education object
 */
export const addEducationToDB = async (educationValues: EducationMutation): Promise<Education> => {
	const session = await auth()
	const token = await session.getToken()

	const params = EducationMutationSchema.parse(educationValues)
	const response = await fetch(`${process.env.API_URL}/resume/${'base'}/education/`, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${token}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			...params
		})
	})

	return EducationSchema.parse(await response.json())
}

/**
 * Retrieves a single education object from the database by its ID
 * @param {string} [resumeId] - The ID of the resume to retrieve education entries from. Defaults to 'base'.
 * @returns {Promise<Education[]>} - The retrieved education objects
 */
export const getEducationsFromDB = async (resumeId?: string | 'base'): Promise<Education[]> => {
	const session = await auth()
	const token = await session.getToken()

	const response = await fetch(`${process.env.API_URL}/resume/${resumeId ?? 'base'}/education/`, {
		headers: {
			Authorization: `Bearer ${token}`
		}
	})

	return z.array(EducationSchema).parse(await response.json())
}

/**
 * Deletes a single education object from the database by its ID
 * @param {string} educationId - The ID of the education entry to delete
 * @param {string} [resumeId] - The ID of the resume the education entry belongs to. Defaults to 'base'.
 * @returns {Promise<void>} - A promise that resolves when the education entry is deleted
 */
export const deleteEducationFromDB = async (educationId: string, resumeId?: string | 'base'): Promise<void> => {
	const session = await auth()
	const token = await session.getToken()

	const response = await fetch(`${process.env.API_URL}/resume/${resumeId ?? 'base'}/education/${educationId}/`, {
		method: 'DELETE',
		headers: {
			Authorization: `Bearer ${token}`
		}
	})
}
