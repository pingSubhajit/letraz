import {z} from 'zod'

/*
 * Base schema for Job
 * Check https://outline.letraz.app/api-reference/job-object/get-job-by-job-id for more information
 */
const stringOrStringArray = z.union([z.string(), z.array(z.string())]).transform((val) => Array.isArray(val) ? val.join('\n') : val)

export const JobSchema = z.object({
	job_url: z.string().describe('The URL of the job posting.'),
	title: z.string().describe('The title of the job position.'),
	company_name: z.string().describe('The name of the company offering the job.'),
	location: z.string().nullable().describe('The location where the job is based.'),
	requirements: stringOrStringArray.nullable().describe('The requirements for the job position. Nullable if not specified.'),
	description: stringOrStringArray.nullable().describe('The description of the job position.'),
	responsibilities: stringOrStringArray.nullable().describe('The responsibilities associated with the job position. Nullable if not specified.'),
	benefits: stringOrStringArray.nullable().describe('The benefits provided by the company for the job position. Nullable if not specified.'),
	status: z.string().describe('Indicates if the job is currently being processed.').nullable().optional()
})

// Infer TypeScript types from the schema
export type Job = z.infer<typeof JobSchema>
