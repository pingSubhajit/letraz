'use server'

import {
	Resume,
	ResumeListItem,
	ResumeListItemSchema,
	ResumeMutation,
	ResumeMutationSchema,
	ResumeSchema
} from '@/lib/resume/types'
import {parseResume} from '@/lib/resume/parser'
import {api} from '@/lib/config/api-client'
import {handleErrors} from '@/lib/misc/error-handler'
import {ACCEPTED_MIME_TYPES, isAcceptedByName} from '@/lib/resume/accept'

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
 * Retrieves all resumes for the current user
 * GET /resume/
 */
export const listResumesForUser = async (): Promise<ResumeListItem[]> => {
	try {
		const data = await api.get<unknown[]>('/resume/')
		return (data || []).map(item => ResumeListItemSchema.parse(item))
	} catch (error) {
		console.log(error)
		return handleErrors(error, 'list resumes')
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

	// Basic validation: size and type
	const maxBytes = 10 * 1024 * 1024 // 10MB
	if (file.size === 0) {
		throw new Error('Uploaded file is empty')
	}
	if (file.size > maxBytes) {
		throw new Error('File too large. Maximum allowed size is 10MB')
	}
	const mimeOk = (file.type ? (ACCEPTED_MIME_TYPES as readonly string[]).includes(file.type) : false)
	const nameOk = isAcceptedByName((file.name ?? '').toLowerCase())
	if (!mimeOk && !nameOk) {
		throw new Error('Unsupported file type. Please upload a PDF, DOC, DOCX, RTF, ODT, or TXT file')
	}

	const result = await parseResume(file, format)
	return result
}

/**
 * Replaces a resume with provided sections payload
 * PUT /resume/{id}/ (or /resume/base/)
 */
export const replaceResume = async (
	payload: ResumeMutation,
	resumeId: string = 'base'
): Promise<Resume> => {
	try {
		const parsed = ResumeMutationSchema.parse(payload)
		const data = await api.put<Resume>(`/resume/${resumeId ?? 'base'}/`, parsed)
		return ResumeSchema.parse(data)
	} catch (error) {
		return handleErrors(error, 'replace resume')
	}
}
