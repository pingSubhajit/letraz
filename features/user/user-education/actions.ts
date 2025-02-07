'use server'

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

		const response = await fetch(`${process.env.API_URL}/resume/base/education/`, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(params)
		})

		if (!response.ok) {
			const errorData = await response.json().catch(() => null)
			throw new Error(
				`Failed to update education: ${response.status} - ${response.statusText}. ${errorData?.message || ''}`
			)
		}

		const responseData = await response.json()
		return EducationSchema.parse(responseData)
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
