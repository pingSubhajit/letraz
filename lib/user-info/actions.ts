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

	// Transform date for API compatibility (preserve local timezone)
	const apiParams = {
		...params,
		dob: params.dob ?
			`${params.dob.getFullYear()}-${String(params.dob.getMonth() + 1).padStart(2, '0')}-${String(params.dob.getDate()).padStart(2, '0')}`
			: null
	}

	const response = await api.patch<UserInfo>('/user/', apiParams)

	// Transform string dates back to Date objects for schema validation
	const transformedResponse = {
		...response,
		dob: response.dob ? new Date(response.dob) : null
	}

	return UserInfoSchema.parse(transformedResponse)
}

/**
 * Retrieves personal information from the database
 * @returns {Promise<UserInfo>} - The retrieved user information
 */
export const getPersonalInfoFromDB = async (): Promise<UserInfo> => {
	const response = await api.get<UserInfo>('/user/')

	// Transform string dates back to Date objects for schema validation
	const transformedResponse = {
		...response,
		dob: response.dob ? new Date(response.dob) : null
	}

	return UserInfoSchema.parse(transformedResponse)
}
