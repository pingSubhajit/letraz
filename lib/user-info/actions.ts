'use server'

import {auth} from '@clerk/nextjs/server'
import {UserInfo, UserInfoMutation, UserInfoMutationSchema, UserInfoSchema} from '@/lib/user-info/types'

/**
 * Adds or updates user information in the database
 * @param {UserInfoMutation} userInfoValues - The user information to add or update
 * @returns {Promise<UserInfo>} - The updated user information
 */
export const addOrUpdateUserInfoToDB = async (userInfoValues: UserInfoMutation): Promise<UserInfo> => {
	const session = await auth()
	const token = await session.getToken()

	const params = UserInfoMutationSchema.parse(userInfoValues)
	const response = await fetch(`${process.env.API_URL}/user/`, {
		method: 'PATCH',
		headers: {
			Authorization: `Bearer ${token}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			...params
		})
	})

	return UserInfoSchema.parse(await response.json())
}

/**
 * Retrieves personal information from the database
 * @returns {Promise<UserInfo>} - The retrieved user information
 */
export const getPersonalInfoFromDB = async (): Promise<UserInfo> => {
	const session = await auth()
	const token = await session.getToken()

	const response = await fetch(`${process.env.API_URL}/user/`, {
		headers: {
			Authorization: `Bearer ${token}`
		}
	})

	return UserInfoSchema.parse(await response.json())
}
