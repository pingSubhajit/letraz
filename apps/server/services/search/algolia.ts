import log from 'encore.dev/log'
import {ResumeUpdatedEvent} from '@/services/resume/topics'
import {
	AlgoliaCertificationData,
	AlgoliaEducationData,
	AlgoliaExperienceData,
	AlgoliaProjectData,
	AlgoliaResumeDocument,
	AlgoliaSectionDocument,
	AlgoliaSkillsData
} from '@/services/search/interface'
import {ResumeResponse, ResumeSectionWithData} from '@/services/resume/interface'
import {ResumeSectionType} from '@/services/resume/schema'
import {secret} from 'encore.dev/config'
import {algoliasearch} from 'algoliasearch'
import {ResumeService} from '@/services/resume/service'
import {captureException} from '@/services/utils/sentry'

/**
 * Algolia Credentials
 * Loaded from Encore secrets
 */
const ALGOLIA_APP_ID = secret('AlgoliaAppId')
const ALGOLIA_API_KEY = secret('AlgoliaApiKey')

/**
 * Algolia Index Name
 * All resumes are indexed in this Algolia index
 */
const ALGOLIA_INDEX_NAME = 'resumes-ts'

/**
 * Get Algolia Client
 * Lazy initialization of Algolia client with memoization
 */
let algoliaClientInstance: ReturnType<typeof algoliasearch> | null = null

const getAlgoliaClient = () => {
	if (!algoliaClientInstance) {
		try {
			const appId = ALGOLIA_APP_ID()
			const apiKey = ALGOLIA_API_KEY()

			if (!appId || !apiKey) {
				const error = new Error('Algolia credentials not configured')

				// Report to Sentry - missing credentials
				captureException(error, {
					tags: {
						operation: 'algolia-initialization',
						service: 'search'
					},
					level: 'error'
				})

				throw error
			}

			algoliaClientInstance = algoliasearch(appId, apiKey)
			log.info('Algolia client initialized', {
				app_id: appId,
				index: ALGOLIA_INDEX_NAME
			})
		} catch (err) {
			// Report initialization errors to Sentry
			if (!(err instanceof Error && err.message === 'Algolia credentials not configured')) {
				captureException(err, {
					tags: {
						operation: 'algolia-client-creation',
						service: 'search'
					},
					level: 'error'
				})
			}
			throw err
		}
	}

	return algoliaClientInstance
}

/**
 * Algolia Search Service
 * Handles indexing and search operations for resumes
 */
export const AlgoliaService = {
	/**
	 * Transform resume data to Algolia document format
	 * Flattens nested structures and extracts searchable content
	 */
	transformResumeToAlgoliaDocument(resume: ResumeResponse): AlgoliaResumeDocument {
		return {
			objectID: resume.id,
			id: resume.id,
			user: resume.user.id,
			job: resume.job
				? {
					id: resume.job.id,
					title: resume.job.title,
					company_name: resume.job.company_name,
					location: resume.job.location,
					status: resume.job.status,
					job_url: resume.job.job_url,
					description: resume.job.description,
					salary: resume.job.salary_min || resume.job.salary_max || resume.job.currency
						? {
							min: resume.job.salary_min,
							max: resume.job.salary_max,
							currency: resume.job.currency
						}
						: null
				}
				: null,
			status: resume.status,
			sections: resume.sections.map(section => this.transformSection(section)),
			thumbnail: resume.thumbnail,
			indexed_at: new Date().toISOString()
		}
	},

	/**
	 * Transform resume section to Algolia format
	 * Handles polymorphic section data based on type
	 */
	transformSection(section: ResumeSectionWithData): AlgoliaSectionDocument {
		return {
			type: section.type,
			data: this.transformSectionData(section)
		}
	},

	/**
	 * Transform section data based on type
	 * Extracts searchable fields and flattens structures
	 *
	 * Note: Section data is wrapped in an object with the section type as key
	 * e.g., { experience: { company_name: "...", ... } }
	 */
	transformSectionData: (
		section: ResumeSectionWithData
	):
		| AlgoliaEducationData
		| AlgoliaExperienceData
		| AlgoliaProjectData
		| AlgoliaCertificationData
		| AlgoliaSkillsData => {
		if (!section.data) {
			// Handle empty sections (shouldn't happen, but type-safe)
			if (section.type === ResumeSectionType.Skill) {
				return {skills: []}
			}
			throw new Error(`Section ${section.id} has no data`)
		}

		const rawData = section.data as any

		switch (section.type) {
			case ResumeSectionType.Education:
				// Unwrap: section.data.education -> actual data
				const edu = rawData.education || rawData
				return {
					institution_name: edu.institution_name,
					field_of_study: edu.field_of_study,
					degree: edu.degree,
					country: edu.country?.name || null,
					current: edu.current,
					description: edu.description
				}

			case ResumeSectionType.Experience:
				// Unwrap: section.data.experience -> actual data
				const exp = rawData.experience || rawData
				return {
					company_name: exp.company_name,
					job_title: exp.job_title,
					employment_type: exp.employment_type,
					city: exp.city,
					country: exp.country?.name || null,
					current: exp.current,
					description: exp.description
				}

			case ResumeSectionType.Project:
				// Unwrap: section.data.project -> actual data
				const proj = rawData.project || rawData
				return {
					category: proj.category,
					name: proj.name,
					description: proj.description,
					role: proj.role,
					github_url: proj.github_url,
					live_url: proj.live_url,
					current: proj.current
				}

			case ResumeSectionType.Certification:
				// Unwrap: section.data.certification -> actual data
				const cert = rawData.certification || rawData
				return {
					name: cert.name,
					issuing_organization: cert.issuing_organization,
					issue_date: cert.issue_date,
					credential_url: cert.credential_url
				}

			case ResumeSectionType.Skill:
				// Unwrap: section.data.skills -> actual data
				const skillData = rawData.skills || rawData.skill || rawData

				/*
				 * Handle different possible structures:
				 * 1. { skills: { skills: [...] } } -> skillData = { skills: [...] }
				 * 2. { skills: [...] } -> skillData = [...]
				 */
				let skillsArray: any[] = []

				if (Array.isArray(skillData)) {
					// skillData is already the array
					skillsArray = skillData
				} else if (skillData.skills && Array.isArray(skillData.skills)) {
					// skillData is { skills: [...] }
					skillsArray = skillData.skills
				}

				return {
					skills: skillsArray.map((prof: any) => ({
						name: prof.skill?.name || prof.name,
						category: prof.skill?.category || prof.category,
						level: prof.level
					}))
				}

			default:
				throw new Error(`Unknown section type: ${section.type}`)
		}
	},
	/**
	 * Index a resume based on update event
	 * Determines the appropriate action based on change type
	 */
	async indexResume(event: ResumeUpdatedEvent): Promise<void> {
		log.info('Processing resume change for Algolia indexing', {
			resume_id: event.resume_id,
			user_id: event.user_id,
			change_type: event.change_type,
			section_type: event.section_type
		})

		try {
			switch (event.change_type) {
				case 'resume_deleted':
					// Remove from index
					await this.removeResume(event.resume_id)
					break

				case 'section_added':
				case 'section_updated':
				case 'section_removed':
				case 'bulk_replace':
				case 'section_reordered':
				case 'thumbnail_updated':
					// Fetch full resume and update index
					await this.updateResumeIndex(event.resume_id)
					break

				default:
					log.warn('Unknown change type for indexing', {
						resume_id: event.resume_id,
						change_type: event.change_type
					})
			}
		} catch (err) {
			// Re-throw to be handled by caller
			throw err
		}
	},

	/**
	 * Update resume in Algolia index
	 * Fetches full resume data directly from database and indexes it
	 *
	 * Note: We fetch directly from the database instead of using the API client
	 * because PubSub subscriptions don't have auth context.
	 */
	async updateResumeIndex(resumeId: string): Promise<void> {
		try {
			// Fetch full resume data (skip auth - no auth context in PubSub)
			const resumeData = await ResumeService.getResumeById({id: resumeId}, {skipAuth: true})

			// Transform to Algolia format
			const algoliaDoc = this.transformResumeToAlgoliaDocument(resumeData)

			// Get Algolia client and save object
			const client = getAlgoliaClient()
			await client.saveObject({
				indexName: ALGOLIA_INDEX_NAME,
				body: algoliaDoc
			})

			log.info('Resume indexed successfully in Algolia', {
				resume_id: resumeId,
				object_id: algoliaDoc.objectID
			})
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Unknown error'
			log.error(err as Error, 'Failed to index resume in Algolia', {
				resume_id: resumeId,
				error: errorMessage
			})
			throw err
		}
	},

	/**
	 * Remove a resume from the search index
	 * Called when a resume is deleted
	 */
	removeResume: async (resumeId: string): Promise<void> => {
		try {
			log.info('Removing resume from Algolia index', {
				resume_id: resumeId
			})

			// Get Algolia client and delete object
			const client = getAlgoliaClient()
			await client.deleteObject({
				indexName: ALGOLIA_INDEX_NAME,
				objectID: resumeId
			})

			log.info('Resume removed from Algolia index successfully', {
				resume_id: resumeId
			})
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Unknown error'
			log.error(err as Error, 'Failed to remove resume from Algolia', {
				resume_id: resumeId,
				error: errorMessage
			})
			throw err
		}
	}
}

