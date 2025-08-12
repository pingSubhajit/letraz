'use server'

import {generateObject} from 'ai'
import {google} from '@ai-sdk/google'
import {z} from 'zod'

// Simplified schemas compatible with Google Gemini
const GeminiUserInfoSchema = z.object({
	title: z.string().describe('The title of the user, ex. Mr. Mrs. etc.').nullable().optional(),
	first_name: z.string().describe('The first name of the user'),
	last_name: z.string().describe('The last name of the user'),
	email: z.string().describe('The email address of the user'),
	phone: z.string().describe('The phone number of the user').nullable().optional(),
	dob: z.string().describe('The date of birth as ISO string').nullable().optional(),
	nationality: z.string().describe('The nationality of the user').nullable().optional(),
	address: z.string().describe('The address of the user').nullable().optional(),
	city: z.string().describe('The city of the user').nullable().optional(),
	postal: z.string().describe('The postal code of the user').nullable().optional(),
	country: z.object({
		code: z.string().describe('The country code'),
		name: z.string().describe('The country name')
	}).describe('The country information').nullable().optional(),
	website: z.string().describe('The website URL of the user').nullable().optional(),
	profile_text: z.string().describe('The profile text or bio of the user').nullable().optional()
})

const GeminiJobSchema = z.object({
	title: z.string().describe('The job title'),
	description: z.string().describe('The job description'),
	company_name: z.string().describe('The company name'),
	location: z.string().describe('The job location'),
	job_url: z.string().describe('The job URL'),
	requirements: z.string().describe('The job requirements').nullable(),
	responsibilities: z.string().describe('The job responsibilities').nullable(),
	benefits: z.string().describe('The job benefits').nullable()
})

const GeminiEducationSchema = z.object({
	institution_name: z.string().describe('The name of the institution'),
	field_of_study: z.string().describe('The field of study'),
	degree: z.string().describe('The degree obtained').optional(),
	country: z.object({
		code: z.string().describe('The country code'),
		name: z.string().describe('The country name')
	}).describe('The country information'),
	started_from_month: z.number().describe('The start month').optional(),
	started_from_year: z.number().describe('The start year').optional(),
	finished_at_month: z.number().describe('The finish month').optional(),
	finished_at_year: z.number().describe('The finish year').optional(),
	current: z.boolean().describe('Whether currently studying'),
	description: z.string().describe('The description').optional()
})

const GeminiExperienceSchema = z.object({
	company_name: z.string().describe('The company name'),
	job_title: z.string().describe('The job title'),
	country: z.object({
		code: z.string().describe('The country code'),
		name: z.string().describe('The country name')
	}).describe('The country information'),
	started_from_month: z.number().describe('The start month').optional(),
	started_from_year: z.number().describe('The start year').optional(),
	finished_at_month: z.number().describe('The finish month').optional(),
	finished_at_year: z.number().describe('The finish year').optional(),
	current: z.boolean().describe('Whether currently working'),
	description: z.string().describe('The job description').optional()
})

const GeminiSkillSchema = z.object({
	skill: z.object({
		name: z.string().describe('The skill name'),
		alias: z.array(z.object({
			name: z.string().describe('The alias name')
		})).describe('The skill aliases')
	}).describe('The skill information'),
	proficiency: z.string().describe('The proficiency level').optional(),
	years_of_experience: z.number().describe('Years of experience').optional()
})

const GeminiCertificationSchema = z.object({
	certification_name: z.string().describe('The certification name'),
	issuing_organization: z.string().describe('The issuing organization'),
	issued_date: z.string().describe('The issued date').optional(),
	expiry_date: z.string().describe('The expiry date').optional(),
	credential_id: z.string().describe('The credential ID').optional(),
	credential_url: z.string().describe('The credential URL').optional(),
	description: z.string().describe('The description').optional()
})

const GeminiProjectSchema = z.object({
	project_name: z.string().describe('The project name'),
	description: z.string().describe('The project description').optional(),
	technologies_used: z.string().describe('Technologies used').optional(),
	project_url: z.string().describe('The project URL').optional(),
	github_url: z.string().describe('The GitHub URL').optional(),
	started_from_month: z.number().describe('The start month').optional(),
	started_from_year: z.number().describe('The start year').optional(),
	finished_at_month: z.number().describe('The finish month').optional(),
	finished_at_year: z.number().describe('The finish year').optional(),
	current: z.boolean().describe('Whether currently working on project')
})

// Simplified section schema
const GeminiResumeSectionSchema = z.object({
	type: z.enum(['Education', 'Experience', 'Skill', 'Project', 'Certification']).describe('The type of the resume section'),
	education_data: GeminiEducationSchema.optional().describe('Education data if type is Education'),
	experience_data: GeminiExperienceSchema.optional().describe('Experience data if type is Experience'),
	skill_data: z.array(GeminiSkillSchema).optional().describe('Skills data if type is Skill'),
	certification_data: GeminiCertificationSchema.optional().describe('Certification data if type is Certification'),
	project_data: GeminiProjectSchema.optional().describe('Project data if type is Project')
})

// Simplified resume schema compatible with Gemini
const GeminiResumeSchema = z.object({
	user: GeminiUserInfoSchema.describe('The user information associated with the resume'),
	sections: z.array(GeminiResumeSectionSchema).describe('The sections included in the resume')
})

// Generic schema for non-proprietary format
const GenericResumeSchema = z.object({
	personalInfo: z.object({
		name: z.string(),
		email: z.string().optional(),
		phone: z.string().optional(),
		location: z.string().optional(),
		summary: z.string().optional()
	}),
	education: z.array(z.object({
		institution: z.string(),
		degree: z.string().optional(),
		field: z.string().optional(),
		startDate: z.string().describe('Use blank string if not found'),
		endDate: z.string().describe('Use blank string if not found'),
		gpa: z.string().optional()
	})),
	experience: z.array(z.object({
		company: z.string(),
		position: z.string(),
		startDate: z.string().describe('Use blank string if not found'),
		endDate: z.string().describe('Use blank string if not found'),
		description: z.string().describe('In a short paragraph, what did the user do in their experience and their impact'),
		location: z.string().optional()
	})),
	skills: z.array(z.string()),
	certifications: z.array(z.object({
		name: z.string(),
		issuer: z.string().optional(),
		date: z.string().optional()
	})),
	projects: z.array(z.object({
		name: z.string(),
		description: z.string(),
		technologies: z.array(z.string()).optional()
	}))
})

/**
 * Parses an uploaded resume file using Vercel AI SDK with Gemini Flash
 * and returns either a proprietary Resume object or a generic JSON structure.
 *
 * @returns Parsed resume data matching the requested format
 * @param geminiResult
 */
// Helper function to transform Gemini result to a simple parsed format
const transformToSimpleFormat = (geminiResult: z.infer<typeof GeminiResumeSchema>) => {
	return {
		user: {
			...geminiResult.user,
			dob: geminiResult.user?.dob ? new Date(geminiResult.user.dob) : null
		},
		sections: geminiResult.sections.map((section, index) => ({
			type: section.type,
			index: index,
			data:
				section.education_data ??
				section.experience_data ??
				section.certification_data ??
				section.project_data ??
				{skills: section.skill_data ?? []}
		}))
	}
}

export const parseResume = async (
	file: File,
	format: 'proprietary' | 'generic' = 'proprietary'
): Promise<any> => {
	// Validate input
	if (!file || !(file instanceof File)) {
		throw new Error('Uploaded resume is not a file')
	}

	if (file.size === 0) {
		throw new Error('Uploaded resume is an empty file')
	}

	const schema = format === 'proprietary' ? GeminiResumeSchema : GenericResumeSchema

	const prompt = format === 'proprietary'
		? 'Parse resume content into structured data. Extract: personal info, education, experience, skills, certifications, projects. Use HTML for descriptions with <ul class="list-node"><li class="text-node">text</li></ul> format. If certain details cannot be found, just leave a blank string for that. Only return the JSON response. Do not include any additional texts, backticks or artifacts.'
		: 'Parse resume into: personalInfo, education, experience, skills, certifications, projects. Only return the JSON response. Do not include any additional texts, backticks or artifacts.'

	// Convert file to data URL format as required by AI SDK
	const arrayBuffer = await file.arrayBuffer()

	try {
		const result = await generateObject({
			model: google('gemini-2.5-flash-lite'),
			schema,
			messages: [
				{
					role: 'user',
					content: [
						{
							type: 'text',
							text: prompt
						},
						{
							type: 'file',
							data: arrayBuffer,
							mediaType: file.type
						}
					]
				}
			],
			// Add performance optimizations
			temperature: 0 // More deterministic, faster
		})

		if (format === 'proprietary') {
			// Transform to simple parsed format without metadata
			const geminiResult = result.object as z.infer<typeof GeminiResumeSchema>
			return transformToSimpleFormat(geminiResult)
		}

		return result.object
	} catch (error) {
		throw new Error(`Failed to parse resume: ${(error as Error).message}`)
	}
}
