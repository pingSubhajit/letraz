import {Subscription} from 'encore.dev/pubsub'
import log from 'encore.dev/log'
import {secret} from 'encore.dev/config'
import {appMeta} from 'encore.dev'
import {userCreated} from '@/services/identity/topics'
import {jobScrapeFailed, jobScrapeSuccess} from '@/services/job/topics'
import {userDeleted} from '@/services/webhooks/topics'
import {db} from '@/services/resume/database'
import {ProcessStatus, resumeProcesses, resumes, ResumeStatus} from '@/services/resume/schema'
import {
	resumeTailoringFailed,
	resumeTailoringSuccess,
	resumeTailoringTriggered,
	resumeUpdated,
	thumbnailGenerationTriggered
} from '@/services/resume/topics'
import {BulkReplaceService} from '@/services/resume/services/bulk-replace.service'
import {and, eq} from 'drizzle-orm'
import {ThumbnailEvaluatorService} from './services/thumbnail-evaluator.service'
import {resumeThumbnails} from '@/services/resume/storage'
import {ResumeService} from '@/services/resume/service'
import puppeteer from 'puppeteer'
import puppeteerCore from 'puppeteer-core'
import chromium from '@sparticuz/chromium'
import {addBreadcrumb, captureException} from '@/services/utils/sentry'
import {ResumeTailoringService} from '@/services/resume/services/resume-tailoring.service'
import {job as jobService} from '~encore/clients'

// Secrets for resume preview URL and authentication
const ResumePreviewUrl = secret('ResumePreviewUrl')
const ResumePreviewToken = secret('ResumePreviewToken')

/**
 * User Created Event Listener
 * Automatically creates an empty base resume for newly registered users
 *
 * This subscription listens to the userCreated event from the identity service
 * and ensures every user has a base resume template ready to use.
 */
const userCreatedListener = new Subscription(userCreated, 'create-base-resume', {
	handler: async (event) => {
		try {
			addBreadcrumb('Creating base resume for new user', {user_id: event.id}, 'pubsub')

			// Create empty base resume for the new user
			const [baseResume] = await db
				.insert(resumes)
				.values({
					user_id: event.id,
					base: true,
					status: ResumeStatus.Success
				})
				.returning()

			log.info('Base resume created for new user', {
				user_id: event.id,
				resume_id: baseResume.id,
				email: event.email
			})
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'

			log.error(err as Error, 'Failed to create base resume for new user', {
				user_id: event.id,
				email: event.email,
				error: errorMessage
			})

			// Report to Sentry - this is critical as it affects new user experience
			captureException(err, {
				tags: {
					operation: 'base-resume-creation',
					event_type: 'user-created',
					user_id: event.id
				},
				extra: {
					email: event.email,
					event
				},
				level: 'error'
			})
		}
	}
})

/**
 * Job Scrape Success Event Listener
 * Triggers resume tailoring for all resumes waiting for this job's scraping to complete
 *
 * This subscription listens to the jobScrapeSuccess event from the job service
 * and publishes resumeTailoringTriggered events for all waiting resumes.
 */
const jobScrapeSuccessListener = new Subscription(jobScrapeSuccess, 'trigger-resume-tailoring', {
	handler: async (event) => {
		try {
			// Find all resumes waiting for this job (status = Processing)
			const waitingResumes = await db
				.select()
				.from(resumes)
				.where(and(eq(resumes.job_id, event.job_id), eq(resumes.status, ResumeStatus.Processing)))

			if (waitingResumes.length === 0) {
				log.info('No resumes waiting for this job', {
					job_id: event.job_id
				})
				return
			}

			log.info('Found resumes waiting for job scraping completion', {
				job_id: event.job_id,
				resume_count: waitingResumes.length
			})

			// Publish tailoring triggered event for each waiting resume
			for (const resume of waitingResumes) {
				try {
					await resumeTailoringTriggered.publish({
						resume_id: resume.id,
						job_id: event.job_id,
						process_id: resume.process_id!,
						user_id: resume.user_id,
						job_url: event.job_url,
						triggered_at: new Date()
					})

					log.info('Resume tailoring triggered event published', {
						resume_id: resume.id,
						job_id: event.job_id,
						user_id: resume.user_id
					})
				} catch (err) {
					const errorMessage = err instanceof Error ? err.message : 'Unknown error'
					log.error(err as Error, 'Failed to publish resume tailoring triggered event', {
						resume_id: resume.id,
						job_id: event.job_id,
						error: errorMessage
					})

					// Report to Sentry - event publishing failure
					captureException(err, {
						tags: {
							operation: 'resume-tailoring-trigger',
							resume_id: resume.id,
							job_id: event.job_id
						},
						extra: {
							user_id: resume.user_id,
							process_id: resume.process_id
						},
						level: 'error'
					})
				}
			}
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Unknown error'
			log.error(err as Error, 'Failed to process job scrape success event', {
				job_id: event.job_id,
				error: errorMessage
			})

			// Report to Sentry - critical path failure
			captureException(err, {
				tags: {
					operation: 'job-scrape-success-processing',
					job_id: event.job_id
				},
				extra: {
					event
				},
				level: 'error'
			})
		}
	}
})

/**
 * Job Scrape Failed Event Listener
 * Marks all resumes waiting for this job as failed and publishes failure events
 *
 * This subscription listens to the jobScrapeFailed event from the job service
 * and updates the status of all resumes that were waiting for this job.
 */
const jobScrapeFailedListener = new Subscription(jobScrapeFailed, 'mark-resumes-failed', {
	handler: async (event) => {
		try {
			// Find all resumes waiting for this job (status = Processing)
			const waitingResumes = await db
				.select()
				.from(resumes)
				.where(and(eq(resumes.job_id, event.job_id), eq(resumes.status, ResumeStatus.Processing)))

			if (waitingResumes.length === 0) {
				log.info('No resumes waiting for this failed job', {
					job_id: event.job_id
				})
				return
			}

			log.info('Found resumes waiting for failed job, marking as failed', {
				job_id: event.job_id,
				resume_count: waitingResumes.length
			})

			// Update each resume and its process to failed status
			for (const resume of waitingResumes) {
				try {
					// Update resume status
					await db
						.update(resumes)
						.set({
							status: ResumeStatus.Failure
						})
						.where(eq(resumes.id, resume.id))

					// Update resume process status if present
					if (resume.process_id) {
						await db
							.update(resumeProcesses)
							.set({
								status: ProcessStatus.Failed,
								status_details: `Job scraping failed: ${event.error_message}`
							})
							.where(eq(resumeProcesses.id, resume.process_id))
					}

					// Publish resume tailoring failed event
					await resumeTailoringFailed.publish({
						resume_id: resume.id,
						job_id: event.job_id,
						process_id: resume.process_id!,
						user_id: resume.user_id,
						error_message: `Job scraping failed: ${event.error_message}`,
						failed_at: new Date()
					})

					log.info('Resume marked as failed and event published', {
						resume_id: resume.id,
						job_id: event.job_id,
						user_id: resume.user_id
					})
				} catch (err) {
					const errorMessage = err instanceof Error ? err.message : 'Unknown error'
					log.error(err as Error, 'Failed to mark resume as failed', {
						resume_id: resume.id,
						job_id: event.job_id,
						error: errorMessage
					})
				}
			}
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Unknown error'
			log.error(err as Error, 'Failed to process job scrape failed event', {
				job_id: event.job_id,
				error: errorMessage
			})
		}
	}
})

/**
 * Resume Tailoring Triggered Event Listener
 * Processes resume tailoring requests using AI-powered parallel section generation
 */
const resumeTailoringTriggeredListener = new Subscription(resumeTailoringTriggered, 'process-resume-tailoring', {
	handler: async (event) => {
		try {
			log.info('Resume tailoring started', {
				resume_id: event.resume_id,
				job_id: event.job_id,
				process_id: event.process_id,
				user_id: event.user_id
			})

			/*
			 * Fetch base resume with all sections
			 * We can't use 'base' alias here because we're in a background handler without auth context
			 * So we query the base resume directly using the user_id from the event
			 */
			const [baseResumeRecord] = await db
				.select()
				.from(resumes)
				.where(and(eq(resumes.user_id, event.user_id), eq(resumes.base, true)))
				.limit(1)

			if (!baseResumeRecord) {
				throw new Error('Base resume not found for user')
			}

			// Now get the full resume with sections using the actual resume ID
			const baseResume = await ResumeService.getResumeById({id: baseResumeRecord.id}, {skipAuth: true})
			if (!baseResume) {
				throw new Error('Failed to load base resume')
			}

			// Fetch job details
			const jobResponse = await jobService.getJob({id: event.job_id})
			if (!jobResponse || !jobResponse.job) {
				throw new Error('Job not found')
			}

			const job = jobResponse.job

			log.info('Starting AI-powered resume tailoring with parallel section generation', {
				resume_id: event.resume_id,
				job_id: event.job_id,
				base_sections_count: baseResume.sections.length,
				job_title: job.title,
				company: job.company_name
			})

			// Generate tailored sections using AI with parallel processing
			const tailoredSections = await ResumeTailoringService.tailorResume(baseResume, job)

			log.info('AI tailoring completed, replacing resume sections', {
				resume_id: event.resume_id,
				tailored_sections_count: tailoredSections.length
			})

			// Replace resume sections with AI-tailored content
			await BulkReplaceService.replaceResumeInternal(event.user_id, event.resume_id, tailoredSections)

			// Update resume status to success
			await db
				.update(resumes)
				.set({
					status: ResumeStatus.Success
				})
				.where(eq(resumes.id, event.resume_id))

			// Update resume process status to success
			await db
				.update(resumeProcesses)
				.set({
					status: ProcessStatus.Success,
					status_details: 'Resume tailored successfully using AI-powered parallel generation'
				})
				.where(eq(resumeProcesses.id, event.process_id))

			// Publish resume tailoring success event
			await resumeTailoringSuccess.publish({
				resume_id: event.resume_id,
				job_id: event.job_id,
				process_id: event.process_id,
				user_id: event.user_id,
				completed_at: new Date()
			})

			// Publish resume updated event for search indexing
			await ResumeService.publishResumeUpdate({
				resumeId: event.resume_id,
				changeType: 'bulk_replace',
				userId: event.user_id
			})

			log.info('Resume tailoring completed successfully', {
				resume_id: event.resume_id,
				job_id: event.job_id,
				process_id: event.process_id,
				user_id: event.user_id
			})

		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Unknown error'

			log.error(err as Error, 'Resume tailoring failed', {
				resume_id: event.resume_id,
				job_id: event.job_id,
				process_id: event.process_id,
				user_id: event.user_id,
				error: errorMessage
			})

			// Report to Sentry - critical business logic failure
			captureException(err, {
				tags: {
					operation: 'resume-tailoring',
					resume_id: event.resume_id,
					job_id: event.job_id,
					process_id: event.process_id
				},
				extra: {
					user_id: event.user_id,
					job_url: event.job_url,
					event
				},
				level: 'error'
			})

			try {
				// Update resume status to failed
				await db
					.update(resumes)
					.set({
						status: ResumeStatus.Failure
					})
					.where(eq(resumes.id, event.resume_id))

				// Update resume process status to failed
				await db
					.update(resumeProcesses)
					.set({
						status: ProcessStatus.Failed,
						status_details: errorMessage
					})
					.where(eq(resumeProcesses.id, event.process_id))

				// Publish resume tailoring failed event
				await resumeTailoringFailed.publish({
					resume_id: event.resume_id,
					job_id: event.job_id,
					process_id: event.process_id,
					user_id: event.user_id,
					error_message: errorMessage,
					failed_at: new Date()
				})

				log.info('Resume marked as failed after tailoring error', {
					resume_id: event.resume_id,
					job_id: event.job_id,
					user_id: event.user_id,
					error: errorMessage
				})
			} catch (cleanupErr) {
				const cleanupErrorMessage = cleanupErr instanceof Error ? cleanupErr.message : 'Unknown error'
				log.error(cleanupErr as Error, 'Failed to clean up resume after tailoring error', {
					resume_id: event.resume_id,
					job_id: event.job_id,
					error: cleanupErrorMessage
				})

				// Report cleanup failures to Sentry - this indicates a serious issue
				captureException(cleanupErr, {
					tags: {
						operation: 'resume-tailoring-cleanup',
						resume_id: event.resume_id,
						job_id: event.job_id,
						process_id: event.process_id
					},
					extra: {
						user_id: event.user_id,
						original_error: errorMessage
					},
					level: 'fatal'
				})
			}
		}
	}
})

/**
 * Thumbnail Evaluation Subscription
 * Subscribes to resume update events and evaluates if thumbnail regeneration is needed
 *
 * Process:
 * 1. Receives resumeUpdated event
 * 2. Calculates significance score based on change type and affected fields
 * 3. If score exceeds threshold, publishes thumbnailGenerationTriggered event
 */
const resumeUpdatedListener = new Subscription(resumeUpdated, 'thumbnail-evaluation', {
	handler: async event => {
		await ThumbnailEvaluatorService.processResumeUpdate(event)
	}
})

/**
 * Thumbnail Generation Triggered Listener
 * Subscribes to thumbnail generation triggered events and generates thumbnails
 *
 * Process:
 * 1. Receives thumbnailGenerationTriggered event
 * 2. Fetches dummy image from URL (placeholder for actual thumbnail generation)
 * 3. Uploads image to resume-thumbnails bucket
 * 4. Updates resume record with thumbnail URL
 *
 * This is a fire-and-forget operation with no process tracking in the database.
 */
const thumbnailGenerationTriggeredListener = new Subscription(
	thumbnailGenerationTriggered,
	'generate-thumbnail',
	{
		handler: async event => {
			let browser = null
			try {
				const environment = appMeta().environment.type
				const isProduction = environment === 'production'

				log.info('Thumbnail generation started', {
					resume_id: event.resume_id,
					user_id: event.user_id,
					reason: event.reason,
					change_score: event.change_score,
					environment: environment,
					is_production: isProduction
				})

				// Construct the preview URL with authentication token
				const previewUrl = `${ResumePreviewUrl()}/${event.resume_id}?token=${ResumePreviewToken()}`

				log.info('Launching browser for screenshot', {
					resume_id: event.resume_id,
					environment: environment,
					is_production: isProduction,
					using_chromium_aws: isProduction,
					preview_url: previewUrl.replace(ResumePreviewToken(), '***TOKEN***') // Mask token in logs
				})

				/*
				 * Launch headless browser
				 * Prefer system Chrome in production (provided by base image),
				 * fall back to @sparticuz/chromium if not available.
				 */
				if (isProduction) {
					const systemExecutablePath = process.env.PUPPETEER_EXECUTABLE_PATH
					if (systemExecutablePath) {
						log.info('Using system Chrome for production', {
							resume_id: event.resume_id,
							executable_path: systemExecutablePath
						})
						browser = await puppeteerCore.launch({
							executablePath: systemExecutablePath,
							headless: true,
							args: [
								'--no-sandbox',
								'--disable-setuid-sandbox',
								'--disable-dev-shm-usage',
								'--disable-gpu'
							]
						})
					} else {
						log.info('System Chrome not found, using @sparticuz/chromium fallback', {
							resume_id: event.resume_id
						})
						const executablePath = await chromium.executablePath()
						log.info('Chromium fallback executable path resolved', {
							resume_id: event.resume_id,
							executable_path: executablePath
						})
						browser = await puppeteerCore.launch({
							args: chromium.args,
							executablePath: executablePath,
							headless: true
						})
					}
				} else {
					log.info('Using local puppeteer', {
						resume_id: event.resume_id,
						environment: environment
					})

					browser = await puppeteer.launch({
						headless: true,
						args: [
							'--no-sandbox',
							'--disable-setuid-sandbox',
							'--disable-dev-shm-usage',
							'--disable-gpu'
						]
					})
				}

				const page = await browser.newPage()

				// Set viewport to A4 dimensions at 96 DPI
				await page.setViewport({
					width: 794, // A4 width at 96 DPI (210mm)
					height: 1123, // A4 height at 96 DPI (297mm)
					deviceScaleFactor: 1 // Standard DPI for faster rendering
				})

				log.info('Navigating to resume preview page', {
					resume_id: event.resume_id
				})

				// Navigate to the preview page with 30 second timeout
				await page.goto(previewUrl, {
					waitUntil: 'networkidle0',
					timeout: 30000
				})

				log.info('Capturing screenshot', {
					resume_id: event.resume_id
				})

				// Capture screenshot as buffer
				const screenshot = await page.screenshot({
					type: 'png',
					fullPage: false // Only capture the viewport (A4 dimensions)
				})

				// Convert Uint8Array to Buffer
				const imageBuffer = Buffer.from(screenshot)

				// Close browser
				await browser.close()
				browser = null

				log.info('Screenshot captured successfully', {
					resume_id: event.resume_id,
					buffer_size: imageBuffer.length
				})

				// Generate filename with timestamp to track versions
				const timestamp = Date.now()
				const filename = `${event.resume_id}_${timestamp}.png`

				await resumeThumbnails.upload(filename, imageBuffer, {
					contentType: 'image/png'
				})

				// Get public URL
				const thumbnailUrl = resumeThumbnails.publicUrl(filename)

				log.info('Thumbnail uploaded to storage', {
					resume_id: event.resume_id,
					filename: filename,
					timestamp: timestamp
				})

				// Fetch current resume to check for race conditions
				const [currentResume] = await db
					.select()
					.from(resumes)
					.where(eq(resumes.id, event.resume_id))
					.limit(1)

				if (!currentResume) {
					log.warn('Resume not found, skipping thumbnail update', {
						resume_id: event.resume_id
					})
					return
				}

				let shouldUpdate = true
				let oldThumbnailFilename: string | null = null

				// Check if existing thumbnail is newer (race condition protection)
				if (currentResume.thumbnail) {
					/*
					 * Extract timestamp from existing thumbnail URL
					 * Format: https://domain/bucket/rsm_xxx_1234567890.png
					 */
					const existingFilenameMatch = currentResume.thumbnail.match(/([^\/]+)_(\d+)\.png$/)
					if (existingFilenameMatch) {
						const existingTimestamp = parseInt(existingFilenameMatch[2], 10)
						if (existingTimestamp >= timestamp) {
							shouldUpdate = false
							log.info('Existing thumbnail is newer, skipping update', {
								resume_id: event.resume_id,
								existing_timestamp: existingTimestamp,
								new_timestamp: timestamp
							})
						} else {
							// Store old filename for deletion
							oldThumbnailFilename = existingFilenameMatch[0]
							log.info('Existing thumbnail is older, will update and delete old', {
								resume_id: event.resume_id,
								existing_timestamp: existingTimestamp,
								new_timestamp: timestamp,
								old_filename: oldThumbnailFilename
							})
						}
					}
				}

				if (shouldUpdate) {
					// Update resume record with thumbnail URL
					await db
						.update(resumes)
						.set({
							thumbnail: thumbnailUrl
						})
						.where(eq(resumes.id, event.resume_id))

					log.info('Resume thumbnail updated in database', {
						resume_id: event.resume_id,
						thumbnail_url: thumbnailUrl
					})

					// Delete old thumbnail file if it exists
					if (oldThumbnailFilename) {
						try {
							await resumeThumbnails.remove(oldThumbnailFilename)
							log.info('Old thumbnail deleted from storage', {
								resume_id: event.resume_id,
								deleted_filename: oldThumbnailFilename
							})
						} catch (deleteErr) {
							// Log but don't fail the operation if old thumbnail deletion fails
							log.warn('Failed to delete old thumbnail', {
								resume_id: event.resume_id,
								old_filename: oldThumbnailFilename,
								error: deleteErr instanceof Error ? deleteErr.message : 'Unknown error'
							})
						}
					}

					// Publish resume updated event for search indexing
					await ResumeService.publishResumeUpdate({
						resumeId: event.resume_id,
						changeType: 'thumbnail_updated',
						userId: event.user_id
					})
				}

				log.info('Thumbnail generation completed successfully', {
					resume_id: event.resume_id,
					user_id: event.user_id,
					thumbnail_url: shouldUpdate ? thumbnailUrl : currentResume.thumbnail,
					updated: shouldUpdate
				})
			} catch (err) {
				const errorMessage = err instanceof Error ? err.message : 'Unknown error'
				const errorStack = err instanceof Error ? err.stack : undefined

				log.error(err as Error, 'Thumbnail generation failed', {
					resume_id: event.resume_id,
					user_id: event.user_id,
					reason: event.reason,
					environment: appMeta().environment.type,
					error: errorMessage,
					error_stack: errorStack
				})

				/*
				 * Fire and forget - no database tracking or failure events
				 * The system will naturally retry on next significant change
				 */
			} finally {
				// Ensure browser is closed even if an error occurred
				if (browser) {
					try {
						await browser.close()
						log.info('Browser closed in cleanup', {
							resume_id: event.resume_id
						})
					} catch (closeErr) {
						log.error(closeErr as Error, 'Failed to close browser in cleanup', {
							resume_id: event.resume_id
						})
					}
				}
			}
		}
	}
)

/**
 * User Deleted Subscription
 * Handles user deletion events from webhooks service
 * Deletes all resumes for the deleted user
 */
const userDeletedListener = new Subscription(
	userDeleted,
	'delete-user-resumes',
	{
		handler: async (event) => {
			log.info('Processing user deletion - deleting resumes', {
				user_id: event.user_id,
				source: event.source
			})

			try {
				const deletedCount = await ResumeService.deleteAllUserResumes(event.user_id)

				log.info('Successfully deleted user resumes', {
					user_id: event.user_id,
					deleted_count: deletedCount
				})
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : 'Unknown error'
				log.error(error, 'Failed to delete user resumes', {
					user_id: event.user_id,
					error: errorMessage
				})

				captureException(error, {
					tags: {
						operation: 'user-deletion-resumes',
						user_id: event.user_id
					},
					extra: {
						source: event.source,
						deleted_at: event.deleted_at
					},
					level: 'error'
				})

				// Re-throw to trigger retry
				throw error
			}
		}
	}
)
