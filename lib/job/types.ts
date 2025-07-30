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
	requirements: z.string().nullable().describe('The requirements for the job position. Nullable if not specified.'),
	description: z.string().describe('The description of the job position.'),
	responsibilities: z.string().nullable().describe('The responsibilities associated with the job position. Nullable if not specified.'),
	benefits: z.string().nullable().describe('The benefits provided by the company for the job position. Nullable if not specified.'),
	processing: z.boolean().describe('Indicates if the job information is currently being processed.')
})

// Infer TypeScript types from the schema
export type Job = z.infer<typeof JobSchema>
