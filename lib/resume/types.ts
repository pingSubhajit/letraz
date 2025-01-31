import {EducationSchema} from '@/lib/education/types'
import {ExperienceSchema} from '@/lib/experience/types'
import {UserInfoSchema} from '@/lib/user-info/types'
import {z} from 'zod'
import {JobSchema} from '@/lib/job/types'

/*
 * Base schema for Resume and its sections
 * Check https://outline.letraz.app/api-reference/resume-object/get-resume-by-id for more information
 */

export const ResumeSectionSchema = z.object({
	id: z.string(),
	resume: z.string(),
	index: z.number(),
	type: z.enum(['Education', 'Experience']),
	data: z.union([EducationSchema, ExperienceSchema])
})

export const ResumeSchema = z.object({
	id: z.string(),
	base: z.boolean(),
	user: UserInfoSchema,
	job: JobSchema,
	sections: z.array(ResumeSectionSchema)
})

// Infer TypeScript types from the schema
export type ResumeSection = z.infer<typeof ResumeSectionSchema>
export type Resume = z.infer<typeof ResumeSchema>
