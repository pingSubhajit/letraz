'use server'

import {UserInfo, UserInfoMutation, UserInfoMutationSchema, UserInfoSchema} from '@/lib/user-info/types'
import {api} from '@/lib/config/api-client'
import {apiDateToDate, dateToApiFormat} from '@/lib/utils'

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

	// Transform date for API compatibility (preserve local timezone)
	const apiParams = {
		...params,
		dob: dateToApiFormat(params.dob)
	}

	const response = await api.patch<UserInfo>('/user/', apiParams, options)

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
	const response = await api.get<UserInfo>('/user/')

	// Transform string dates back to Date objects for schema validation
	const transformedResponse = {
		...response,
		dob: response.dob ? new Date(response.dob) : null
	}

	return UserInfoSchema.parse(transformedResponse)
}
