import {z} from 'zod'

/*
 * Base schema for Job
 * Check https://outline.letraz.app/api-reference/job-object/get-job-by-job-id for more information
 */
export const JobSchema = z.object({
	job_url: z.string(),
	title: z.string(),
	company_name: z.string(),
	location: z.string(),
	currency: z.string(),
	salary_max: z.number().nullable(),
	salary_min: z.number().nullable(),
	requirements: z.string().nullable(),
	description: z.string(),
	responsibilities: z.string().nullable(),
	benefits: z.string().nullable()
})

// Infer TypeScript types from the schema
export type Job = z.infer<typeof JobSchema>
