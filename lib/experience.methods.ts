'use server'

import {z} from 'zod'
import {auth} from '@clerk/nextjs/server'

/*
 * Base schema for Experience
 * Check https://outline.letraz.app/api-reference/experience-object/get-experience-by-id for more information
 */
const ExperienceSchema = z.object({
	id: z.string().uuid().describe('The unique identifier for the experience entry.').readonly(),
	user: z.string().describe('The user who the experience entry belongs to.'),
	resume_section: z.string().uuid().describe('The resume section the experience entry belongs to.'),
	company_name: z.string().max(250).describe('The name of the institution the user studied at.'),
	job_title: z.string().max(250).describe('The field of study the user studied.'),
	country: z.object({
		code: z.string(),
		name: z.string()
	}).readonly(),
	city: z.string().max(50).nullable().optional().describe('The city of the institution the user studied at.'),
	employment_type: z.string().max(50).describe('The type of employment the user had.'),
	started_from_month: z.number().int().min(1).max(12).nullable().optional().describe('The month the user started studying. (optional)'),
	started_from_year: z.number().int().min(1947).max(new Date().getFullYear()).nullable().optional().describe('The year the user started studying. (optional)'),
	finished_at_month: z.number().int().min(1).max(12).nullable().optional().describe('The month the user finished studying. (optional)'),
	finished_at_year: z.number().int().min(1947).max(new Date().getFullYear()).nullable().optional().describe('The year the user finished studying. (optional)'),
	current: z.boolean().describe('Whether the user is currently studying. default: False'),
	description: z.string().max(3000).nullable().optional().describe('The description of the experience entry. User can provide any kind of description for that user. Usually in HTML format to support rich text. (optional)'),
	created_at: z.string().readonly().describe('The date and time the experience entry was created.'),
	updated_at: z.string().readonly().describe('The date and time the experience entry was last updated.')
})

/**
 * Schema for ExperienceMutation
 * Derived by omitting read-only fields from ExperienceSchema
 */
const ExperienceMutationSchema = ExperienceSchema.omit({
	id: true,
	user: true,
	resume_section: true,
	country: true,
	created_at: true,
	updated_at: true
}).extend({
	country: z.string()
}).partial()

// Infer TypeScript types from the schema
export type Experience = z.infer<typeof ExperienceSchema>
export type ExperienceMutation = z.infer<typeof ExperienceMutationSchema>

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
