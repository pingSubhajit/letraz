import {Subscription} from 'encore.dev/pubsub'
import log from 'encore.dev/log'
import {jobScrapeFailed, jobScrapeSuccess, jobScrapeTriggered} from '@/services/job/topics'
import {db} from '@/services/job/database'
import {jobs, JobStatus, processes, ProcessStatus} from '@/services/job/schema'
import {eq} from 'drizzle-orm'
import {JobExtractor} from './services/job-extractor'

const jobScrapeTriggeredEventListener = new Subscription(jobScrapeTriggered, 'extract-job-details', {
	handler: async (event) => {
		const jobExtractor = new JobExtractor()

		try {
			log.info('Starting job extraction', {
				job_id: event.job_id,
				process_id: event.process_id,
				job_url: event.job_url,
				hasDescription: !!event.description,
				descriptionLength: event.description?.length
			})

			let extractedJobData

			// Check if we have a description instead of a URL
			if (event.description && !event.job_url) {
				// Direct LLM processing for description strings
				log.info('Processing job description directly with LLM', {
					job_id: event.job_id,
					descriptionLength: event.description.length
				})
				extractedJobData = await jobExtractor.extractJobFromDescription(event.description)
			} else if (event.job_url) {
				// URL-based extraction using scraping
				log.info('Processing job URL with scraping', {
					job_id: event.job_id,
					job_url: event.job_url
				})
				extractedJobData = await jobExtractor.extractJob(event.job_url, {
					timeout: 60000, // 60 seconds timeout
					retries: 2
				})
			} else {
				throw new Error('Either job URL or description must be provided')
			}

			// Prepare job data for database update
			const jobData = {
				title: extractedJobData.title,
				company_name: extractedJobData.company_name,
				location: extractedJobData.location || null,
				currency: extractedJobData.currency || null,
				salary_min: extractedJobData.salary_min || null,
				salary_max: extractedJobData.salary_max || null,
				requirements: extractedJobData.requirements || [],
				description: extractedJobData.description || null,
				responsibilities: extractedJobData.responsibilities || [],
				benefits: extractedJobData.benefits || [],
				status: JobStatus.Success
			}

			// Update job with extracted data
			await db
				.update(jobs)
				.set(jobData)
				.where(eq(jobs.id, event.job_id))

			// Update process status to Success
			await db
				.update(processes)
				.set({
					status: ProcessStatus.Success,
					status_details: 'Job extraction completed successfully',
					desc: 'Job extraction completed'
				})
				.where(eq(processes.id, event.process_id))

			// Publish job scrape success event
			await jobScrapeSuccess.publish({
				job_id: event.job_id,
				process_id: event.process_id,
				job_url: event.job_url,
				completed_at: new Date()
			})

			log.info('Job extraction completed successfully', {
				job_id: event.job_id,
				process_id: event.process_id
			})
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'

			log.error(err as Error, 'Failed to extract job details', {
				job_id: event.job_id,
				process_id: event.process_id
			})

			// Update job status to Failed
			await db
				.update(jobs)
				.set({status: JobStatus.Failure, title: '<EXTRACTION_FAILED>', company_name: '<EXTRACTION_FAILED>'})
				.where(eq(jobs.id, event.job_id))

			// Update process status to Failed
			await db
				.update(processes)
				.set({
					status: ProcessStatus.Failed,
					status_details: errorMessage,
					desc: '<EXTRACTION_FAILED>'
				})
				.where(eq(processes.id, event.process_id))

			// Publish job scrape failed event
			await jobScrapeFailed.publish({
				job_id: event.job_id,
				job_url: event.job_url,
				process_id: event.process_id,
				error_message: errorMessage,
				failed_at: new Date()
			})
		}
	}
})
