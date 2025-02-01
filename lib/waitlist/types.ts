import {z} from 'zod'

/*
 * Base schema for Waitlist
 * Check https://outline.letraz.app/api-reference/waitlist/get-all-waitlists for more information
 */
export const WaitlistSchema = z.object({
	id: z.string().uuid().describe('The unique identifier for the waitlist entry.'),
	email: z.string().email().max(254).describe('The email address of the person signing up for the waitlist.'),
	referrer: z.string().max(50).optional().nullable().describe('The referrer information, if any. Nullable if not provided.'),
	waiting_number: z.number().describe('The position number of the person in the waitlist.'),
	created_at: z.string().describe('The date and time when the waitlist entry was created.')
})

/**
 * Schema for EducationMutation
 * Derived by omitting read-only fields from EducationSchema
 */
export const WaitlistMutationSchema = WaitlistSchema.omit({
	id: true,
	waiting_number: true,
	created_at: true
})

// Infer TypeScript types from the schema
export type Waitlist = z.infer<typeof WaitlistSchema>
export type WaitlistMutation = z.infer<typeof WaitlistMutationSchema>
