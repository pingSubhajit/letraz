import {z} from 'zod'

export const LinkedInExperienceItemSchema = z.object({
	company: z.string().nullable().optional(),
	company_id: z.string().nullable().optional(),
	company_logo_url: z.string().url().nullable().optional(),
	description: z.string().nullable().optional(),
	description_html: z.string().nullable().optional(),
	end_date: z.string().nullable().optional(),
	location: z.string().nullable().optional(),
	start_date: z.string().nullable().optional(),
	title: z.string().nullable().optional(),
	url: z.string().url().nullable().optional()
})

export const LinkedInEducationItemSchema = z.object({
	degree: z.string().nullable().optional(),
	description: z.string().nullable().optional(),
	description_html: z.string().nullable().optional(),
	end_year: z.string().nullable().optional(),
	field: z.string().nullable().optional(),
	institute_logo_url: z.string().url().nullable().optional(),
	start_year: z.string().nullable().optional(),
	title: z.string().nullable().optional(),
	url: z.string().url().nullable().optional()
})

export const LinkedInLanguageItemSchema = z.object({
	title: z.string().nullable().optional(),
	subtitle: z.string().nullable().optional()
})

export const LinkedInCertificationItemSchema = z.object({
	title: z.string().nullable().optional(),
	subtitle: z.string().nullable().optional(),
	credential_id: z.string().nullable().optional(),
	credential_url: z.string().url().nullable().optional(),
	meta: z.string().nullable().optional()
})

export const BrightDataLinkedInProfileSchema = z.object({
	timestamp: z.string().nullable().optional(),
	linkedin_num_id: z.string().nullable().optional(),
	url: z.string().nullable().optional(),
	name: z.string().nullable().optional(),
	country_code: z.string().nullable().optional(),
	city: z.string().nullable().optional(),
	about: z.string().nullable().optional(),
	followers: z.number().nullable().optional(),
	connections: z.number().nullable().optional(),
	position: z.string().nullable().optional(),
	experience: z.array(LinkedInExperienceItemSchema).nullable().optional(),
	current_company: z
		.object({
			company_id: z.string().nullable().optional(),
			link: z.string().url().nullable().optional(),
			location: z.string().nullable().optional(),
			name: z.string().nullable().optional(),
			title: z.string().nullable().optional()
		})
		.nullable()
		.optional(),
	education: z.array(LinkedInEducationItemSchema).nullable().optional(),
	languages: z.array(LinkedInLanguageItemSchema).nullable().optional(),
	certifications: z.array(LinkedInCertificationItemSchema).nullable().optional(),
	projects: z
		.array(
			z
				.object({
					title: z.string().nullable().optional(),
					description: z.string().nullable().optional(),
					description_html: z.string().nullable().optional(),
					start_date: z.string().nullable().optional(),
					end_date: z.string().nullable().optional(),
					url: z.string().url().nullable().optional()
				})
				.catchall(z.any())
		)
		.nullable()
		.optional(),
	avatar: z.string().url().nullable().optional(),
	banner_image: z.string().url().nullable().optional(),
	first_name: z.string().nullable().optional(),
	last_name: z.string().nullable().optional(),
	linkedin_id: z.string().nullable().optional(),
	input_url: z.string().nullable().optional()
})

export type BrightDataLinkedInProfile = z.infer<typeof BrightDataLinkedInProfileSchema>
