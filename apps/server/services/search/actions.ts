import {Subscription} from 'encore.dev/pubsub'
import log from 'encore.dev/log'
import {resumeUpdated} from '@/services/resume/topics'
import {AlgoliaService} from '@/services/search/algolia'
import {addBreadcrumb, captureException} from '@/services/utils/sentry'

/**
 * Resume Updated Listener
 * Subscribes to resume update events and indexes changes in Algolia
 *
 * Process:
 * 1. Receives resumeUpdated event with change metadata
 * 2. Determines indexing action based on change type
 * 3. Updates Algolia search index
 *
 * This enables real-time search updates as users modify their resumes.
 */
const resumeUpdatedListener = new Subscription(resumeUpdated, 'index-resume-in-algolia', {
	handler: async event => {
		try {
			addBreadcrumb('Processing resume update for search indexing', {
				resume_id: event.resume_id,
				user_id: event.user_id,
				change_type: event.change_type
			}, 'pubsub')

			log.info('Processing resume update for search indexing', {
				resume_id: event.resume_id,
				user_id: event.user_id,
				change_type: event.change_type
			})

			await AlgoliaService.indexResume(event)

			log.info('Resume indexed successfully', {
				resume_id: event.resume_id,
				change_type: event.change_type
			})
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Unknown error'

			log.error(err as Error, 'Failed to index resume in Algolia', {
				resume_id: event.resume_id,
				user_id: event.user_id,
				change_type: event.change_type,
				error: errorMessage
			})

			// Report to Sentry for monitoring
			captureException(err, {
				tags: {
					operation: 'algolia-indexing',
					resume_id: event.resume_id,
					change_type: event.change_type
				},
				extra: {
					user_id: event.user_id,
					event
				},
				level: 'warning' // Warning since it's fire-and-forget with retries
			})

			/*
			 * Fire and forget - indexing failures don't block resume operations
			 * Algolia has built-in retry mechanisms and eventual consistency
			 */
		}
	}
})

