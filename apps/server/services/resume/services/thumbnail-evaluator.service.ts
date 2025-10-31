import {
	ResumeUpdatedEvent,
	thumbnailGenerationTriggered,
	ThumbnailGenerationTriggeredEvent
} from '@/services/resume/topics'
import log from 'encore.dev/log'

/**
 * Thumbnail Generation Configuration
 * Defines scoring rules and thresholds for thumbnail regeneration
 */
const THUMBNAIL_CONFIG = {
	// Score threshold - regenerate if score >= this value
	REGENERATION_THRESHOLD: 10,

	// Score values for different change types
	SCORES: {
		// Structural changes (high impact)
		section_added: 15,
		section_removed: 15,
		section_reordered: 10,
		bulk_replace: 20,

		// Field-level changes (medium-high impact)
		section_updated_major: 8,
		section_updated_minor: 2,

		// No thumbnail regeneration needed
		resume_deleted: 0,
		thumbnail_updated: 0
	},

	// Major fields that significantly affect resume appearance
	MAJOR_FIELDS: [
		// Education
		'institution_name',
		'degree',
		'field_of_study',
		'country_code',

		// Experience
		'company_name',
		'job_title',
		'employment_type',
		'city',

		// Project
		'title',
		'project_url',

		// Certification
		'title',
		'issuing_organization',

		// Skill
		'skill_id',
		'level'
	],

	// Minor fields (less visual impact)
	MINOR_FIELDS: ['description', 'started_from_month', 'started_from_year', 'finished_at_month', 'finished_at_year']
}

/**
 * Thumbnail Evaluator Service
 * Stateless service that evaluates resume changes and determines if thumbnail regeneration is needed
 */
export const ThumbnailEvaluatorService = {
	/**
	 * Calculate significance score for a resume change
	 * Higher score = more significant change
	 *
	 * @param event - Resume updated event with change metadata
	 * @returns Significance score
	 */
	calculateChangeScore: (event: ResumeUpdatedEvent): number => {
		const {change_type, changed_fields} = event

		// Structural changes have fixed scores
		if (change_type === 'section_added') return THUMBNAIL_CONFIG.SCORES.section_added
		if (change_type === 'section_removed') return THUMBNAIL_CONFIG.SCORES.section_removed
		if (change_type === 'section_reordered') return THUMBNAIL_CONFIG.SCORES.section_reordered
		if (change_type === 'bulk_replace') return THUMBNAIL_CONFIG.SCORES.bulk_replace
		if (change_type === 'resume_deleted') return THUMBNAIL_CONFIG.SCORES.resume_deleted
		if (change_type === 'thumbnail_updated') return THUMBNAIL_CONFIG.SCORES.thumbnail_updated

		// For section updates, analyze which fields changed
		if (change_type === 'section_updated' && changed_fields && changed_fields.length > 0) {
			// Check if any major fields were changed
			const hasMajorChange = changed_fields.some(field => THUMBNAIL_CONFIG.MAJOR_FIELDS.includes(field))

			if (hasMajorChange) {
				return THUMBNAIL_CONFIG.SCORES.section_updated_major
			} else {
				return THUMBNAIL_CONFIG.SCORES.section_updated_minor
			}
		}

		// Default to minor change score
		return THUMBNAIL_CONFIG.SCORES.section_updated_minor
	},

	/**
	 * Evaluate if thumbnail regeneration should be triggered
	 *
	 * @param event - Resume updated event
	 * @returns Object with shouldTrigger flag and score
	 */
	evaluateRegeneration(event: ResumeUpdatedEvent): {shouldTrigger: boolean; score: number; reason: string} {
		const score = this.calculateChangeScore(event)

		const shouldTrigger = score >= THUMBNAIL_CONFIG.REGENERATION_THRESHOLD

		let reason = ''
		if (shouldTrigger) {
			reason = `Change score (${score}) exceeded threshold (${THUMBNAIL_CONFIG.REGENERATION_THRESHOLD}). `
			reason += `Change type: ${event.change_type}`
			if (event.section_type) {
				reason += `, Section: ${event.section_type}`
			}
			if (event.changed_fields && event.changed_fields.length > 0) {
				reason += `, Fields: ${event.changed_fields.join(', ')}`
			}
		}

		return {
			shouldTrigger,
			score,
			reason
		}
	},

	/**
	 * Trigger thumbnail generation
	 * Publishes thumbnailGenerationTriggered event
	 * Generates a unique process ID for event tracking (not stored in database)
	 *
	 * @param event - Original resume updated event
	 * @param score - Calculated significance score
	 * @param reason - Human-readable reason for triggering
	 */
	triggerThumbnailGeneration: async (event: ResumeUpdatedEvent, score: number, reason: string): Promise<void> => {
		const triggerEvent: ThumbnailGenerationTriggeredEvent = {
			resume_id: event.resume_id,
			user_id: event.user_id,
			reason,
			change_score: score,
			timestamp: new Date()
		}

		log.info('Triggering thumbnail generation', {
			resume_id: event.resume_id,
			score,
			reason,
			change_type: event.change_type
		})

		await thumbnailGenerationTriggered.publish(triggerEvent)
	},

	/**
	 * Process resume update event
	 * Main entry point for evaluation logic
	 *
	 * @param event - Resume updated event from subscription
	 */
	async processResumeUpdate(event: ResumeUpdatedEvent): Promise<void> {
		log.info('Evaluating resume change for thumbnail regeneration', {
			resume_id: event.resume_id,
			change_type: event.change_type,
			section_type: event.section_type
		})

		const evaluation = this.evaluateRegeneration(event)

		if (evaluation.shouldTrigger) {
			await this.triggerThumbnailGeneration(event, evaluation.score, evaluation.reason)
		} else {
			log.info('Change score below threshold, skipping thumbnail regeneration', {
				resume_id: event.resume_id,
				score: evaluation.score,
				threshold: THUMBNAIL_CONFIG.REGENERATION_THRESHOLD
			})
		}
	}
}

