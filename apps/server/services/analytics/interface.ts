/**
 * Admin endpoint interfaces
 */

/**
 * Check Resume Opened Request
 * Path parameter for resume ID
 */
export interface ResumeAnalyticsParams {
	id: string
}

/**
 * Check Resume Opened Response
 * Indicates if a resume_opened event with success status exists
 */
export interface ResumeAnalyticsResponse {
	resume_opened: boolean
}

