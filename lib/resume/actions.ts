'use server'

import {auth} from '@clerk/nextjs/server'
import {Resume} from '@/lib/resume/types'

/**
 * Retrieves a single experience object from the database by its ID
 * @param {string} [resumeId] - The ID of the resume to retrieve experience entries from. Defaults to 'base'.
 * @returns {Promise<Resume>} - The retrieved experience objects
 */
export const getResumeFromDB = async (resumeId?: string | 'base'): Promise<Resume> => {
	const session = await auth()
	const token = await session.getToken()

	const response = await fetch(`${process.env.API_URL}/resume/${resumeId ?? 'base'}/`, {
		headers: {
			Authorization: `Bearer ${token}`
		}
	})

	return await response.json()
}
