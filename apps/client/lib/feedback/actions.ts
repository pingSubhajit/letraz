'use server'

import {api} from '@/lib/config/api-client'
import {handleErrors} from '@/lib/misc/error-handler'
import {FeedbackMutation, FeedbackMutationSchema, FeedbackResponse, FeedbackResponseSchema} from '@/lib/feedback/types'

/**
 * Submits user feedback to the backend.
 * @param {FeedbackMutation} feedback - The feedback data containing subject and message.
 * @returns {Promise<FeedbackResponse>} Response containing success status, message, and timestamp.
 * @throws {Error} If validation or API request fails.
 */
export const submitFeedback = async (feedback: FeedbackMutation): Promise<FeedbackResponse> => {
	try {
		// Validate input data
		const validatedData = FeedbackMutationSchema.parse(feedback)

		// Submit feedback to the API
		const response = await api.post<FeedbackResponse>('/feedback', validatedData)

		// Validate and return response
		return FeedbackResponseSchema.parse(response)
	} catch (error) {
		return handleErrors(error, 'submit feedback')
	}
}

