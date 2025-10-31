import {and, eq, isNull} from 'drizzle-orm'
import {APIError} from 'encore.dev/api'
import {db} from '@/services/resume/database'
import type {
	AddSkillRequest,
	GlobalSkillCategoriesResponse,
	Skill,
	SkillCategoriesResponse,
	SkillPathParams,
	SkillResponse,
	SkillWithIdParams,
	UpdateSkillRequest
} from '@/services/resume/interface'
import {proficiencies, ProficiencyLevel, resumeSections, ResumeSectionType, skills} from '@/services/resume/schema'
import {ResumeService} from '@/services/resume/service'

/**
 * Skill Service
 * Handles all CRUD operations for skills and proficiencies
 *
 * Key responsibilities:
 * - Skill deduplication (get_or_create by name + category)
 * - Auto-create skill section if it doesn't exist
 * - Manage proficiency lifecycle
 * - Handle skill section deletion when last proficiency removed
 */

/**
 * Helper Functions
 * Internal utilities for skill operations
 */
export const SkillHelpers = {
	/**
	 * Get all skill sections for a resume
	 */
	getSkillSections: async (resumeId: string) => {
		return db
			.select()
			.from(resumeSections)
			.where(and(eq(resumeSections.resume_id, resumeId), eq(resumeSections.type, ResumeSectionType.Skill)))
	},

	/**
	 * Build where clause for section IDs
	 */
	buildSectionIdsWhere: (sectionIds: string[]) => {
		return sectionIds.length === 1
			? eq(proficiencies.resume_section_id, sectionIds[0])
			: and(...sectionIds.map(id => eq(proficiencies.resume_section_id, id)))
	},

	/**
	 * Validate proficiency level and convert from string to enum
	 */
	validateLevel: (level: string | null | undefined): ProficiencyLevel | null => {
		if (!level) return null

		const validLevels = Object.values(ProficiencyLevel)
		if (!validLevels.includes(level as ProficiencyLevel)) {
			throw APIError.invalidArgument(`Invalid proficiency level. Must be one of: ${validLevels.join(', ')}`)
		}
		return level as ProficiencyLevel
	},

	/**
	 * Get or create a skill by name and category
	 */
	getOrCreateSkill: async (name: string, category: string | null) => {
		// Try to find existing skill
		let skill = await db
			.select()
			.from(skills)
			.where(and(eq(skills.name, name), category ? eq(skills.category, category) : isNull(skills.category)))
			.limit(1)
			.then(rows => rows[0])

		if (!skill) {
			// Create new skill
			const [newSkill] = await db
				.insert(skills)
				.values({
					name,
					category,
					preferred: false
				})
				.returning()
			skill = newSkill
		}

		return skill
	},

	/**
	 * Extract unique categories from skills
	 */
	extractUniqueCategories: (skillRecords: Array<{category: string | null}>): string[] => {
		const categoriesSet = new Set<string>()
		skillRecords.forEach(skill => {
			if (skill.category) {
				categoriesSet.add(skill.category)
			}
		})
		return Array.from(categoriesSet).sort()
	},

	/**
	 * Build skill response with proficiency level
	 */
	buildSkillResponse: (proficiencyId: string, skill: Skill, level: ProficiencyLevel | null, resumeSectionId: string): SkillResponse => {
		return {
			id: proficiencyId,
			skill,
			level,
			resume_section: resumeSectionId
		}
	}
}

export const SkillService = {
	/**
	 * List all skills/proficiencies for a resume
	 * Returns proficiencies with full skill details
	 */
	listSkills: async ({resume_id}: SkillPathParams): Promise<{skills: SkillResponse[]}> => {
		const resumeId = await ResumeService.resolveResumeId(resume_id)
		await ResumeService.verifyResumeOwnership(resumeId)

		// Get all skill sections for this resume
		const skillSections = await SkillHelpers.getSkillSections(resumeId)

		if (skillSections.length === 0) {
			return {skills: []}
		}

		// Get proficiencies for all skill sections
		const sectionIds = skillSections.map(s => s.id)
		const proficiencyRecords = await db
			.select({
				proficiency: proficiencies,
				skill: skills
			})
			.from(proficiencies)
			.innerJoin(skills, eq(proficiencies.skill_id, skills.id))
			.where(SkillHelpers.buildSectionIdsWhere(sectionIds))

		const proficienciesWithSkills: SkillResponse[] = proficiencyRecords.map(record => SkillHelpers.buildSkillResponse(record.proficiency.id, record.skill, record.proficiency.level, record.proficiency.resume_section_id))

		return {skills: proficienciesWithSkills}
	},

	/**
	 * Add a skill to resume
	 * - Get or create skill by (name, category)
	 * - Get or create skill section
	 * - Create proficiency (or update if already exists)
	 */
	addSkill: async ({resume_id, ...data}: SkillPathParams & AddSkillRequest): Promise<SkillResponse> => {
		const resumeId = await ResumeService.resolveResumeId(resume_id)
		await ResumeService.verifyResumeOwnership(resumeId)

		// Validate required field
		if (!data.name || data.name.trim() === '') {
			throw APIError.invalidArgument('Skill name is required')
		}

		const skillName = data.name.trim()
		const skillCategory = data.category?.trim() || null

		// Validate and convert level
		const validatedLevel = SkillHelpers.validateLevel(data.level)

		// Get or create skill
		const skill = await SkillHelpers.getOrCreateSkill(skillName, skillCategory)

		// Get or create skill section
		let skillSection = await db
			.select()
			.from(resumeSections)
			.where(and(eq(resumeSections.resume_id, resumeId), eq(resumeSections.type, ResumeSectionType.Skill)))
			.limit(1)
			.then(rows => rows[0])

		if (!skillSection) {
			// Create skill section
			const sectionId = await ResumeService.createSectionForResume(resumeId, ResumeSectionType.Skill)
			skillSection = await db
				.select()
				.from(resumeSections)
				.where(eq(resumeSections.id, sectionId))
				.limit(1)
				.then(rows => rows[0])
		}

		// Check if proficiency already exists for this skill in this section
		const existingProficiency = await db
			.select()
			.from(proficiencies)
			.where(and(eq(proficiencies.resume_section_id, skillSection.id), eq(proficiencies.skill_id, skill.id)))
			.limit(1)
			.then(rows => rows[0])

		if (existingProficiency) {
			// Update existing proficiency
			const [updatedProficiency] = await db
				.update(proficiencies)
				.set({
					level: validatedLevel
				})
				.where(eq(proficiencies.id, existingProficiency.id))
				.returning()

			return SkillHelpers.buildSkillResponse(updatedProficiency.id, skill, updatedProficiency.level, skillSection.id)
		}

		// Create new proficiency
		const [proficiency] = await db
			.insert(proficiencies)
			.values({
				resume_section_id: skillSection.id,
				skill_id: skill.id,
				level: validatedLevel
			})
			.returning()

		// Publish event for thumbnail generation
		await ResumeService.publishResumeUpdate({
			resumeId,
			changeType: 'section_updated',
			sectionType: 'Skill',
			sectionId: proficiency.id,
			changedFields: ['skill_id']
		})

		return SkillHelpers.buildSkillResponse(proficiency.id, skill, proficiency.level, skillSection.id)
	},

	/**
	 * Update skill proficiency
	 * Can change skill name/category (will get_or_create new skill)
	 * Can update proficiency level
	 */
	updateSkill: async ({
		resume_id,
		id,
		...data
	}: SkillWithIdParams & UpdateSkillRequest): Promise<SkillResponse> => {
		// Validate UUID format
		ResumeService.validateUUID(id, 'Proficiency')

		const resumeId = await ResumeService.resolveResumeId(resume_id)
		await ResumeService.verifyResumeOwnership(resumeId)

		// Get existing proficiency
		const existingProficiency = await db.select().from(proficiencies).where(eq(proficiencies.id, id)).limit(1)

		if (existingProficiency.length === 0) {
			throw APIError.notFound(`Proficiency with ID '${id}' not found`)
		}

		const proficiency = existingProficiency[0]

		// Verify proficiency belongs to this resume
		const section = await db
			.select()
			.from(resumeSections)
			.where(and(eq(resumeSections.id, proficiency.resume_section_id), eq(resumeSections.resume_id, resumeId)))
			.limit(1)

		if (section.length === 0) {
			throw APIError.notFound(`Proficiency with ID '${id}' not found in resume '${resumeId}'`)
		}

		// Get current skill
		const currentSkill = await db.select().from(skills).where(eq(skills.id, proficiency.skill_id)).limit(1)

		if (currentSkill.length === 0) {
			throw APIError.internal(`Skill not found for proficiency ${id}`)
		}

		const skill = currentSkill[0]

		// Determine new skill name/category
		const newName = data.name !== undefined ? data.name.trim() : skill.name
		const newCategory = data.category !== undefined ? (data.category?.trim() || null) : skill.category

		if (!newName) {
			throw APIError.invalidArgument('Skill name cannot be empty')
		}

		// Validate and convert level if provided
		let validatedLevel: ProficiencyLevel | null | undefined = undefined
		if (data.level !== undefined) {
			validatedLevel = data.level === null ? null : SkillHelpers.validateLevel(data.level)
		}

		// Check if skill changed and get or create new skill
		const targetSkill =
			newName !== skill.name || newCategory !== skill.category
				? await SkillHelpers.getOrCreateSkill(newName, newCategory)
				: skill

		// Update proficiency
		const updateData: {
			skill_id: string
			level?: ProficiencyLevel | null
		} = {
			skill_id: targetSkill.id
		}

		if (validatedLevel !== undefined) {
			updateData.level = validatedLevel
		}

		const [updatedProficiency] = await db
			.update(proficiencies)
			.set(updateData)
			.where(eq(proficiencies.id, id))
			.returning()

		// Track which major fields changed
		const changedFields = Object.keys(updateData).filter(field => ['skill_id', 'level'].includes(field))

		// Publish event for thumbnail generation
		if (changedFields.length > 0) {
			await ResumeService.publishResumeUpdate({
				resumeId,
				changeType: 'section_updated',
				sectionType: 'Skill',
				sectionId: id,
				changedFields
			})
		}

		return SkillHelpers.buildSkillResponse(updatedProficiency.id, targetSkill, updatedProficiency.level, proficiency.resume_section_id)
	},

	/**
	 * Remove skill from resume
	 * Deletes proficiency record
	 * If last proficiency in skill section, also deletes the section
	 */
	removeSkill: async ({resume_id, id}: SkillWithIdParams): Promise<void> => {
		// Validate UUID format
		ResumeService.validateUUID(id, 'Proficiency')

		const resumeId = await ResumeService.resolveResumeId(resume_id)
		await ResumeService.verifyResumeOwnership(resumeId)

		// Get proficiency
		const proficiencyQuery = await db.select().from(proficiencies).where(eq(proficiencies.id, id)).limit(1)

		if (proficiencyQuery.length === 0) {
			throw APIError.notFound(`Proficiency with ID '${id}' not found`)
		}

		const proficiency = proficiencyQuery[0]

		// Verify section belongs to this resume
		const sectionQuery = await db
			.select()
			.from(resumeSections)
			.where(and(eq(resumeSections.id, proficiency.resume_section_id), eq(resumeSections.resume_id, resumeId)))
			.limit(1)

		if (sectionQuery.length === 0) {
			throw APIError.notFound(`Proficiency with ID '${id}' not found in resume '${resumeId}'`)
		}

		const section = sectionQuery[0]

		// Delete proficiency
		await db.delete(proficiencies).where(eq(proficiencies.id, id))

		// Check if this was the last proficiency in the section
		const remainingProficiencies = await db
			.select()
			.from(proficiencies)
			.where(eq(proficiencies.resume_section_id, section.id))
			.limit(1)

		if (remainingProficiencies.length === 0) {
			// Delete the empty skill section
			await db.delete(resumeSections).where(eq(resumeSections.id, section.id))
		}

		// Publish event for thumbnail generation
		await ResumeService.publishResumeUpdate({
			resumeId,
			changeType: 'section_updated',
			sectionType: 'Skill',
			sectionId: id,
			changedFields: ['removed']
		})
	},

	/**
	 * Get unique skill categories for a resume
	 * Returns list of categories from all skills in the resume
	 */
	getCategories: async ({resume_id}: SkillPathParams): Promise<SkillCategoriesResponse> => {
		const resumeId = await ResumeService.resolveResumeId(resume_id)
		await ResumeService.verifyResumeOwnership(resumeId)

		// Get all skill sections for this resume
		const skillSections = await SkillHelpers.getSkillSections(resumeId)

		if (skillSections.length === 0) {
			return {categories: []}
		}

		// Get all proficiencies with their skills
		const sectionIds = skillSections.map(s => s.id)
		const proficiencyRecords = await db
			.select({
				skill: skills
			})
			.from(proficiencies)
			.innerJoin(skills, eq(proficiencies.skill_id, skills.id))
			.where(SkillHelpers.buildSectionIdsWhere(sectionIds))

		// Extract unique categories
		const categories = SkillHelpers.extractUniqueCategories(proficiencyRecords.map(r => r.skill))

		return {categories}
	},

	/**
	 * Get all skills in the system (global, not resume-specific)
	 * Useful for autocomplete/suggestions when adding skills
	 * Returns all skills ordered by name
	 */
	getAllSkills: async (): Promise<{skills: Skill[]}> => {
		const allSkills = await db.select().from(skills).orderBy(skills.name)

		return {skills: allSkills}
	},

	/**
	 * Get all unique skill categories in the system
	 * Useful for category filtering and autocomplete
	 * Returns unique categories ordered alphabetically
	 */
	getAllCategories: async (): Promise<GlobalSkillCategoriesResponse> => {
		const allSkills = await db.select().from(skills)
		const categories = SkillHelpers.extractUniqueCategories(allSkills)

		return {categories}
	}
}

