import {EducationSchema} from '@/lib/education/types'
import {ExperienceSchema} from '@/lib/experience/types'
import {UserInfoSchema} from '@/lib/user-info/types'
import {ResumeSkillSectionSchema} from '@/lib/skill/types'
import {z} from 'zod'
import {JobSchema} from '@/lib/job/types'
import {CertificationSchema} from '@/lib/certification/types'
import {ProjectSchema} from '@/lib/project/types'

/*
 * Base schema for Resume and its sections
 * Check https://outline.letraz.app/api-reference/resume-object/get-resume-by-id for more information
 */

export const ResumeSectionSchema = z.object({
	id: z.string().describe('The unique identifier for the resume section.'),
	resume: z.string().describe('The identifier of the resume this section belongs to.'),
	index: z.number().describe('The position of this section within the resume.'),

	type: z.enum(['Education', 'Experience', 'Skill', 'Project', 'Certification']).describe('The type of the resume section: Education, Experience, Skill, Project, or Certification.'),
	data: z.union([EducationSchema, ExperienceSchema, ResumeSkillSectionSchema, CertificationSchema, ProjectSchema]).describe('The data associated with this section: education details, experience details, or array of skills.')
})

export const ResumeSchema = z.object({
	id: z.string().describe('The unique identifier for the resume.'),
	base: z.boolean().describe('Indicates if this is the base resume.'),
	user: UserInfoSchema.describe('The user information associated with the resume.'),
	job: JobSchema.describe('The job information associated with the resume.'),
	status: z.string().nullable().optional().describe('Processing status at the root of resume.'),
	thumbnail: z.string().url().nullable().optional().describe('Thumbnail image URL for the resume preview.'),
	sections: z.array(ResumeSectionSchema).describe('The sections included in the resume, such as education and experience.')
})

// Infer TypeScript types from the schema
export type ResumeSection = z.infer<typeof ResumeSectionSchema>
export type Resume = z.infer<typeof ResumeSchema>

// Tailor API response
export const TailorResumeResponseSchema = z.object({
	id: z.string(),
	processing: z.boolean().optional(),
	status: z.string().nullable().optional()
})

export type TailorResumeResponse = z.infer<typeof TailorResumeResponseSchema>
