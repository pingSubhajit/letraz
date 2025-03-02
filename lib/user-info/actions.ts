'use server'

import {UserInfo, UserInfoMutation, UserInfoMutationSchema, UserInfoSchema} from '@/lib/user-info/types'
import {api} from '@/lib/config/api-client'

/**
 * Adds or updates user information in the database
 * @param {UserInfoMutation} userInfoValues - The user information to add or update
 * @returns {Promise<UserInfo>} - The updated user information
 */
export const addOrUpdateUserInfoToDB = async (userInfoValues: UserInfoMutation): Promise<UserInfo> => {
	const params = UserInfoMutationSchema.parse(userInfoValues)
	const response = await api.patch<UserInfo>('/user/', params)
	return UserInfoSchema.parse(response)
}

/**
 * Retrieves personal information from the database
 * @returns {Promise<UserInfo>} - The retrieved user information
 */
export const getPersonalInfoFromDB = async (): Promise<UserInfo> => {
	const response = await api.get<UserInfo>('/user/')
	return UserInfoSchema.parse(response)
}
