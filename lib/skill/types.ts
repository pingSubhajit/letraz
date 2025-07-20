import {z} from 'zod'

/*
 * Base schema for skill alias
 */
export const SkillAliasSchema = z.object({
	id: z.string().uuid().describe('The unique identifier for the skill alias.').readonly(),
	category: z.string().max(50).nullable().describe('The category of the skill. (optional)'),
	name: z.string().max(250).describe('The name of the skill.'),
	preferred: z.boolean().describe('Whether this is the preferred alias for the skill.'),
	created_at: z.string().readonly().describe('The date and time the skill alias was created.'),
	updated_at: z.string().readonly().describe('The date and time the skill alias was last updated.')
})

/*
 * Base schema for Skill
 * Check https://outline.letraz.app/api-reference/resume-skill-object/get-all-global-skills for more information
 */
export const GlobalSkillSchema = z.object({
	id: z.string().uuid().describe('The unique identifier for the skill.').readonly(),
	category: z.string().max(50).nullable().describe('The category of the skill. (optional)'),
	name: z.string().max(250).describe('The name of the skill.'),
	preferred: z.boolean().describe('Whether this is the preferred name for the skill.'),
	alias: z.array(SkillAliasSchema).describe('Alternative names for the skill.'),
	created_at: z.string().readonly().describe('The date and time the skill was created.'),
	updated_at: z.string().readonly().describe('The date and time the skill was last updated.')
})

/*
 * Schema for skill level
 */
export const SkillLevelEnum = z.enum(['BEG', 'INT', 'ADV', 'EXP'])

export const skillLevels = [
	{
		value: 'BEG',
		label: 'Beginner',
		color: '#6366f1',
		description: 'Basic understanding and limited practical experience'
	},
	{
		value: 'INT',
		label: 'Intermediate',
		color: '#8b5cf6',
		description: 'Good working knowledge and some professional experience'
	},
	{
		value: 'ADV',
		label: 'Advanced',
		color: '#ec4899',
		description: 'Thorough understanding and significant practical experience'
	},
	{
		value: 'EXP',
		label: 'Expert',
		color: '#f43f5e',
		description: 'Comprehensive expertise and ability to train others'
	}
]

/*
 * Schema for Resume Skill (the connection between a skill and a resume)
 */
export const ResumeSkillSchema = z.object({
	id: z.string().uuid().describe('The unique identifier for the resume skill entry.').readonly(),
	skill: GlobalSkillSchema.describe('The skill details.'),
	resume_section: z.string().uuid().describe('The resume section the skill belongs to.'),
	level: SkillLevelEnum.nullable().describe('The proficiency level of the skill.')
})

/*
 * Schema for adding a new skill to a resume
 */
export const SkillMutationSchema = z.object({
	skill_id: z.string({
		required_error: 'Please select a skill'
	}),
	level: SkillLevelEnum.nullable(),
	category: z.string().optional()
})

/*
 * Type definitions
 */
export type SkillAlias = z.infer<typeof SkillAliasSchema>
export type GlobalSkill = z.infer<typeof GlobalSkillSchema>
export type ResumeSkill = z.infer<typeof ResumeSkillSchema>
export type SkillMutation = z.infer<typeof SkillMutationSchema>
export type SkillLevel = z.infer<typeof SkillLevelEnum>

// Use for creating a new skill from scratch if not found in global skills
export const NewSkillSchema = z.object({
	name: z.string({
		required_error: 'Skill name is required'
	}).min(2, 'Skill name must be at least 2 characters'),
	category: z.string().optional(),
	preferred: z.boolean().default(false)
})

export type NewSkill = z.infer<typeof NewSkillSchema>
