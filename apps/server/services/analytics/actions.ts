import log from 'encore.dev/log'
import {Subscription} from 'encore.dev/pubsub'
import {getPosthog} from '@/services/analytics/posthog'
import {waitlistSubmitted} from '@/services/core/topics'
import {
	resumeExportFailed,
	resumeExportSuccess,
	resumeTailoringFailed,
	resumeTailoringSuccess,
	resumeUpdated
} from '@/services/resume/topics'
import {AnalyticsEventProps} from '@/services/analytics/events'

const waitlistSubmittedSubscription = new Subscription(waitlistSubmitted, 'track-waitlist-submitted', {
	handler: async (event) => {
		const ph = getPosthog()
		if (!ph) {
			log.warn('PostHog not configured; dropping waitlist_submitted', {email: event.email})
			return
		}
		ph.identify({
			distinctId: event.email,
			properties: {
				email: event.email,
				referrer: event.referrer ?? null,
				first_seen_at: event.submittedAt
			}
		})
		ph.capture({
			distinctId: event.email,
			event: 'waitlist_submitted',
			properties: ({
				referrer: event.referrer ?? undefined
			} satisfies AnalyticsEventProps<'waitlist_submitted'>)
		})
	}
})

/**
 * Track resume tailoring success
 * Captures tailor_resume_created and tailor_resume_ready events
 */
const resumeTailoringSuccessSubscription = new Subscription(resumeTailoringSuccess, 'track-resume-tailoring-success', {
	handler: async (event) => {
		const ph = getPosthog()
		if (!ph) {
			log.warn('PostHog not configured; dropping resume tailoring success tracking', {
				resume_id: event.resume_id,
				user_id: event.user_id
			})
			return
		}

		try {
			// Track tailor_resume_created
			ph.capture({
				distinctId: event.user_id,
				event: 'tailor_resume_created',
				properties: ({
					resume_id: event.resume_id,
					source: 'dashboard'
				} satisfies AnalyticsEventProps<'tailor_resume_created'>)
			})

			/*
			 * Calculate processing time if triggered_at timestamp is available
			 * Note: We'd need to pass triggered_at through the event chain for accurate timing
			 * For now, we track tailor_resume_ready without processing_time_ms
			 */
			ph.capture({
				distinctId: event.user_id,
				event: 'tailor_resume_ready',
				properties: ({
					resume_id: event.resume_id,
					thumbnail: false // Will be updated when thumbnail generation completes
				} satisfies AnalyticsEventProps<'tailor_resume_ready'>)
			})

			log.info('Tracked resume tailoring success', {
				resume_id: event.resume_id,
				user_id: event.user_id
			})
		} catch (error) {
			log.error('Failed to track resume tailoring success', {
				resume_id: event.resume_id,
				user_id: event.user_id,
				error: error instanceof Error ? error.message : String(error)
			})
		}
	}
})

/**
 * Track resume tailoring failure
 */
const resumeTailoringFailedSubscription = new Subscription(resumeTailoringFailed, 'track-resume-tailoring-failed', {
	handler: async (event) => {
		const ph = getPosthog()
		if (!ph) {
			log.warn('PostHog not configured; dropping resume tailoring failure tracking', {
				resume_id: event.resume_id,
				user_id: event.user_id
			})
			return
		}

		try {
			ph.capture({
				distinctId: event.user_id,
				event: 'tailor_resume_failed',
				properties: ({
					error_category: 'processing_error'
				} satisfies AnalyticsEventProps<'tailor_resume_failed'>)
			})

			log.info('Tracked resume tailoring failure', {
				resume_id: event.resume_id,
				user_id: event.user_id,
				error: event.error_message
			})
		} catch (error) {
			log.error('Failed to track resume tailoring failure', {
				resume_id: event.resume_id,
				user_id: event.user_id,
				error: error instanceof Error ? error.message : String(error)
			})
		}
	}
})

/**
 * Track resume updates
 * Handles both resume_deleted and resume_saved events based on change_type
 */
const resumeUpdatedSubscription = new Subscription(resumeUpdated, 'track-resume-updates', {
	handler: async (event) => {
		const ph = getPosthog()
		if (!ph) {
			log.warn('PostHog not configured; dropping resume update tracking', {
				resume_id: event.resume_id,
				user_id: event.user_id,
				change_type: event.change_type
			})
			return
		}

		try {
			// Track resume deletion
			if (event.change_type === 'resume_deleted') {
				ph.capture({
					distinctId: event.user_id,
					event: 'resume_deleted',
					properties: ({
						resume_id: event.resume_id
					} satisfies AnalyticsEventProps<'resume_deleted'>)
				})

				log.info('Tracked resume deletion', {
					resume_id: event.resume_id,
					user_id: event.user_id
				})
			}

			// Track resume save (bulk replace)
			if (event.change_type === 'bulk_replace') {
				const sectionsCount = event.metadata?.sections_count as number | undefined

				ph.capture({
					distinctId: event.user_id,
					event: 'resume_saved',
					properties: ({
						resume_id: event.resume_id,
						sections_count: sectionsCount
					} satisfies AnalyticsEventProps<'resume_saved'>)
				})

				log.info('Tracked resume save', {
					resume_id: event.resume_id,
					user_id: event.user_id,
					sections_count: sectionsCount
				})
			}
		} catch (error) {
			log.error('Failed to track resume update', {
				resume_id: event.resume_id,
				user_id: event.user_id,
				change_type: event.change_type,
				error: error instanceof Error ? error.message : String(error)
			})
		}
	}
})

/**
 * Track resume export success
 * Tracks both PDF and TEX format exports
 */
const resumeExportSuccessSubscription = new Subscription(resumeExportSuccess, 'track-resume-export-success', {
	handler: async (event) => {
		const ph = getPosthog()
		if (!ph) {
			log.warn('PostHog not configured; dropping resume export success tracking', {
				resume_id: event.resume_id,
				user_id: event.user_id
			})
			return
		}

		try {
			// Track PDF export success
			ph.capture({
				distinctId: event.user_id,
				event: 'resume_export_succeeded',
				properties: ({
					resume_id: event.resume_id,
					format: 'pdf'
				} satisfies AnalyticsEventProps<'resume_export_succeeded'>)
			})

			// Track TEX export success
			ph.capture({
				distinctId: event.user_id,
				event: 'resume_export_succeeded',
				properties: ({
					resume_id: event.resume_id,
					format: 'tex'
				} satisfies AnalyticsEventProps<'resume_export_succeeded'>)
			})

			log.info('Tracked resume export success', {
				resume_id: event.resume_id,
				user_id: event.user_id
			})
		} catch (error) {
			log.error('Failed to track resume export success', {
				resume_id: event.resume_id,
				user_id: event.user_id,
				error: error instanceof Error ? error.message : String(error)
			})
		}
	}
})

/**
 * Track resume export failure
 * Tracks both PDF and TEX format export failures
 */
const resumeExportFailedSubscription = new Subscription(resumeExportFailed, 'track-resume-export-failed', {
	handler: async (event) => {
		const ph = getPosthog()
		if (!ph) {
			log.warn('PostHog not configured; dropping resume export failure tracking', {
				resume_id: event.resume_id,
				user_id: event.user_id
			})
			return
		}

		try {
			// Track PDF export failure
			ph.capture({
				distinctId: event.user_id,
				event: 'resume_export_failed',
				properties: ({
					resume_id: event.resume_id,
					format: 'pdf',
					error_category: 'service_error'
				} satisfies AnalyticsEventProps<'resume_export_failed'>)
			})

			// Track TEX export failure
			ph.capture({
				distinctId: event.user_id,
				event: 'resume_export_failed',
				properties: ({
					resume_id: event.resume_id,
					format: 'tex',
					error_category: 'service_error'
				} satisfies AnalyticsEventProps<'resume_export_failed'>)
			})

			log.info('Tracked resume export failure', {
				resume_id: event.resume_id,
				user_id: event.user_id,
				error: event.error_message
			})
		} catch (error) {
			log.error('Failed to track resume export failure', {
				resume_id: event.resume_id,
				user_id: event.user_id,
				error: error instanceof Error ? error.message : String(error)
			})
		}
	}
})

