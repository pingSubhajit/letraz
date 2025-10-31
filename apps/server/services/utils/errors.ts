import {APIError} from 'encore.dev/api'
import {DrizzleError, DrizzleQueryError} from 'drizzle-orm/errors'
import type {DatabaseError} from 'pg'
import {addBreadcrumb, captureException, initializeSentry} from './sentry'

// Initialize Sentry on module load
initializeSentry()

/**
 * Translate Drizzle/node-postgres errors into Encore APIError.
 * Returns null if the error is not recognized as a database constraint error.
 */
const translateDatabaseError = (err: unknown): APIError | null => {
	// If it's a DrizzleQueryError, it should wrap the underlying driver error in cause
	if (err instanceof DrizzleQueryError) {
		const cause = (err as unknown as {cause?: unknown}).cause
		const apiErr = mapPgDatabaseError(cause)
		if (apiErr) return apiErr
	}

	// Some code paths may throw the raw pg DatabaseError
	const apiErr = mapPgDatabaseError(err)
	if (apiErr) return apiErr

	// Other Drizzle errors that are not query errors (typically programming mistakes)
	if (err instanceof DrizzleError) {
		return APIError.internal('Database operation failed')
	}

	return null
}

const mapPgDatabaseError = (err: unknown): APIError | null => {
	const dbErr = err as Partial<DatabaseError> & {code?: string; constraint?: string; detail?: string}
	if (!dbErr || typeof dbErr !== 'object' || !('code' in dbErr)) return null

	switch (dbErr.code) {
		// unique_violation
		case '23505':
			return APIError.alreadyExists('Resource already exists')
		// not_null_violation
		case '23502':
			return APIError.invalidArgument('Missing required field')
		// foreign_key_violation
		case '23503':
			return APIError.failedPrecondition('Related record not found')
		// check_violation
		case '23514':
			return APIError.invalidArgument('Failed validation')
		// string_data_right_truncation (length exceeds limit)
		case '22001':
			return APIError.invalidArgument('Value exceeds allowed length')
		default:
			return APIError.internal('Database error')
	}
}

export const handleError = (err: unknown, traceId: string): APIError => {
	// Add breadcrumb for error occurrence
	addBreadcrumb('Error occurred', {trace_id: traceId}, 'error', 'error')

	// Try to translate database errors to user-friendly API errors
	const translated = translateDatabaseError(err)
	if (translated instanceof APIError) {
		/*
		 * For translated database errors, we don't need to report to Sentry
		 * as these are expected constraint violations
		 */
		throw translated.withDetails({
			traceId
		})
	}

	// For unexpected errors, capture in Sentry with full context
	captureException(err, {
		tags: {
			'error-id': traceId,
			'error-type': 'unhandled',
			'error-source': 'middleware'
		},
		extra: {
			trace_id: traceId,
			error_message: err instanceof Error ? err.message : String(err),
			error_stack: err instanceof Error ? err.stack : undefined
		},
		level: 'error'
	})

	// Return generic error to client
	throw APIError.internal('Something went wrong').withDetails({
		traceId
	})
}
