'use server'

import {GlobalSkill, GlobalSkillSchema, ResumeSkill, ResumeSkillSchema, SkillMutation} from '@/lib/skill/types'
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

		// Map the data and log each skill parsing result
		const parsedSkills = data.map(skill => {
			try {
				const parsed = GlobalSkillSchema.parse(skill)
				return parsed
			} catch (parseError) {
				throw parseError
			}
		})

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
			// For custom skills, extract the name from skill_id and use the provided category
			apiPayload.name = skillData.skill_id.substring(7) // Remove 'custom:' prefix
			apiPayload.category = skillData.category
		} else {
			// For existing skills, send the skill_id
			apiPayload.skill_id = skillData.skill_id
			apiPayload.category = skillData.category
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
				// For custom skills, extract the name
				apiPayload.name = skillData.skill_id.substring(7) // Remove 'custom:' prefix
			} else {
				// For existing skills, use the skill_id
				apiPayload.skill_id = skillData.skill_id
			}
		}

		// Include category if provided
		if (skillData.category !== undefined) {
			apiPayload.category = skillData.category
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
