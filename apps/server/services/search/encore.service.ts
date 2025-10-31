import {Service} from 'encore.dev/service'
import {errorHandlingMiddleware} from '@/services/utils/middleware'

/**
 * Search Service
 * Handles search indexing and search-related operations
 * - Algolia integration for resume search
 * - Real-time index updates via event subscriptions
 *
 * Middlewares:
 * - errorHandlingMiddleware: Global error handling with Sentry reporting
 */
export default new Service('search', {
	middlewares: [errorHandlingMiddleware]
})

