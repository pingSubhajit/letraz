import {Service} from 'encore.dev/service'
import {errorHandlingMiddleware} from '@/services/utils/middleware'

/**
 * Utilities Service
 * Provides shared utilities, middleware, and the global gateway
 * that other services depend on.
 */
export default new Service('utilities', {
	middlewares: [errorHandlingMiddleware]
})
