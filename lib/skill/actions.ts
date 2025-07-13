'use server'

import {GlobalSkill, GlobalSkillSchema, ResumeSkill, ResumeSkillSchema, SkillMutation, NewSkill} from '@/lib/skill/types'
import {api} from '@/lib/config/api-client'
import {handleErrors} from '@/lib/misc/error-handler'

/**
 * Fetches all global skills from the database.
 * @returns {Promise<GlobalSkill[]>} Array of global skills.
 * @throws {Error} If API request fails.
 */
export const fetchGlobalSkills = async (): Promise<GlobalSkill[]> => {
	try {
		const data = await api.get<GlobalSkill[]>('/skill/')

		// Parse each skill
		const parsedSkills = data.map(skill => GlobalSkillSchema.parse(skill))

		return parsedSkills
	} catch (error) {
		return handleErrors(error, 'fetch global skills')
	}
}

/**
 * Fetches all skills associated with a resume.
 * @param {string} [resumeId='base'] - The ID of the resume. Defaults to 'base'.
 * @returns {Promise<ResumeSkill[]>} Array of skills associated with the resume.
 * @throws {Error} If API request fails.
 */
export const fetchResumeSkills = async (resumeId: string = 'base'): Promise<ResumeSkill[]> => {
	try {
		const data = await api.get<ResumeSkill[]>(`/resume/${resumeId}/skill/`)
		return data.map(skill => ResumeSkillSchema.parse(skill))
	} catch (error) {
		return handleErrors(error, 'fetch resume skills')
	}
}

/**
 * Adds a skill to a resume.
 * @param {SkillMutation} skillData - The skill data to add.
 * @param {string} [resumeId='base'] - The ID of the resume. Defaults to 'base'.
 * @returns {Promise<ResumeSkill>} The newly added resume skill.
 * @throws {Error} If API request fails.
 */
export const addSkillToResume = async (
	skillData: SkillMutation,
	resumeId: string = 'base'
): Promise<ResumeSkill> => {
	try {
		let apiPayload: any = {
			level: skillData.level
		}

		// Handle custom skill vs existing skill
		if (skillData.skill_id.startsWith('custom:')) {
			apiPayload.name = skillData.skill_id.substring(7) // Remove 'custom:' prefix
			if (skillData.category?.trim()) {
				apiPayload.category = skillData.category.trim()
			}
		} else {
			let skillDetails: GlobalSkill | null = null
			try {
				skillDetails = await api.get<GlobalSkill>(`/skill/${skillData.skill_id}/`)
			} catch {
				// Fallback: fetch all global skills and find the matching one
				const allSkills = await api.get<GlobalSkill[]>('/skill/')
				skillDetails = allSkills.find(s => s.id === skillData.skill_id) || null
			}
			if (skillDetails) {
				apiPayload.name = skillDetails.name
				if (!skillData.category && skillDetails.category) {
					apiPayload.category = skillDetails.category
				}
			}
		}

		/*
		 * Only include category when it has a non-empty value. Sending an empty
		 * string causes a validation error on the backend for existing skills.
		 */
		if (skillData.category?.trim()) {
			apiPayload.category = skillData.category.trim()
		}

		const data = await api.post<ResumeSkill>(`/resume/${resumeId}/skill/`, apiPayload)
		return ResumeSkillSchema.parse(data)
	} catch (error) {
		return handleErrors(error, 'add skill to resume')
	}
}

/**
 * Updates a skill in a resume.
 * @param {string} skillId - The ID of the resume skill entry to update.
 * @param {Partial<SkillMutation>} skillData - The updated skill data.
 * @param {string} [resumeId='base'] - The ID of the resume. Defaults to 'base'.
 * @returns {Promise<ResumeSkill>} The updated resume skill.
 * @throws {Error} If API request fails.
 */
export const updateResumeSkill = async (
	skillId: string,
	skillData: Partial<SkillMutation>,
	resumeId: string = 'base'
): Promise<ResumeSkill> => {
	try {
		// Format data for the API
		let apiPayload: any = {}

		// Include level if provided
		if (skillData.level) {
			apiPayload.level = skillData.level
		}

		// Handle skill name changes
		if (skillData.skill_id) {
			if (skillData.skill_id.startsWith('custom:')) {
				// For custom skills, extract the name from the custom format
				apiPayload.name = skillData.skill_id.substring(7)
			} else {
				// For existing global skills, fetch the skill details to get the name
				let skillDetails: GlobalSkill | null = null
				try {
					skillDetails = await api.get<GlobalSkill>(`/skill/${skillData.skill_id}/`)
				} catch {
					// Fallback: fetch all global skills and find the matching one
					const allSkills = await api.get<GlobalSkill[]>('/skill/')
					skillDetails = allSkills.find(s => s.id === skillData.skill_id) || null
				}
				if (skillDetails) {
					apiPayload.name = skillDetails.name
				}
			}
		}

		/*
		 * Always include category if provided, even if empty (user might want to clear it)
		 * Use the category from the form, not from the global skill
		 */
		if (skillData.category !== undefined) {
			apiPayload.category = skillData.category.trim() || null
		}

		const data = await api.patch<ResumeSkill>(`/resume/${resumeId}/skill/${skillId}/`, apiPayload)
		return ResumeSkillSchema.parse(data)
	} catch (error) {
		return handleErrors(error, 'update resume skill')
	}
}

/**
 * Removes a skill from a resume.
 * @param {string} skillId - The ID of the resume skill entry to remove.
 * @param {string} [resumeId='base'] - The ID of the resume. Defaults to 'base'.
 * @returns {Promise<void>}
 * @throws {Error} If API request fails.
 */
export const removeSkillFromResume = async (
	skillId: string,
	resumeId: string = 'base'
): Promise<void> => {
	try {
		await api.delete(`/resume/${resumeId}/skill/${skillId}/`)
	} catch (error) {
		handleErrors(error, 'remove skill from resume')
	}
}

/**
 * Creates a new global skill in the database.
 * @param {NewSkill} skillData - The skill data to create.
 * @returns {Promise<GlobalSkill>} The newly created global skill.
 * @throws {Error} If API request fails.
 */
export const createGlobalSkill = async (skillData: NewSkill): Promise<GlobalSkill> => {
	try {
		const data = await api.post<GlobalSkill>('/skill/', skillData)
		return GlobalSkillSchema.parse(data)
	} catch (error) {
		return handleErrors(error, 'create global skill')
	}
}
