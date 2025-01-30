'use server'

import {z} from 'zod'
import {auth} from '@clerk/nextjs/server'

/*
 * Base schema for Education
 * Check https://outline.letraz.app/api-reference/education-object/get-education-by-id for more information
 */
const EducationSchema = z.object({
	id: z.string().uuid().describe('The unique identifier for the education entry.').readonly(),
	user: z.string().describe('The user who the education entry belongs to.'),
	resume_section: z.string().uuid().describe('The resume section the education entry belongs to.'),
	institution_name: z.string().max(250).describe('The name of the institution the user studied at.'),
	field_of_study: z.string().max(250).describe('The field of study the user studied.'),
	degree: z.string().max(250).nullable().optional().describe('The degree the user obtained. (optional)'),
	country: z.object({
		code: z.string(),
		name: z.string()
	}).readonly(),
	started_from_month: z.number().int().min(0).max(32767).nullable().optional().describe('The month the user started studying. (optional)'),
	started_from_year: z.number().int().min(0).max(32767).nullable().optional().describe('The year the user started studying. (optional)'),
	finished_at_month: z.number().int().min(0).max(32767).nullable().optional().describe('The month the user finished studying. (optional)'),
	finished_at_year: z.number().int().min(0).max(32767).nullable().optional().describe('The year the user finished studying. (optional)'),
	current: z.boolean().describe('Whether the user is currently studying. default: False'),
	description: z.string().max(3000).nullable().optional().describe('The description of the education entry. User can provide any kind of description for that user. Usually in HTML format to support rich text. (optional)'),
	created_at: z.string().readonly().describe('The date and time the education entry was created.'),
	updated_at: z.string().readonly().describe('The date and time the education entry was last updated.')
})

/**
 * Schema for EducationMutation
 * Derived by omitting read-only fields from EducationSchema
 */
const EducationMutationSchema = EducationSchema.omit({
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
export type Education = z.infer<typeof EducationSchema>
export type EducationMutation = z.infer<typeof EducationMutationSchema>

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
