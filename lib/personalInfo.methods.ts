'use server'

import {z} from 'zod'
import {auth} from '@clerk/nextjs/server'
import {stripNullFields} from '@/lib/utils'

// Base schema for UserInfo
const UserInfoSchema = z.object({
	id: z.string(),
	title: z.string().optional(),
	first_name: z.string(),
	last_name: z.string(),
	email: z.string().email(),
	phone: z.string().optional(),
	dob: z.date().optional(),
	nationality: z.string().optional(),
	address: z.string().optional(),
	city: z.string().optional(),
	postal: z.string().optional(),
	country: z.object({
		code: z.string(),
		name: z.string()
	}).optional(),
	website: z.string().url().optional(),
	profile_text: z.string().optional(),
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
		method: 'POST',
		headers: {
			Authorization: `Bearer ${token}`
		},
		body: JSON.stringify({
			...params
		})
	})

	const data = stripNullFields(await response.json())
	return UserInfoSchema.parse(data)
}

export const getPersonalInfoFromDB = async (): Promise<UserInfo> => {
	const session = await auth()
	const token = await session.getToken()

	const response = await fetch(`${process.env.API_URL}/user/`, {
		headers: {
			Authorization: `Bearer ${token}`
		}
	})

	const data = stripNullFields(await response.json())
	return UserInfoSchema.parse(data)
}
