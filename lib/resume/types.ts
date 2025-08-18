import {EducationMutationSchema, EducationSchema} from '@/lib/education/types'
import {ExperienceMutationSchema, ExperienceSchema} from '@/lib/experience/types'
import {UserInfoSchema} from '@/lib/user-info/types'
import {ResumeSkillSectionSchema, SkillLevelEnum} from '@/lib/skill/types'
import {z} from 'zod'
import {JobSchema} from '@/lib/job/types'
import {CertificationMutationSchema, CertificationSchema} from '@/lib/certification/types'
import {ProjectMutationSchema, ProjectSchema} from '@/lib/project/types'

// Utility function to normalize thumbnail URLs by adding HTTPS protocol if missing
export const normalizeThumbnailUrl = (url: string | null | undefined): string | null => {
	if (!url) return null
	// If the URL doesn't start with http:// or https://, add https://
	if (!url.startsWith('http://') && !url.startsWith('https://')) {
		return `https://${url}`
	}
	return url
}

// Custom schema for thumbnail URLs that automatically adds HTTPS protocol if missing
const ThumbnailUrlSchema = z.string().transform((value) => {
	return normalizeThumbnailUrl(value) || value
}).pipe(z.string().url())

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
	status: z.string().nullable().optional().describe('Processing status at the root of resume.'),
	thumbnail: ThumbnailUrlSchema.nullable().optional().describe('Thumbnail image URL for the resume preview.'),
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

// Export API response
export const ExportResumeResponseSchema = z.object({
	pdf_url: z.string(),
	latex_url: z.string()
})

export type ExportResumeResponse = z.infer<typeof ExportResumeResponseSchema>

/**
 * Mutation schemas for replacing a resume
 * Consists of section mutation schemas only; excludes id, base, status, user, and job
 */
export const ResumeSkillSectionMutationSchema = z.object({
	skills: z.array(z.object({
		name: z.string().min(1),
		level: SkillLevelEnum.nullable(),
		category: z.string().nullish()
	}))
})

export const ResumeSectionMutationSchema = z.discriminatedUnion('type', [
	z.object({
		type: z.literal('Education'),
		data: EducationMutationSchema
	}),
	z.object({
		type: z.literal('Experience'),
		data: ExperienceMutationSchema
	}),
	z.object({
		type: z.literal('Skill'),
		data: ResumeSkillSectionMutationSchema
	}),
	z.object({
		type: z.literal('Project'),
		data: ProjectMutationSchema
	}),
	z.object({
		type: z.literal('Certification'),
		data: CertificationMutationSchema
	})
])

export const ResumeMutationSchema = z.object({
	sections: z.array(ResumeSectionMutationSchema)
})

export type ResumeMutation = z.infer<typeof ResumeMutationSchema>

/**
 * Lightweight schema for listing resumes for a user
 */
const ResumeListItemCommonFields = z.object({
	id: z.string(),
	user: z.string().optional(),
	status: z.string().nullable().optional(),
	thumbnail: ThumbnailUrlSchema.nullish().optional()
})

export const ResumeListItemSchema = z.discriminatedUnion('base', [
	ResumeListItemCommonFields.extend({
		base: z.literal(true),
		job: JobSchema.partial({
			requirements: true,
			responsibilities: true,
			benefits: true,
			status: true
		})
	}),
	ResumeListItemCommonFields.extend({
		base: z.literal(false),
		job: JobSchema.extend({
			requirements: JobSchema.shape.requirements.optional(),
			responsibilities: JobSchema.shape.responsibilities.optional(),
			benefits: JobSchema.shape.benefits.optional()
		})
	})
])

export type ResumeListItem = z.infer<typeof ResumeListItemSchema>
