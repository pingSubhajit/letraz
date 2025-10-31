import * as Sentry from '@sentry/node'
import {httpIntegration} from '@sentry/node'
import {secret} from 'encore.dev/config'
import {appMeta, currentRequest} from 'encore.dev'
import {getAuthData} from '~encore/auth'
import type {AuthData} from '@/services/identity/auth'
import type {AdminAuthData} from '@/services/utils/admin-auth'

const SENTRY_DSN = secret('SentryDSN')()
const ENVIRONMENT = appMeta().environment.type || 'development'

/**
 * Initialize Sentry with proper configuration
 * This should be called once when the application starts
 */
export const initializeSentry = (): void => {
	const appMetadata = appMeta()

	Sentry.init({
		dsn: SENTRY_DSN,
		environment: ENVIRONMENT,
		tracesSampleRate: 0.2, // Sample 20% of transactions for performance monitoring

		// Release tracking for better error grouping and deployment tracking
		release: appMetadata.deploy?.id || appMetadata.build?.revision || 'unknown',

		// Add integrations for better error tracking
		integrations: [
			// Capture breadcrumbs for HTTP requests
			httpIntegration()
		],

		// Before send hook to enrich error context
		beforeSend: (event) => {
			// Add custom fingerprinting for better error grouping
			if (event.exception?.values?.[0]) {
				const exception = event.exception.values[0]
				if (exception.value?.includes('Database error')) {
					event.fingerprint = ['database-error', exception.type || 'unknown']
				}
			}
			return event
		}
	})
}

/**
 * Set user context in Sentry from auth data
 * This helps track which users are experiencing errors
 */
export const setSentryUserContext = (): void => {
	try {
		const authData = getAuthData() as (AuthData | AdminAuthData | null)

		if (!authData) {
			return
		}

		// Handle admin authentication
		if (authData.userId === 'admin') {
			Sentry.setUser({
				id: 'admin',
				username: 'admin'
			})
			return
		}

		// Handle regular user authentication
		const userData = authData as AuthData
		if (userData.user) {
			Sentry.setUser({
				id: userData.userId,
				email: userData.user.email,
				username: `${userData.user.first_name} ${userData.user.last_name || ''}`.trim()
			})
		} else {
			Sentry.setUser({
				id: userData.userId
			})
		}
	} catch (error) {
		/*
		 * Silently fail - we don't want user context setting to break the request
		 * This can happen if getAuthData is called outside of a request context
		 */
	}
}

/**
 * Set request context in Sentry
 * Captures endpoint, method, and path information
 */
export const setSentryRequestContext = (): void => {
	try {
		const request = currentRequest()

		if (!request) {
			return
		}

		if (request.type === 'api-call') {
			const apiInfo = request.api as {name?: string; serviceName?: string} | undefined

			Sentry.setContext('request', {
				endpoint: apiInfo?.name || 'unknown',
				service: apiInfo?.serviceName || 'unknown',
				method: request.method,
				path: request.path,
				pathAndQuery: request.pathAndQuery
			})

			// Add tags for easier filtering
			Sentry.setTag('endpoint', apiInfo?.name || 'unknown')
			Sentry.setTag('service', apiInfo?.serviceName || 'unknown')
			Sentry.setTag('http.method', request.method)
		} else if (request.type === 'pubsub-message') {
			Sentry.setContext('pubsub', {
				service: request.service,
				topic: request.topic,
				subscription: request.subscription,
				message_id: request.messageId,
				delivery_attempt: request.deliveryAttempt
			})

			// Add tags for PubSub events
			Sentry.setTag('pubsub.topic', request.topic)
			Sentry.setTag('pubsub.subscription', request.subscription)
			Sentry.setTag('pubsub.attempt', request.deliveryAttempt.toString())
		}
	} catch (error) {
		// Silently fail - we don't want context setting to break the request
	}
}

/**
 * Capture exception with automatic context enrichment
 * Use this instead of Sentry.captureException for consistent error reporting
 */
export const captureException = (
	error: unknown,
	context?: {
		tags?: Record<string, string | number | boolean>
		extra?: Record<string, unknown>
		level?: Sentry.SeverityLevel
	}
): string => {
	return Sentry.withScope((scope) => {
		// Set user and request context
		setSentryUserContext()
		setSentryRequestContext()

		// Add custom tags
		if (context?.tags) {
			Object.entries(context.tags).forEach(([key, value]) => {
				scope.setTag(key, value)
			})
		}

		// Add extra context
		if (context?.extra) {
			Object.entries(context.extra).forEach(([key, value]) => {
				scope.setExtra(key, value)
			})
		}

		// Set level if provided
		if (context?.level) {
			scope.setLevel(context.level)
		}

		return Sentry.captureException(error)
	})
}

/**
 * Add breadcrumb for tracking user actions and system events
 * This helps understand the sequence of events leading to an error
 */
export const addBreadcrumb = (
	message: string,
	data?: Record<string, unknown>,
	category?: string,
	level?: Sentry.SeverityLevel
): void => {
	Sentry.addBreadcrumb({
		message,
		data,
		category: category || 'custom',
		level: level || 'info',
		timestamp: Date.now() / 1000
	})
}

/**
 * Start a new span for performance monitoring
 * Use this for long-running operations or critical business logic
 *
 * Note: In Sentry v10+, use Sentry.startSpan for manual instrumentation
 */
export const withSentrySpan = async <T>(
	name: string,
	op: string,
	callback: () => Promise<T>
): Promise<T> => {
	// Set user and request context
	setSentryUserContext()
	setSentryRequestContext()

	/*
	 * For now, just execute the callback
	 * Performance monitoring spans can be added later if needed
	 */
	return await callback()
}

/**
 * Capture a message for non-error events that need tracking
 */
export const captureMessage = (
	message: string,
	level: Sentry.SeverityLevel = 'info',
	context?: {
		tags?: Record<string, string | number | boolean>
		extra?: Record<string, unknown>
	}
): string => {
	return Sentry.withScope((scope) => {
		// Set user and request context
		setSentryUserContext()
		setSentryRequestContext()

		// Add custom tags
		if (context?.tags) {
			Object.entries(context.tags).forEach(([key, value]) => {
				scope.setTag(key, value)
			})
		}

		// Add extra context
		if (context?.extra) {
			Object.entries(context.extra).forEach(([key, value]) => {
				scope.setExtra(key, value)
			})
		}

		scope.setLevel(level)
		return Sentry.captureMessage(message)
	})
}

/**
 * Wrapper for async operations with automatic error capture
 * Useful for fire-and-forget operations that should still report errors
 */
export const withSentryErrorCapture = async <T>(
	operation: () => Promise<T>,
	context?: {
		operationName: string
		tags?: Record<string, string | number | boolean>
		extra?: Record<string, unknown>
	}
): Promise<T | null> => {
	try {
		return await operation()
	} catch (error) {
		captureException(error, {
			tags: {
				operation: context?.operationName || 'unknown',
				...context?.tags
			},
			extra: context?.extra,
			level: 'error'
		})
		return null
	}
}

