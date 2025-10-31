import {db} from '@/services/job/database'
import {jobs, JobStatus, processes, ProcessStatus} from '@/services/job/schema'
import type {
	ClearDatabaseResponse,
	CreateJobRequest,
	Job,
	JobResponse,
	ListJobsRequest,
	ListJobsResponse,
	NewJob,
	NewProcess,
	Process,
	ScrapeJobRequest,
	ScrapeJobResponse,
	UpdateJobRequest
} from '@/services/job/interface'
import {and, count, desc, eq, like} from 'drizzle-orm'
import {APIError} from 'encore.dev/api'
import {jobScrapeTriggered} from '@/services/job/topics'
import log from 'encore.dev/log'

/**
 * Helper function to validate if a string is a valid URL
 */
const isValidUrl = (str: string): boolean => {
	try {
		const url = new URL(str)
		return url.protocol === 'http:' || url.protocol === 'https:'
	} catch {
		return false
	}
}

/**
 * Helper function to create a new process
 */
const createProcess = async (desc: string): Promise<Process> => {
	const newProcess: NewProcess = {
		desc,
		status: ProcessStatus.Initiated
	}

	const [process] = await db.insert(processes).values(newProcess).returning()

	if (!process) {
		throw APIError.internal('Failed to create process')
	}

	return process
}

/**
 * Helper function to create a new job
 */
const createJob = async (
	jobUrl: string | undefined,
	processId: string
): Promise<Job> => {
	const newJob: NewJob = {
		title: '<UNDER_EXTRACTION>',
		company_name: '<UNDER_EXTRACTION>',
		job_url: jobUrl,
		status: JobStatus.Processing,
		process_id: processId
	}

	const [job] = await db.insert(jobs).values(newJob).returning()

	if (!job) {
		throw APIError.internal('Failed to create job')
	}

	return job
}

/**
 * Helper function to reset an existing job for re-scraping
 */
const resetJobForReScraping = async (
	jobId: string,
	processId: string
): Promise<Job> => {
	const [job] = await db
		.update(jobs)
		.set({
			title: '<UNDER_EXTRACTION>',
			company_name: '<UNDER_EXTRACTION>',
			status: JobStatus.Processing,
			process_id: processId
		})
		.where(eq(jobs.id, jobId))
		.returning()

	if (!job) {
		throw APIError.internal('Failed to reset job')
	}

	return job
}

/**
 * Helper function to publish scrape triggered event
 */
const publishScrapeEvent = async (
	jobId: string,
	processId: string,
	jobUrl?: string,
	description?: string
): Promise<void> => {
	await jobScrapeTriggered.publish({
		job_id: jobId,
		process_id: processId,
		job_url: jobUrl,
		description: description,
		triggered_at: new Date()
	})
}

/**
 * Job Service
 * Business logic for managing job postings
 */
export const JobService = {
	/**
	 * Create a new job posting
	 */
	createJob: async (params: CreateJobRequest): Promise<JobResponse> => {
		const newJob: NewJob = {
			title: params.title,
			company_name: params.company_name,
			job_url: params.job_url,
			location: params.location,
			currency: params.currency,
			salary_max: params.salary_max,
			salary_min: params.salary_min,
			requirements: params.requirements,
			description: params.description,
			responsibilities: params.responsibilities,
			benefits: params.benefits,
			status: params.status,
			process_id: params.process_id
		}

		const [job] = await db.insert(jobs).values(newJob).returning()

		if (!job) {
			throw APIError.internal('Failed to create job')
		}

		return {job}
	},

	/**
	 * Get a job by ID
	 */
	getJobById: async (id: string): Promise<Job | null> => {
		const [job] = await db.select().from(jobs).where(eq(jobs.id, id)).limit(1)
		return job || null
	},

	/**
	 * Update an existing job
	 */
	async updateJob(params: UpdateJobRequest): Promise<JobResponse> {
		const existingJob = await this.getJobById(params.id)
		if (!existingJob) {
			throw APIError.notFound(`Job with id ${params.id} not found`)
		}

		// Build update object with only provided fields
		const updateData: Partial<NewJob> = {}
		if (params.title !== undefined) updateData.title = params.title
		if (params.company_name !== undefined) updateData.company_name = params.company_name
		if (params.job_url !== undefined) updateData.job_url = params.job_url
		if (params.location !== undefined) updateData.location = params.location
		if (params.currency !== undefined) updateData.currency = params.currency
		if (params.salary_max !== undefined) updateData.salary_max = params.salary_max
		if (params.salary_min !== undefined) updateData.salary_min = params.salary_min
		if (params.requirements !== undefined) updateData.requirements = params.requirements
		if (params.description !== undefined) updateData.description = params.description
		if (params.responsibilities !== undefined) updateData.responsibilities = params.responsibilities
		if (params.benefits !== undefined) updateData.benefits = params.benefits
		if (params.status !== undefined) updateData.status = params.status
		if (params.process_id !== undefined) updateData.process_id = params.process_id

		const [job] = await db
			.update(jobs)
			.set(updateData)
			.where(eq(jobs.id, params.id))
			.returning()

		if (!job) {
			throw APIError.internal('Failed to update job')
		}

		return {job}
	},

	/**
	 * List jobs with pagination and filters
	 */
	listJobs: async (params: ListJobsRequest = {}): Promise<ListJobsResponse> => {
		const page = params.page || 1
		const page_size = Math.min(Math.max(params.page_size || 50, 1), 200)
		const offset = (page - 1) * page_size

		// Build filter conditions
		const conditions = []
		if (params.status) {
			conditions.push(eq(jobs.status, params.status))
		}
		if (params.company_name) {
			conditions.push(like(jobs.company_name, `%${params.company_name}%`))
		}
		if (params.location) {
			conditions.push(like(jobs.location, `%${params.location}%`))
		}

		// Build where clause
		const whereClause = conditions.length > 0 ? and(...conditions) : undefined

		// Fetch jobs with filters
		const jobsList = await db
			.select()
			.from(jobs)
			.where(whereClause)
			.orderBy(desc(jobs.created_at))
			.limit(page_size)
			.offset(offset)

		// Get total count
		const [totalResult] = await db
			.select({count: count()})
			.from(jobs)
			.where(whereClause)

		const total = totalResult?.count || 0
		const has_next = offset + page_size < total
		const has_prev = page > 1

		return {
			jobs: jobsList,
			page,
			page_size,
			total,
			has_next,
			has_prev
		}
	},

	/**
	 * Delete a job by ID
	 */
	async deleteJob(id: string): Promise<void> {
		const existingJob = await this.getJobById(id)
		if (!existingJob) {
			throw APIError.notFound(`Job with id ${id} not found`)
		}

		await db.delete(jobs).where(eq(jobs.id, id))
	},

	/**
	 * Scrape a job from URL or description
	 * Creates an empty job with a process and publishes scrape triggered event
	 * If a job with the same URL already exists:
	 *   - Returns existing job if not failed
	 *   - Re-initiates scraping if failed
	 */
	scrapeJob: async (params: ScrapeJobRequest): Promise<ScrapeJobResponse> => {
		if (!params.target) {
			throw APIError.invalidArgument('Target is required (URL or job description)')
		}

		// Detect if target is a URL or description
		const isUrl = isValidUrl(params.target)
		let jobUrl: string | undefined
		let description: string | undefined

		if (isUrl) {
			jobUrl = params.target

			// Check if a job with this URL already exists
			const [existingJob] = await db
				.select()
				.from(jobs)
				.where(eq(jobs.job_url, jobUrl))
				.limit(1)

			if (existingJob) {
				// If job exists and has failed, re-initiate scraping
				if (existingJob.status === JobStatus.Failure) {
					// Create new process for re-scraping
					const process = await createProcess('Job re-scraping initiated')

					// Reset job with new process
					const job = await resetJobForReScraping(existingJob.id, process.id)

					// Publish scrape event
					await publishScrapeEvent(job.id, process.id, jobUrl)

					return {job, process}
				}

				// Job exists and is not failed - return existing job with its process
				const [existingProcess] = await db
					.select()
					.from(processes)
					.where(eq(processes.id, existingJob.process_id!))
					.limit(1)

				return {
					job: existingJob,
					process: existingProcess
				}
			}
		} else {
			// Target is a description - validate minimum length
			if (params.target.length < 300) {
				throw APIError.invalidArgument(
					'Job description must be at least 300 characters long'
				)
			}
			description = params.target
		}

		// Create new job and process
		const process = await createProcess('Job scraping initiated')
		const job = await createJob(jobUrl, process.id)

		// Publish scrape triggered event
		await publishScrapeEvent(job.id, process.id, jobUrl, description)

		return {job, process}
	},

	/**
	 * Clear job service database
	 * Deletes all data from jobs and processes tables
	 *
	 * WARNING: This is a destructive operation and cannot be undone
	 */
	clearDatabase: async (): Promise<ClearDatabaseResponse> => {
		const timestamp = new Date().toISOString()
		const clearedTables: string[] = []

		log.info('Starting job database clearing operation')

		try {
			// Clear jobs table (CASCADE will delete related processes due to foreign key)
			await db.delete(jobs)
			clearedTables.push('jobs')
			log.info('Cleared jobs table')

			// Clear processes table
			await db.delete(processes)
			clearedTables.push('processes')
			log.info('Cleared processes table')

			log.info('Job database clearing operation completed', {
				cleared_tables: clearedTables,
				timestamp
			})

			return {
				success: true,
				message: `Successfully cleared ${clearedTables.length} table(s) from job database`,
				cleared_tables: clearedTables,
				timestamp
			}
		} catch (error) {
			log.error(error as Error, 'Failed to clear job database', {
				cleared_tables: clearedTables,
				timestamp
			})
			throw error
		}
	}
}

