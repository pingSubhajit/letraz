'use server'

import {Resume, ResumeSchema} from '@/lib/resume/types'
import {parseResume} from '@/lib/resume/parser'
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
 * Parses an uploaded resume file using the self-hosted parser
 * Runs on the server and accepts a FormData containing the file
 */
export const parseUploadedResume = async (
	formData: FormData,
	format: 'proprietary' | 'generic' = 'proprietary'
): Promise<any> => {
	const file = formData.get('file')
	if (!file || !(file instanceof File)) {
		throw new Error('No file provided in form data under key "file"')
	}

	const result = await parseResume(file, format)
	return result
}
