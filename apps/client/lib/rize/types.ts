import {z} from 'zod'

export const RizeEducationSchema = z.object({
	id: z.string(),
	profileId: z.string(),
	school: z.string().nullable().optional(),
	degree: z.string().nullable().optional(),
	fieldOfStudy: z.string().nullable().optional(),
	startDate: z.string().nullable().optional(),
	endDate: z.string().nullable().optional(),
	grade: z.string().nullable().optional(),
	description: z.string().nullable().optional(),
	createdAt: z.string().nullable().optional(),
	updatedAt: z.string().nullable().optional()
})

export const RizeExperienceSchema = z.object({
	id: z.string(),
	profileId: z.string(),
	title: z.string().nullable().optional(),
	company: z.string().nullable().optional(),
	location: z.string().nullable().optional(),
	employmentType: z.string().nullable().optional(),
	startDate: z.string().nullable().optional(),
	endDate: z.string().nullable().optional(),
	currentlyWorking: z.boolean().nullable().optional(),
	companyLogo: z.string().url().nullable().optional(),
	website: z.string().url().nullable().optional(),
	description: z.string().nullable().optional(),
	createdAt: z.string().nullable().optional(),
	updatedAt: z.string().nullable().optional()
})

export const RizeProjectSchema = z.object({
	id: z.string(),
	profileId: z.string(),
	name: z.string().nullable().optional(),
	description: z.string().nullable().optional(),
	status: z.string().nullable().optional(),
	logo: z.string().url().nullable().optional(),
	url: z.string().url().nullable().optional(),
	startDate: z.string().nullable().optional(),
	endDate: z.string().nullable().optional()
})

export const RizeProfileSchema = z.object({
	id: z.string(),
	userId: z.string(),
	profileImage: z.string().url().nullable().optional(),
	displayName: z.string().nullable().optional(),
	username: z.string().nullable().optional(),
	age: z.number().nullable().optional(),
	pronouns: z.string().nullable().optional(),
	bio: z.string().nullable().optional(),
	location: z.string().nullable().optional(),
	personalMission: z.string().nullable().optional(),
	lifePhilosophy: z.string().nullable().optional(),
	website: z.string().url().nullable().optional(),
	isLive: z.boolean().nullable().optional(),
	hasCompletedWalkthrough: z.boolean().nullable().optional(),
	createdAt: z.string().nullable().optional(),
	updatedAt: z.string().nullable().optional(),
	education: z.array(RizeEducationSchema).default([]),
	experience: z.array(RizeExperienceSchema).default([]),
	projects: z.array(RizeProjectSchema).default([])
})

export const RizeUserSchema = z.object({
	id: z.string(),
	name: z.string().nullable().optional(),
	email: z.string().email().nullable().optional(),
	emailVerified: z.boolean().nullable().optional(),
	image: z.string().url().nullable().optional(),
	isOnboarded: z.boolean().nullable().optional(),
	createdAt: z.string().nullable().optional(),
	updatedAt: z.string().nullable().optional(),
	letrazId: z.string().nullable().optional(),
	profiles: z.array(RizeProfileSchema).default([])
})

export type RizeEducation = z.infer<typeof RizeEducationSchema>
export type RizeExperience = z.infer<typeof RizeExperienceSchema>
export type RizeProject = z.infer<typeof RizeProjectSchema>
export type RizeProfile = z.infer<typeof RizeProfileSchema>
export type RizeUser = z.infer<typeof RizeUserSchema>
