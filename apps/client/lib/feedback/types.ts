import {z} from 'zod'

/**
 * Schema for feedback submission request
 */
export const FeedbackMutationSchema = z.object({
	subject: z.string().optional().describe('Optional subject line for the feedback'),
	message: z.string().min(1).describe('The feedback message content')
})

/**
 * Schema for feedback submission response
 */
export const FeedbackResponseSchema = z.object({
	success: z.boolean().describe('Whether the feedback was successfully submitted'),
	message: z.string().describe('Response message from the server'),
	submitted_at: z.string().describe('Timestamp when the feedback was submitted')
})

// Infer TypeScript types from the schemas
export type FeedbackMutation = z.infer<typeof FeedbackMutationSchema>
export type FeedbackResponse = z.infer<typeof FeedbackResponseSchema>

