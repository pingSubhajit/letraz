'use server'

import {z} from 'zod'
import {auth} from '@clerk/nextjs/server'

/*
 * Base schema for UserInfo
 * Check https://outline.letraz.app/api-reference/user/get-user-info for more information
 */
const UserInfoSchema = z.object({
	id: z.string(),
	title: z.string().nullable().optional(),
	first_name: z.string(),
	last_name: z.string(),
	email: z.string().email(),
	phone: z.string().nullable().optional(),
	dob: z.date().nullable().optional(),
	nationality: z.string().nullable().optional(),
	address: z.string().nullable().optional(),
	city: z.string().nullable().optional(),
	postal: z.string().nullable().optional(),
	country: z.object({
		code: z.string(),
		name: z.string()
	}).nullable().optional(),
	website: z.string().url().nullable().optional(),
	profile_text: z.string().nullable().optional(),
	created_at: z.string(),
	updated_at: z.string()
})


/**
 * Schema for UserInfoMutation
 * Derived by omitting read-only fields from UserInfoSchema
 */
const UserInfoMutationSchema = UserInfoSchema.omit({
	id: true,
	created_at: true,
	updated_at: true
}).partial()

// Infer TypeScript types from the schema
export type UserInfo = z.infer<typeof UserInfoSchema>
export type UserInfoMutation = z.infer<typeof UserInfoMutationSchema>

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
