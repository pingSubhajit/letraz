import {Topic} from 'encore.dev/pubsub'

/**
 * Resume Tailoring Triggered Event
 * Published when a resume tailoring process is initiated
 */
export interface ResumeTailoringTriggeredEvent {
	resume_id: string
	job_id: string
	process_id: string
	user_id: string
	job_url?: string
	triggered_at: Date
}

/**
 * Resume Tailoring Triggered Topic
 */
export const resumeTailoringTriggered = new Topic<ResumeTailoringTriggeredEvent>('resume-tailoring-triggered', {
	deliveryGuarantee: 'at-least-once'
})

/**
 * Resume Tailoring Failed Event
 * Published when a resume tailoring process fails
 */
export interface ResumeTailoringFailedEvent {
	resume_id: string
	job_id: string
	process_id: string
	user_id: string
	error_message: string
	failed_at: Date
}

/**
 * Resume Tailoring Failed Topic
 */
export const resumeTailoringFailed = new Topic<ResumeTailoringFailedEvent>('resume-tailoring-failed', {
	deliveryGuarantee: 'at-least-once'
})

/**
 * Resume Tailoring Success Event
 * Published when a resume tailoring process completes successfully
 */
export interface ResumeTailoringSuccessEvent {
	resume_id: string
	job_id: string
	process_id: string
	user_id: string
	completed_at: Date
}

/**
 * Resume Tailoring Success Topic
 */
export const resumeTailoringSuccess = new Topic<ResumeTailoringSuccessEvent>('resume-tailoring-success', {
	deliveryGuarantee: 'at-least-once'
})

/**
 * Resume Change Type Enum
 * Describes the type of change made to a resume
 */
export type ResumeChangeType =
	| 'section_added'
	| 'section_removed'
	| 'section_updated'
	| 'section_reordered'
	| 'bulk_replace'
	| 'resume_deleted'
	| 'thumbnail_updated'

/**
 * Resume Section Type for events
 */
export type ResumeSectionTypeEvent = 'Education' | 'Experience' | 'Skill' | 'Project' | 'Certification'

/**
 * Resume Updated Event
 * Published whenever a resume or its sections are modified
 * Used by thumbnail generation evaluator to determine if regeneration is needed
 */
export interface ResumeUpdatedEvent {
	resume_id: string
	user_id: string
	change_type: ResumeChangeType
	section_type?: ResumeSectionTypeEvent
	section_id?: string
	changed_fields?: string[] // e.g., ['job_title', 'company_name']
	metadata?: Record<string, any> // Additional context
	timestamp: Date
}

/**
 * Resume Updated Topic
 */
export const resumeUpdated = new Topic<ResumeUpdatedEvent>('resume-updated', {
	deliveryGuarantee: 'at-least-once'
})

/**
 * Thumbnail Generation Triggered Event
 * Published when thumbnail regeneration is needed based on change significance
 */
export interface ThumbnailGenerationTriggeredEvent {
	resume_id: string
	user_id: string
	reason: string // Why regeneration was triggered
	change_score: number // The score that triggered regeneration
	timestamp: Date
}

/**
 * Thumbnail Generation Triggered Topic
 */
export const thumbnailGenerationTriggered = new Topic<ThumbnailGenerationTriggeredEvent>(
	'thumbnail-generation-triggered',
	{
		deliveryGuarantee: 'at-least-once'
	}
)

/**
 * Resume Export Success Event
 * Published when resume export completes successfully
 */
export interface ResumeExportSuccessEvent {
	resume_id: string
	user_id: string
	exported_at: Date
}

/**
 * Resume Export Success Topic
 */
export const resumeExportSuccess = new Topic<ResumeExportSuccessEvent>('resume-export-success', {
	deliveryGuarantee: 'at-least-once'
})

/**
 * Resume Export Failed Event
 * Published when resume export fails
 */
export interface ResumeExportFailedEvent {
	resume_id: string
	user_id: string
	error_message: string
	failed_at: Date
}

/**
 * Resume Export Failed Topic
 */
export const resumeExportFailed = new Topic<ResumeExportFailedEvent>('resume-export-failed', {
	deliveryGuarantee: 'at-least-once'
})
