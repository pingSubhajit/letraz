'use server'

import {z} from 'zod'
import {auth} from '@clerk/nextjs/server'

// Base schema for UserInfo
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


// Derive MutationParams schema by omitting read-only fields
const UserInfoMutationSchema = UserInfoSchema.omit({
	id: true,
	created_at: true,
	updated_at: true
}).partial()

// Infer TypeScript types
export type UserInfo = z.infer<typeof UserInfoSchema>
export type UserInfoMutation = z.infer<typeof UserInfoMutationSchema>

export const addOrUpdateUserInfoToDB = async (userInfoValues: UserInfoMutation) => {
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
