import {z} from 'zod'

/*
 * Base schema for UserInfo
 * Check https://outline.letraz.app/api-reference/user/get-user-info for more information
 */
export const UserInfoSchema = z.object({
	id: z.string().describe('The unique identifier for the user.'),
	title: z.string().nullable().optional().describe('The title of the user, such as Mr., Ms., Dr., etc. Nullable and optional.'),
	first_name: z.string()
		.min(2, {message: 'You don\'t have a name shorter than two letters do you?'}).describe('The first name of the user. Must be at least 2 characters long.')
		.max(50, {message: 'That\'s a long name! We can\'t handle that'}).describe('The first name of the user. Must be at most 50 characters long.'),
	last_name: z.string()
		.min(2, {message: 'You don\'t have a name shorter than two letters do you?'}).describe('The last name of the user. Must be at least 2 characters long.')
		.max(50, {message: 'That\'s a long name! We can\'t handle that'}).describe('The last name of the user. Must be at most 50 characters long.')
		.optional().nullable(),
	email: z.string().email({message: 'Please enter a valid email address'}).describe('The email address of the user. Must be a valid email format.'),
	phone: z.string()
		.min(10, {message: 'That phone number doesn\'t look right'}).describe('The phone number of the user. Must be at least 10 characters long.')
		.max(25, {message: 'That phone number doesn\'t look right'}).describe('The phone number of the user. Must be at most 25 characters long.')
		.nullable().optional().describe('The phone number of the user. Nullable and optional.'),
	dob: z.date().nullable().optional().describe('The date of birth of the user. Nullable and optional.'),
	nationality: z.string().nullable().optional().describe('The nationality of the user. Nullable and optional.'),
	address: z.string().nullable().optional().describe('The address of the user. Nullable and optional.'),
	city: z.string().nullable().optional().describe('The city of the user. Nullable and optional.'),
	postal: z.string().nullable().optional().describe('The postal code of the user. Nullable and optional.'),
	country: z.object({
		code: z.string().describe('The country code.'),
		name: z.string().describe('The country name.')
	}).nullable().optional().describe('The country information of the user. Nullable and optional.'),
	website: z.string().url().nullable().optional().describe('The website URL of the user. Must be a valid URL format. Nullable and optional.'),
	profile_text: z.string().nullable().optional().describe('The profile text or bio of the user. Nullable and optional.'),
	created_at: z.string().describe('The date and time when the user information was created.'),
	updated_at: z.string().describe('The date and time when the user information was last updated.')
})


/**
 * Schema for UserInfoMutation
 * Derived by omitting read-only fields from UserInfoSchema
 * Note: country field accepts only country code as string for mutations
 */
export const UserInfoMutationSchema = UserInfoSchema.omit({
	id: true,
	created_at: true,
	updated_at: true,
	country: true
}).extend({
	country: z.string().nullable().optional().describe('The country code of the user. Nullable and optional.')
}).partial()

// Infer TypeScript types from the schema
export type UserInfo = z.infer<typeof UserInfoSchema>
export type UserInfoMutation = z.infer<typeof UserInfoMutationSchema>
