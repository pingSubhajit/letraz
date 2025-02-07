'use server'

import {api} from '@/lib/config/api-client'
import {Experience, ExperienceMutation, ExperienceMutationSchema, ExperienceSchema} from '@/lib/experience/types'
import {auth} from '@clerk/nextjs/server'


import {ZodError} from 'zod'

export const updateUserExperienceAction = async (
	experienceValues: ExperienceMutation
): Promise<Experience> => {
	try {
		const session = await auth()
		if (!session) {
			throw new Error('Unauthorized: No session found')
		}

		const token = await session.getToken()
		if (!token) {
			throw new Error('Unauthorized: No token found')
		}

		const params = ExperienceMutationSchema.parse(experienceValues)


		const data = await api.post<Experience>('/resume/base/experience/', params)

		return ExperienceSchema.parse(data)
	} catch (error) {


		if (error instanceof ZodError) {
			throw new Error(
				`Validation failed: ${error.errors.map((e) => e.message).join(', ')}`
			)
		}

		if (error instanceof Error) {
			throw new Error(`Failed to update experience: ${error.message}`)
		}

		throw new Error('An unknown error occurred while updating experience')
	}
}
