import {z} from 'zod'

/*
 * Base schema for Job
 * Check https://outline.letraz.app/api-reference/job-object/get-job-by-job-id for more information
 */
export const JobSchema = z.object({
	job_url: z.string().describe('The URL of the job posting.'),
	title: z.string().describe('The title of the job position.'),
	company_name: z.string().describe('The name of the company offering the job.'),
	location: z.string().describe('The location where the job is based.'),
	currency: z.string().describe('The currency in which the salary is paid.'),
	salary_max: z.number().nullable().describe('The maximum salary for the job position. Nullable if not specified.'),
	salary_min: z.number().nullable().describe('The minimum salary for the job position. Nullable if not specified.'),
	requirements: z.array(z.string().nullable().describe('The requirements for the job position. Nullable if not specified.')),
	description: z.string().describe('The description of the job position.'),
	responsibilities: z.array(z.string().nullable().describe('The responsibilities associated with the job position. Nullable if not specified.')),
	benefits: z.array(z.string().nullable().describe('The benefits provided by the company for the job position. Nullable if not specified.'))
})

// Infer TypeScript types from the schema
export type Job = z.infer<typeof JobSchema>
