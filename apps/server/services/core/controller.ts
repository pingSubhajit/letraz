import {appMeta} from 'encore.dev'
import {api} from 'encore.dev/api'
import {
	AddToWaitlistParams,
	AllWaitlistParams,
	AllWaitlistResponse,
	BulkUpdateWaitlistParams,
	BulkUpdateWaitlistResponse,
	ClearDatabaseResponse,
	Country,
	CreateCountryParams,
	GetCountryParams,
	HealthCheckResponse,
	ListCountriesParams,
	ListCountriesResponse,
	RemoveFromWaitlistParams,
	SeedCountriesResponse,
	SeedWaitlistParams,
	SeedWaitlistResponse,
	SubmitUserFeedbackParams,
	SubmitUserFeedbackResponse,
	SyncWaitlistToLoopsResponse,
	UpdateWaitlistParams,
	WaitlistResponse
} from '@/services/core/interface'
import {CoreService} from '@/services/core/service'

/**
 * Core service health check. Returns the operational status and deployment
 * metadata for this service instance, including a status indicator,
 * deployment ID, timestamp, and service name. Publicly exposed at
 * GET /core/health.
 */
export const healthCheck = api({
	method: 'GET', path: '/core/health', expose: true
}, async (): Promise<HealthCheckResponse> => {
	return {
		status: 'OPERATIONAL',
		instance_id: appMeta().deploy.id,
		timestamp: new Date().toISOString(),
		service: 'core'
	}
})

/**
 * Adds a user to the early access waitlist. Accepts an email and optional
 * referrer and returns the created waitlist record with queue position and
 * access status. Publicly exposed at POST /waitlist.
 */
export const addToWaitlist = api({
	method: 'POST', path: '/waitlist', expose: true
}, async (params: AddToWaitlistParams): Promise<WaitlistResponse> => {
	return CoreService.addToWaitlist(params)
})

/**
 * Lists waitlist entries with pagination. Supports page, page_size, and
 * order (asc|desc). Returns a paginated collection with metadata including
 * total, has_next, and has_prev.
 *
 * Admin endpoint - requires x-admin-api-key header for authentication.
 * Accessible at GET /admin/waitlist
 */
export const getAllWaitlist = api({
	method: 'GET', path: '/admin/waitlist', auth: true, expose: true
}, async (params: AllWaitlistParams): Promise<AllWaitlistResponse> => {
	return CoreService.getAllWaitlist(params)
})

/**
 * Update a waitlist entry by ID
 * Allows updating the has_access field. When has_access changes from false to true,
 * emits a waitlist-access-granted event that triggers the welcome-flow workflow.
 *
 * Admin endpoint - requires x-admin-api-key header for authentication.
 * Accessible at POST /admin/waitlist/:id
 */
export const updateWaitlist = api({
	method: 'POST', path: '/admin/waitlist/:id', auth: true, expose: true
}, async (params: UpdateWaitlistParams): Promise<WaitlistResponse> => {
	return CoreService.updateWaitlist(params)
})

/**
 * Bulk update waitlist entries
 * Updates multiple waitlist entries at once. Validates that all IDs exist before updating.
 * When has_access changes from false to true, emits waitlist-access-granted events
 * for each affected entry that triggers the welcome-flow workflow.
 *
 * Admin endpoint - requires x-admin-api-key header for authentication.
 * Accessible at POST /admin/waitlist/bulk-update
 */
export const bulkUpdateWaitlist = api({
	method: 'POST', path: '/admin/waitlist/bulk-update', auth: true, expose: true
}, async (params: BulkUpdateWaitlistParams): Promise<BulkUpdateWaitlistResponse> => {
	return CoreService.bulkUpdateWaitlist(params)
})

/**
 * Removes a user from the waitlist. Accepts an email and returns a success message.
 * Publicly exposed at DELETE /waitlist/:email.
 */
export const removeFromWaitlist = api({
	method: 'DELETE', path: '/waitlist/:email'
}, async ({email}: RemoveFromWaitlistParams): Promise<void> => {
	return CoreService.removeFromWaitlist(email)
})

/**
 * Get a country by its ISO 3166-1 alpha-3 code.
 * Internal API for use by other services.
 * Accessible at GET /core/country/:code
 */
export const getCountry = api({
	method: 'GET', path: '/core/country/:code'
}, async ({code}: GetCountryParams): Promise<Country> => {
	return CoreService.getCountry(code)
})

/**
 * List countries with pagination and optional search.
 * Supports page, page_size, and search query parameters.
 * Internal API for use by other services.
 * Accessible at GET /core/countries
 */
export const listCountries = api({
	method: 'GET', path: '/core/countries'
}, async (params: ListCountriesParams): Promise<ListCountriesResponse> => {
	return CoreService.listCountries(params)
})

/**
 * Create a new country (internal/admin only).
 * Internal API for administrative purposes.
 * Accessible at POST /core/country
 */
export const createCountry = api({
	method: 'POST', path: '/core/country'
}, async (params: CreateCountryParams): Promise<Country> => {
	return CoreService.createCountry(params)
})

/**
 * Seed countries from REST Countries API.
 * Fetches all countries and upserts them into the database.
 * Admin endpoint - requires x-admin-api-key header for authentication.
 * Accessible at POST /admin/countries/seed
 */
export const seedCountries = api({
	method: 'POST', path: '/admin/countries/seed', auth: true, expose: true
}, async (): Promise<SeedCountriesResponse> => {
	return CoreService.seedCountries()
})

/**
 * Seed waitlist entries from Django migration.
 * Accepts an array of waitlist entries and upserts them into the database.
 * Idempotent operation - existing entries are skipped.
 * Does not publish waitlist-submitted events (for migration purposes only).
 * Admin endpoint - requires x-admin-api-key header for authentication.
 * Accessible at POST /admin/waitlist/seed
 */
export const seedWaitlist = api({
	method: 'POST', path: '/admin/waitlist/seed', auth: true, expose: true
}, async (params: SeedWaitlistParams): Promise<SeedWaitlistResponse> => {
	return CoreService.seedWaitlist(params)
})

/**
 * Sync waitlist entries to Loops (async operation).
 * Triggers a background job that fetches all waitlist entries and syncs them to Loops
 * as audience contacts. For each entry, queries PostHog to get the person ID and name
 * information, then creates/updates the contact in Loops with the mailing list subscriptions.
 *
 * This operation:
 * - Returns immediately with a queued status (no timeout risk)
 * - Processes entries in batches of 50 with parallel API calls
 * - Is idempotent - existing contacts in Loops will be updated without duplicates
 * - Logs detailed progress and results for monitoring
 *
 * Check application logs to monitor sync progress and see results.
 *
 * Admin endpoint - requires x-admin-api-key header for authentication.
 * Accessible at POST /admin/waitlist/sync-to-loops
 */
export const syncWaitlistToLoops = api({
	method: 'POST', path: '/admin/waitlist/sync-to-loops', auth: true, expose: true
}, async (): Promise<SyncWaitlistToLoopsResponse> => {
	return CoreService.syncWaitlistToLoops()
})

/**
 * Submit user feedback.
 * Accepts an optional subject line and required feedback message from authenticated users.
 * Publishes the feedback to a topic with user details including name, email, and ID.
 * Returns a success response upon completion.
 *
 * Requires authentication - user must be logged in.
 * Accessible at POST /feedback
 */
export const submitUserFeedback = api({
	method: 'POST', path: '/feedback', auth: true, expose: true
}, async (params: SubmitUserFeedbackParams): Promise<SubmitUserFeedbackResponse> => {
	return CoreService.submitUserFeedback(params)
})

/**
 * Clear core service database.
 * Deletes all data from feedback table.
 * Preserves waitlist and countries tables.
 *
 * Internal endpoint for use by admin service.
 * Accessible at DELETE /core/database/clear
 *
 * WARNING: This is a destructive operation and cannot be undone
 */
export const clearDatabase = api({
	method: 'DELETE', path: '/core/database/clear'
}, async (): Promise<ClearDatabaseResponse> => {
	return CoreService.clearDatabase()
})
