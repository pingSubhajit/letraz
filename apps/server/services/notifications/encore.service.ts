import {Service} from 'encore.dev/service'
import {adminPathMiddleware} from '@/services/utils/admin-middleware'
import {errorHandlingMiddleware} from '@/services/utils/middleware'

/**
 * Notifications Service
 * Uses shared error handling middleware from services/utils/middleware.ts
 * Authentication is handled globally via the gateway in services/utils/gateway.ts
 *
 * Middlewares:
 * - errorHandlingMiddleware: Global error handling with Sentry reporting
 * - adminPathMiddleware: Enforces admin API key for /admin/* paths
 */
export default new Service('notifications', {
	middlewares: [errorHandlingMiddleware, adminPathMiddleware]
})


