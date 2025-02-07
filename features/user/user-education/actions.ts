'use server'

import {api} from '@/lib/config/api-client'
import {Education, EducationMutation, EducationMutationSchema, EducationSchema} from '@/lib/education/types'
import {auth} from '@clerk/nextjs/server'


import {ZodError} from 'zod'

export const updateUserEducationAction = async (
	educationValues: EducationMutation
): Promise<Education> => {
	try {
		const params = EducationMutationSchema.parse(educationValues)

		const session = await auth()
		if (!session) {
			throw new Error('Unauthorized: No session found')
		}

		const token = await session.getToken()
		if (!token) {
			throw new Error('Unauthorized: No token found')
		}

		const data = await api.post<Education>('/resume/base/education/', params)

		return EducationSchema.parse(data)
	} catch (error) {

		if (error instanceof ZodError) {
			throw new Error(
				`Validation failed: ${error.errors.map((e) => e.message).join(', ')}`
			)
		}

		if (error instanceof Error) {
			throw new Error(`Failed to update education: ${error.message}`)
		}

		throw new Error('An unknown error occurred while updating education')
	}
}
