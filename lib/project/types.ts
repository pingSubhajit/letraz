import {z} from 'zod'

/**
 * Project Schema for API interactions
 */
export const ProjectSchema = z.object({
	id: z.string().describe('Unique identifier for the project').readonly(),
	name: z.string().max(255).describe('Name of the project.'),
	category: z.string().max(255).nullable().describe('Category or type of the project (e.g., Web Development, Mobile App).'),
	description: z.string().nullable().describe('Detailed description of the project and its objectives.'),
	role: z.string().max(255).nullable().describe('Your role or position in this project (e.g., Lead Developer, UI Designer).'),
	github_url: z.string().max(200).nullable().describe('Link to the project\'s GitHub repository.'),
	live_url: z.string().max(200).nullable().describe('Link to the live/deployed version of the project.'),
	started_from_month: z.number().int().min(1).max(12).nullable().describe('Month when the project started (1-12).'),
	started_from_year: z.number().int().min(1900).max(2100).nullable().describe('Year when the project started (YYYY).'),
	finished_at_month: z.number().int().min(1).max(12).nullable().describe('Month when the project was completed (1-12).'),
	finished_at_year: z.number().int().min(1900).max(2100).nullable().describe('Year when the project was completed (YYYY).'),
	current: z.boolean().nullable().describe('Indicates if this is a current/ongoing project.'),
	user: z.string().describe('The user who owns this project').readonly(),
	created_at: z.string().describe('Timestamp when the project was first created.').readonly(),
	updated_at: z.string().describe('Timestamp when the project was last updated.').readonly(),
	skills_used: z.array(z.object({
		id: z.string().describe('The unique identifier for the skill entry.').readonly(),
		category: z.string().max(50).nullable().describe('The category of the skill. (optional)'),
		name: z.string().max(250).describe('The name of the skill.'),
		preferred: z.boolean().optional().describe('Whether this is a preferred skill'),
		alias: z.array(z.object({
			id: z.string().describe('The unique identifier for the alias entry.').readonly(),
			category: z.string().max(50).nullable().describe('The category of the alias. (optional)'),
			name: z.string().max(250).describe('The name of the alias.'),
			preferred: z.boolean().optional().describe('Whether this is a preferred alias'),
			created_at: z.string().describe('The date and time the alias entry was created.').readonly(),
			updated_at: z.string().describe('The date and time the alias entry was last updated.').readonly()
		})).describe('Alternative names for the skill'),
		updated_at: z.string().describe('The date and time the skill entry was last updated.').readonly(),
		created_at: z.string().describe('The date and time the skill entry was created.').readonly()
	})).describe('Skills used in this project'),
	resume_section: z.object({
		id: z.string().describe('The unique identifier for the resume section.').readonly(),
		resume: z.string().describe('The identifier of the resume this section belongs to.'),
		index: z.number().describe('The position of this section within the resume.'),
		type: z.string().describe('The type of the resume section.')
	}).describe('The resume section this project belongs to').readonly()
})

/**
 * Schema for project creation/modification
 * Derived by omitting read-only fields from ProjectSchema
 */
export const ProjectMutationSchema = ProjectSchema.omit({
	id: true,
	user: true,
	created_at: true,
	updated_at: true,
	resume_section: true,
	skills_used: true,
	started_from_month: true,
	started_from_year: true,
	finished_at_month: true,
	finished_at_year: true
}).extend({
	name: z.string().min(1, {message: 'Required'}).max(255).describe('Name of the project.'),
	started_from_month: z.string().nullish(),
	started_from_year: z.string().nullish(),
	finished_at_month: z.string().nullish(),
	finished_at_year: z.string().nullish(),
	skills_used: z.array(z.object({
		name: z.string().describe('The name of the skill.'),
		category: z.string().nullable().describe('The category of the skill. (optional)')
	})).describe('Skills used in this project')
})

// Infer TypeScript types from the schema
export type Project = z.infer<typeof ProjectSchema>
export type ProjectMutation = z.infer<typeof ProjectMutationSchema>

/**
 * Schema for global skills
 */
export const GlobalSkillSchema = z.object({
	id: z.string().describe('The unique identifier for the skill entry.').readonly(),
	name: z.string().max(250).describe('The name of the skill.'),
	category: z.string().max(50).nullable().describe('The category of the skill. (optional)'),
	preferred: z.boolean().optional().describe('Whether this is a preferred skill'),
	alias: z.array(z.object({
		id: z.string().describe('The unique identifier for the alias entry.').readonly(),
		category: z.string().max(50).nullable().describe('The category of the alias. (optional)'),
		name: z.string().max(250).describe('The name of the alias.'),
		preferred: z.boolean().optional().describe('Whether this is a preferred alias'),
		created_at: z.string().describe('The date and time the alias entry was created.').readonly(),
		updated_at: z.string().describe('The date and time the alias entry was last updated.').readonly()
	})).describe('Alternative names for the skill'),
	created_at: z.string().describe('The date and time the skill entry was created.').readonly(),
	updated_at: z.string().describe('The date and time the skill entry was last updated.').readonly()
})

export type GlobalSkill = z.infer<typeof GlobalSkillSchema>
