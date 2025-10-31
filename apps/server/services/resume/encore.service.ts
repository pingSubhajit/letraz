import {Service} from 'encore.dev/service'
import {adminPathMiddleware} from '@/services/utils/admin-middleware'
import {errorHandlingMiddleware} from '@/services/utils/middleware'

/**
 * Resume Service
 * Manages user resumes, sections, and all related resume data
 *
 * Middlewares:
 * - errorHandlingMiddleware: Global error handling with Sentry reporting
 * - adminPathMiddleware: Enforces admin API key for /admin/* paths
 */
export default new Service('resume', {
	middlewares: [errorHandlingMiddleware, adminPathMiddleware]
})
