import {MutationOptions, useMutation} from '@tanstack/react-query'
import {FeedbackMutation, FeedbackResponse} from '@/lib/feedback/types'
import {submitFeedback} from '@/lib/feedback/actions'

/**
 * Mutation hook for submitting user feedback
 */
export const useSubmitFeedbackMutation = (options?: MutationOptions<FeedbackResponse, Error, FeedbackMutation>) => {
	return useMutation({
		mutationFn: (data: FeedbackMutation) => submitFeedback(data),
		...options
	})
}

