'use server'

import {api} from '@/lib/config/api-client'
import {UserInfo, UserInfoMutation, UserInfoSchema} from '@/lib/user-info/types'
import {ZodError} from 'zod'

export const getUserInfo = async () => {
	try {
		const user = await api.get<UserInfo>('/user/')
		const parsedData = UserInfoSchema.parse(user)
		return parsedData
	} catch (error) {


		// Handle validation errors
		if (error instanceof ZodError) {
			throw new Error(
				`Invalid user data format: ${error.errors.map(e => e.message).join(', ')}`
			)
		}

		// Handle API errors
		if (error instanceof Error) {
			throw new Error(`Failed to fetch user data: ${error.message}`)
		}

		// Handle unexpected errors
		throw new Error('An unknown error occurred while fetching user information')
	}
}


// update user info

export const updateUserInfo = async (userInfo: UserInfoMutation) => {
	try {
		const response = await api.patch<UserInfo>('/user/', userInfo)
		const parsedData = UserInfoSchema.parse(response)
		return parsedData
	} catch (error) {
		// Handle validation errors
		if (error instanceof ZodError) {
			throw new Error(
				`Invalid user data format: ${error.errors.map(e => e.message).join(', ')}`
			)
		}

		// Handle API errors
		if (error instanceof Error) {
			throw new Error(`Failed to update user data: ${error.message}`)
		}

		// Handle unexpected errors
		throw new Error('An unknown error occurred while updating user information')
	}
}
