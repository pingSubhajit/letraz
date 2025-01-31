/*
 * Base schema for Education
 * Check https://outline.letraz.app/api-reference/education-object/get-education-by-id for more information
 */
import {z} from 'zod'

export const EducationSchema = z.object({
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
	started_from_month: z.number().int().min(1).max(12).nullable().optional().describe('The month the user started studying. (optional)'),
	started_from_year: z.number().int().min(1947).max(new Date().getFullYear()).nullable().optional().describe('The year the user started studying. (optional)'),
	finished_at_month: z.number().int().min(1).max(12).nullable().optional().describe('The month the user finished studying. (optional)'),
	finished_at_year: z.number().int().min(1947).max(new Date().getFullYear()).nullable().optional().describe('The year the user finished studying. (optional)'),
	current: z.boolean().describe('Whether the user is currently studying. default: False'),
	description: z.string().max(3000).nullable().optional().describe('The description of the education entry. User can provide any kind of description for that user. Usually in HTML format to support rich text. (optional)'),
	created_at: z.string().readonly().describe('The date and time the education entry was created.'),
	updated_at: z.string().readonly().describe('The date and time the education entry was last updated.')
})

/**
 * Schema for EducationMutation
 * Derived by omitting read-only fields from EducationSchema
 */
export const EducationMutationSchema = EducationSchema.omit({
	id: true,
	user: true,
	resume_section: true,
	country: true,
	started_from_month: true,
	started_from_year: true,
	finished_at_month: true,
	finished_at_year: true,
	created_at: true,
	updated_at: true
}).extend({
	country: z.string(),
	started_from_month: z.string().nullish(),
	started_from_year: z.string().nullish(),
	finished_at_month: z.string().nullish(),
	finished_at_year: z.string().nullish()
}).partial()

// Infer TypeScript types from the schema
export type Education = z.infer<typeof EducationSchema>
export type EducationMutation = z.infer<typeof EducationMutationSchema>
