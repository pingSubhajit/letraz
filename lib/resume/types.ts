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

export const ResumeSectionSchema = z.discriminatedUnion('type', [
	z.object({
		id: z.string().describe('The unique identifier for the resume section.'),
		resume: z.string().describe('The identifier of the resume this section belongs to.'),
		index: z.number().describe('The position of this section within the resume.'),
		type: z.literal('Education').describe('The type of the resume section.'),
		data: EducationSchema.describe('The education data associated with this section.')
	}),
	z.object({
		id: z.string().describe('The unique identifier for the resume section.'),
		resume: z.string().describe('The identifier of the resume this section belongs to.'),
		index: z.number().describe('The position of this section within the resume.'),
		type: z.literal('Experience').describe('The type of the resume section.'),
		data: ExperienceSchema.describe('The experience data associated with this section.')
	}),
	z.object({
		id: z.string().describe('The unique identifier for the resume section.'),
		resume: z.string().describe('The identifier of the resume this section belongs to.'),
		index: z.number().describe('The position of this section within the resume.'),
		type: z.literal('Skill').describe('The type of the resume section.'),
		data: ResumeSkillSectionSchema.describe('The skills data associated with this section.')
	}),
	z.object({
		id: z.string().describe('The unique identifier for the resume section.'),
		resume: z.string().describe('The identifier of the resume this section belongs to.'),
		index: z.number().describe('The position of this section within the resume.'),
		type: z.literal('Project').describe('The type of the resume section.'),
		data: ProjectSchema.describe('The project data associated with this section.')
	}),
	z.object({
		id: z.string().describe('The unique identifier for the resume section.'),
		resume: z.string().describe('The identifier of the resume this section belongs to.'),
		index: z.number().describe('The position of this section within the resume.'),
		type: z.literal('Certification').describe('The type of the resume section.'),
		data: CertificationSchema.describe('The certification data associated with this section.')
	})
])

export const ResumeSchema = z.object({
	id: z.string().describe('The unique identifier for the resume.'),
	base: z.boolean().describe('Indicates if this is the base resume.'),
	user: UserInfoSchema.describe('The user information associated with the resume.'),
	job: JobSchema.describe('The job information associated with the resume.'),
	status: z.string().describe('Indicates if the resume is currently being processed.').nullable().optional(),
	sections: z.array(ResumeSectionSchema).describe('The sections included in the resume, such as education and experience.')
})

// Infer TypeScript types from the schema
export type ResumeSection = z.infer<typeof ResumeSectionSchema>
export type Resume = z.infer<typeof ResumeSchema>
