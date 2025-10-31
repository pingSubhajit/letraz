import {APIError} from 'encore.dev/api'
import log from 'encore.dev/log'
import {checkEventExists} from '@/services/analytics/posthog-management'
import {ResumeAnalyticsParams, ResumeAnalyticsResponse} from '@/services/analytics/interface'
import {resume} from '~encore/clients'

/**
 * Analytics Service
 * Business logic layer for analytics operations
 */
export const AnalyticsService = {
	/**
	 * Get resume analytics
	 * Checks if a 'resume_opened' event with status='success' exists for the given resume ID
	 *
	 * @param params - Resume ID parameters
	 * @returns Resume analytics response with resume_opened status
	 */
	getResumeAnalytics: async (params: ResumeAnalyticsParams): Promise<ResumeAnalyticsResponse> => {
		try {
			// Get the resume to retrieve the user_id
			const resumeData = await resume.getResumeByIdAdmin({id: params.id})

			if (!resumeData) {
				throw APIError.notFound(`Resume with ID '${params.id}' not found`)
			}

			log.info('Fetching analytics for resume', {
				resume_id: params.id,
				user_id: resumeData.user.id,
				user_email: resumeData.user.email
			})

			/*
			 * Query PostHog for 'resume_opened' events with resume_id and status='success'
			 * Use email as distinct_id (PostHog identifies users by email)
			 */
			const eventExists = await checkEventExists({
				distinctId: resumeData.user.id,
				eventName: 'resume_opened',
				propertyFilters: {
					resume_id: params.id,
					status: 'success'
				}
			})

			log.info('Admin resume opened check completed', {
				resume_id: params.id,
				user_id: resumeData.user.id,
				user_email: resumeData.user.email,
				resume_opened: eventExists
			})

			return {
				resume_opened: eventExists
			}
		} catch (error) {
			// If resume not found, let the error propagate
			if (error instanceof APIError && error.code === 'not_found') {
				throw error
			}

			// For other errors, log and throw a generic error
			log.error(error, 'Failed to fetch analytics for resume', {
				resume_id: params.id,
				error: error instanceof Error ? error.message : String(error)
			})

			throw APIError.internal('Failed to fetch analytics for resume')
		}
	}
}

