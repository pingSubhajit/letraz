import {z} from 'zod'

/*
 * Base schema for Experience
 * Check https://outline.letraz.app/api-reference/experience-object/get-experience-by-id for more information
 */
export const ExperienceSchema = z.object({
	id: z.string().uuid().describe('The unique identifier for the experience entry.').readonly(),
	user: z.string().optional().describe('The user who the experience entry belongs to.'),
	resume_section: z.string().uuid().optional().describe('The resume section the experience entry belongs to.'),
	company_name: z.string().max(250).describe('The name of the company where the user worked.'),
	job_title: z.string().max(250).describe('The job title or position held by the user.'),
	country: z.object({
		code: z.string().regex(/^[A-Z]{3}$/),
		name: z.string()
	}).readonly(),
	city: z.string().max(50).nullable().optional().describe('The city of the organization the user worked at.'),
	employment_type: z.string().describe('The type of employment the user had.'),
	started_from_month: z.number().int().min(1).max(12).nullable().optional().describe('The month the user started working. (optional)'),
	started_from_year: z.number().int().min(1947).max(new Date().getFullYear()).nullable().optional().describe('The year the user started working. (optional)'),
	finished_at_month: z.number().int().min(1).max(12).nullable().optional().describe('The month the user finished working. (optional)'),
	finished_at_year: z.number().int().min(1947).max(new Date().getFullYear()).nullable().optional().describe('The year the user finished working. (optional)'),
	current: z.boolean().describe('Whether the user is currently working. default: False'),
	description: z.string().max(3000).nullable().optional().describe('The description of the experience entry. User can provide any kind of description for that user. Usually in HTML format to support rich text. (optional)'),
	created_at: z.string().readonly().describe('The date and time the experience entry was created.'),
	updated_at: z.string().readonly().describe('The date and time the experience entry was last updated.')
})

/**
 * Schema for ExperienceMutation
 * Derived by omitting read-only fields from ExperienceSchema
 */
export const ExperienceMutationSchema = ExperienceSchema.omit({
	id: true,
	user: true,
	resume_section: true,
	employment_type: true,
	country: true,
	started_from_month: true,
	started_from_year: true,
	finished_at_month: true,
	finished_at_year: true,
	created_at: true,
	updated_at: true
}).extend({
	employment_type: z.enum(['Full Time', 'Part Time', 'Contract', 'Internship', 'Freelance', 'Self Employed', 'Volunteer', 'Trainee']).describe('The type of employment the user had.'),
	country_code: z.string().regex(/^[A-Z]{3}$/),
	started_from_month: z.string().nullish(),
	started_from_year: z.string().nullish(),
	finished_at_month: z.string().nullish(),
	finished_at_year: z.string().nullish()
})

// Infer TypeScript types from the schema
export type Experience = z.infer<typeof ExperienceSchema>
export type ExperienceMutation = z.infer<typeof ExperienceMutationSchema>

// Employment types
export const employmentTypes: {label: string, value: typeof ExperienceMutationSchema._type.employment_type}[] = [
	{label: 'Full-time', value: 'Full Time'},
	{label: 'Part-time', value: 'Part Time'},
	{label: 'Contract', value: 'Contract'},
	{label: 'Internship', value: 'Internship'},
	{label: 'Freelance', value: 'Freelance'},
	{label: 'Self-employed', value: 'Self Employed'},
	{label: 'Volunteer', value: 'Volunteer'},
	{label: 'Trainee', value: 'Trainee'}
]
