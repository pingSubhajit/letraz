import {api} from 'encore.dev/api'
import {AnalyticsService} from '@/services/analytics/service'
import {ResumeAnalyticsParams, ResumeAnalyticsResponse} from '@/services/analytics/interface'

/**
 * ==========================================
 * ADMIN ENDPOINTS
 * ==========================================
 */

/**
 * Get Resume Analytics (Admin)
 * Checks if a 'resume_opened' event with status='success' exists for the given resume ID
 * Requires x-admin-api-key header for authentication
 *
 * GET /admin/analytics/resume/:id
 */
export const getResumeAnalytics = api(
	{method: 'GET', path: '/admin/analytics/resume/:id', auth: true, expose: true},
	async (params: ResumeAnalyticsParams): Promise<ResumeAnalyticsResponse> => {
		return AnalyticsService.getResumeAnalytics(params)
	}
)

