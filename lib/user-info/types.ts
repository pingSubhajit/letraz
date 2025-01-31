import {z} from 'zod'

/*
 * Base schema for UserInfo
 * Check https://outline.letraz.app/api-reference/user/get-user-info for more information
 */
export const UserInfoSchema = z.object({
	id: z.string(),
	title: z.string().nullable().optional(),
	first_name: z.string()
		.min(2, {message: 'You don\'t have a name shorter than two letters do you?'})
		.max(50, {message: 'That\'s a long name! We can\'t handle that'}),
	last_name: z.string()
		.min(2, {message: 'You don\'t have a name shorter than two letters do you?'})
		.max(50, {message: 'That\'s a long name! We can\'t handle that'}),
	email: z.string().email({message: 'Please enter a valid email address'}),
	phone: z.string()
		.min(10, {message: 'That phone number doesn\'t look right'})
		.max(15, {message: 'That phone number doesn\'t look right'})
		.nullable().optional(),
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
export const UserInfoMutationSchema = UserInfoSchema.omit({
	id: true,
	created_at: true,
	updated_at: true
}).partial()

// Infer TypeScript types from the schema
export type UserInfo = z.infer<typeof UserInfoSchema>
export type UserInfoMutation = z.infer<typeof UserInfoMutationSchema>
