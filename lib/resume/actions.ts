'use server'

import {Resume, ResumeSchema, TailorResumeResponseSchema, TailorResumeResponse} from '@/lib/resume/types'
import {api} from '@/lib/config/api-client'
import {handleErrors} from '@/lib/misc/error-handler'

/**
 * Retrieves a single resume object from the database by its ID
 * @param {string} [resumeId] - The ID of the resume to retrieve. Defaults to 'base'.
 * @returns {Promise<Resume>} - The retrieved resume object
 * @throws {Error} If authentication or API request fails.
 */
export const getResumeFromDB = async (resumeId?: string | 'base'): Promise<Resume> => {
	try {
		const data = await api.get<Resume>(`/resume/${resumeId ?? 'base'}/`)
		return ResumeSchema.parse(data)
	} catch (error) {
		return handleErrors(error, 'fetch resume')
	}
}

/**
 * Rearranges the order of sections in a resume
 * @param {string} resumeId - The ID of the resume to rearrange sections for
 * @param {string[]} sectionIds - Array of section IDs in the desired order
 * @returns {Promise<Resume>} - The updated resume object
 * @throws {Error} If validation, authentication, or API request fails.
 */
export const rearrangeResumeSections = async (resumeId: string, sectionIds: string[]): Promise<Resume> => {
	try {
		const data = await api.put<Resume>(`/resume/${resumeId}/sections/rearrange/`, {
			section_ids: sectionIds
		})
		return ResumeSchema.parse(data)
	} catch (error) {
		return handleErrors(error, 'rearrange resume sections')
	}
}

/**
 * Initiates tailoring of a new resume for a job
 * Accepts either a job URL or a raw job description
 */
export const tailorResumeInDB = async (
	payload: { target: string }
): Promise<TailorResumeResponse> => {
	try {
		const data = await api.post<TailorResumeResponse>('/resume/tailor/', payload)
		return TailorResumeResponseSchema.parse(data)
	} catch (error) {
		return handleErrors(error, 'tailor resume')
	}
}
