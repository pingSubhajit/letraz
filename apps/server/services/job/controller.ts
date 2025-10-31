import {api, Query} from 'encore.dev/api'
import {JobService} from '@/services/job/service'
import type {
	ClearDatabaseResponse,
	CreateJobRequest,
	DeleteJobRequest,
	DeleteJobResponse,
	JobResponse,
	ListJobsRequest,
	ListJobsResponse,
	ScrapeJobRequest,
	ScrapeJobResponse,
	UpdateJobRequest
} from '@/services/job/interface'

/**
 * Job Controller
 * API endpoints for job management
 */

/**
 * Create a new job posting
 */
export const createJob = api(
	{method: 'POST', path: '/job/create', auth: true},
	async (params: CreateJobRequest): Promise<JobResponse> => {
		return await JobService.createJob(params)
	}
)

/**
 * Get a job by ID
 */
export const getJob = api(
	{method: 'GET', path: '/job/:id', expose: true},
	async (params: {id: string}): Promise<JobResponse> => {
		const job = await JobService.getJobById(params.id)
		if (!job) {
			throw new Error(`Job with id ${params.id} not found`)
		}
		return {job}
	}
)

/**
 * Update an existing job
 */
export const updateJob = api(
	{method: 'PUT', path: '/job/update'},
	async (params: UpdateJobRequest): Promise<JobResponse> => {
		return await JobService.updateJob(params)
	}
)

/**
 * List jobs with pagination and filters
 */
export const listJobs = api(
	{method: 'GET', path: '/job/list'},
	async (params: {
		page?: Query<number>;
		page_size?: Query<number>;
		status?: Query<string>;
		company_name?: Query<string>;
		location?: Query<string>;
	}): Promise<ListJobsResponse> => {
		const request: ListJobsRequest = {
			page: params.page,
			page_size: params.page_size,
			status: params.status as any,
			company_name: params.company_name,
			location: params.location
		}
		return await JobService.listJobs(request)
	}
)

/**
 * Delete a job by ID
 */
export const deleteJob = api(
	{method: 'DELETE', path: '/job/:id'},
	async (params: DeleteJobRequest): Promise<DeleteJobResponse> => {
		await JobService.deleteJob(params.id)
		return {
			success: true,
			message: `Job ${params.id} deleted successfully`
		}
	}
)

/**
 * Scrape a job from URL
 * Creates an empty job, initiates a process, and triggers scraping
 */
export const scrapeJob = api(
	{method: 'POST', path: '/job/scrape', auth: true},
	async (params: ScrapeJobRequest): Promise<ScrapeJobResponse> => {
		return await JobService.scrapeJob(params)
	}
)

/**
 * Clear job service database.
 * Deletes all data from jobs and processes tables.
 *
 * Internal endpoint for use by admin service.
 * Accessible at DELETE /job/database/clear
 *
 * WARNING: This is a destructive operation and cannot be undone
 */
export const clearDatabase = api({
	method: 'DELETE', path: '/job/database/clear'
}, async (): Promise<ClearDatabaseResponse> => {
	return JobService.clearDatabase()
})
