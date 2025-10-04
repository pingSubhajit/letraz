'use server'

import {UserInfo, UserInfoMutation, UserInfoMutationSchema, UserInfoSchema} from '@/lib/user-info/types'
import {api} from '@/lib/config/api-client'
import {apiDateToDate} from '@/lib/utils'

/**
 * Adds or updates user information in the database
 * @param {UserInfoMutation} userInfoValues - The user information to add or update
 * @returns {Promise<UserInfo>} - The updated user information
 */
export const addOrUpdateUserInfoToDB = async (
	userInfoValues: UserInfoMutation,
	options?: { headers?: Record<string, string> }
): Promise<UserInfo> => {
	const params = UserInfoMutationSchema.parse(userInfoValues)
	console.log(params.dob)

	// Transform date for API compatibility (preserve local timezone)
	const apiParams = {
		...params,
		dob: params.dob
	}

	const response = await api.put<UserInfo>('/identity/me/', apiParams, options)

	// Transform string dates back to Date objects for schema validation
	const transformedResponse = {
		...response,
		dob: apiDateToDate(response.dob?.toString())
	}

	return UserInfoSchema.parse(transformedResponse)
}

/**
 * Retrieves personal information from the database
 * @returns {Promise<UserInfo>} - The retrieved user information
 */
export const getPersonalInfoFromDB = async (): Promise<UserInfo> => {
	const response = await api.get<UserInfo>('/identity/me')

	// Transform string dates back to Date objects for schema validation
	const transformedResponse = {
		...response,
		dob: response.dob ? new Date(response.dob) : null
	}

	return UserInfoSchema.parse(transformedResponse)
}
