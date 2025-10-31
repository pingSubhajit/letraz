import {APIError} from 'encore.dev/api'
import {secret} from 'encore.dev/config'
import {getAuthData} from '~encore/auth'
import {db} from '@/services/resume/database'
import {
	ResumeChangeType,
	resumeExportFailed,
	resumeExportSuccess,
	ResumeSectionTypeEvent,
	resumeTailoringTriggered,
	resumeUpdated
} from '@/services/resume/topics'
import {
	certifications,
	educations,
	experiences,
	ProcessStatus,
	proficiencies,
	projects,
	projectSkills,
	resumeProcesses,
	resumes,
	resumeSections,
	ResumeSectionType,
	ResumeStatus,
	skills
} from '@/services/resume/schema'
import {EducationHelpers} from '@/services/resume/services/education.service'
import {ExperienceHelpers} from '@/services/resume/services/experience.service'
import {ProjectHelpers} from '@/services/resume/services/project.service'
import {CertificationHelpers} from '@/services/resume/services/certification.service'
import {SkillHelpers} from '@/services/resume/services/skill.service'
import {
	ClearDatabaseResponse,
	DeleteResumeParams,
	ExportResumeParams,
	ExportResumeResponse,
	GetResumeParams,
	ListResumesParams,
	RearrangeSectionsRequest,
	ResumeMinimal,
	ResumeResponse,
	ResumeSectionWithData,
	ResumeShort,
	TailorResumeRequest
} from '@/services/resume/interface'
import type {Country} from '@/services/core/interface'
import {AuthData} from '@/services/identity/auth'
import {IdentityService} from '@/services/identity/service'
import {and, desc, eq, inArray, max, ne} from 'drizzle-orm'
import {core, job} from '~encore/clients'
import {JobStatus} from '@/services/job/schema'
import log from 'encore.dev/log'
import {captureException} from '@/services/utils/sentry'

// Secret for util service endpoint
const UtilServiceEndpoint = secret('UtilServiceEndpoint')

/**
 * Resume Service
 * Business logic layer for resume operations
 */
export const ResumeService = {
	/**
	 * Get authenticated user ID from auth data
	 */
	getAuthenticatedUserId: (): string => {
		const authData = getAuthData() as AuthData
		return authData.userId
	},

	/**
	 * Publish resume updated event for thumbnail regeneration
	 *
	 * @param params - Event parameters including resume ID, change type, etc.
	 */
	publishResumeUpdate: async (params: {
		resumeId: string
		changeType: ResumeChangeType
		sectionType?: ResumeSectionTypeEvent
		sectionId?: string
		changedFields?: string[]
		metadata?: Record<string, unknown> // Additional context
		userId?: string // Optional: provide when auth context unavailable (e.g., PubSub handlers)
	}): Promise<void> => {
		try {
			// Get userId from params or auth context
			let userId: string
			if (params.userId) {
				userId = params.userId
			} else {
				const authData = getAuthData() as AuthData | null
				if (!authData) {
					log.error(new Error('No auth data available'), 'Cannot publish resume updated event without userId', {
						resume_id: params.resumeId,
						change_type: params.changeType
					})
					return
				}
				userId = authData.userId
			}

			await resumeUpdated.publish({
				resume_id: params.resumeId,
				user_id: userId,
				change_type: params.changeType,
				section_type: params.sectionType,
				section_id: params.sectionId,
				changed_fields: params.changedFields,
				metadata: params.metadata,
				timestamp: new Date()
			})

			log.info('Published resume updated event', {
				resume_id: params.resumeId,
				change_type: params.changeType,
				section_type: params.sectionType
			})
		} catch (error) {
			// Log but don't fail the main operation if event publishing fails
			log.error(error, 'Failed to publish resume updated event', {
				resume_id: params.resumeId,
				change_type: params.changeType
			})

			// Report to Sentry - event publishing should not fail
			captureException(error, {
				tags: {
					operation: 'resume-update-event-publish',
					resume_id: params.resumeId,
					change_type: params.changeType
				},
				extra: {
					section_type: params.sectionType,
					section_id: params.sectionId
				},
				level: 'warning' // Warning since main operation succeeded
			})
		}
	},

	/**
	 * Resolve resume ID ('base' alias or actual ID)
	 * Returns the resume ID for the authenticated user
	 */
	async resolveResumeId(idOrBase: string): Promise<string> {
		if (idOrBase === 'base') {
			// Only get userId when resolving 'base' alias
			const userId = this.getAuthenticatedUserId()

			/*
			 * Get base resume for user
			 * TODO: Create base resume if not found
			 */
			const baseResumeQuery = await db
				.select()
				.from(resumes)
				.where(and(eq(resumes.user_id, userId), eq(resumes.base, true)))
				.limit(1)

			if (baseResumeQuery.length === 0) {
				throw APIError.notFound('Base resume not found for user')
			}

			return baseResumeQuery[0].id
		}

		// Return the ID as-is (no auth context needed)
		return idOrBase
	},

	/**
	 * Verify resume ownership
	 * Throws PermissionDenied if user doesn't own the resume
	 * Skips ownership check for admin users
	 */
	verifyResumeOwnership: async (resumeId: string): Promise<void> => {
		const authData = getAuthData() as AuthData
		const userId = authData.userId

		// Skip ownership check for admin users
		if (userId === 'admin') {
			// Verify resume exists
			const resume = await db.select().from(resumes).where(eq(resumes.id, resumeId)).limit(1)
			if (resume.length === 0) {
				throw APIError.notFound(`Resume with ID '${resumeId}' not found`)
			}
			return
		}

		const resume = await db.select().from(resumes).where(eq(resumes.id, resumeId)).limit(1)

		if (resume.length === 0) {
			throw APIError.notFound(`Resume with ID '${resumeId}' not found`)
		}

		if (resume[0].user_id !== userId) {
			throw APIError.permissionDenied('You do not have permission to access this resume')
		}
	},

	/**
	 * List all resumes for authenticated user
	 */
	async listResumes({status, base}: ListResumesParams = {}): Promise<{resumes: ResumeShort[]}> {
		const userId = this.getAuthenticatedUserId()

		// Build query filters
		const filters = [eq(resumes.user_id, userId), ne(resumes.status, ResumeStatus.Failure)]
		if (status) {
			filters.push(eq(resumes.status, status))
		}
		if (base !== undefined) {
			filters.push(eq(resumes.base, base))
		}

		// Fetch resumes
		const resumesData = await db
			.select()
			.from(resumes)
			.where(and(...filters))
			.orderBy(desc(resumes.created_at))

		// Enrich with user and job data
		const enrichedResumes = await Promise.all(
			resumesData.map(async resume => {
				let jobData = null
				if (resume.job_id) {
					jobData = await this.fetchJobData(resume.job_id)
				}

				return {
					id: resume.id,
					base: resume.base,
					user: resume.user_id,
					job: jobData,
					status: resume.status,
					thumbnail: resume.thumbnail,
					created_at: resume.created_at,
					updated_at: resume.updated_at
				}
			})
		)

		return {
			resumes: enrichedResumes
		}
	},

	/**
	 * Get resume by ID with all sections and nested data
	 */
	async getResumeById(
		{id}: GetResumeParams,
		options?: {skipAuth?: boolean}
	): Promise<ResumeResponse> {
		const resumeId = await this.resolveResumeId(id)

		// Only verify ownership if not explicitly skipped
		if (!options?.skipAuth) {
			await this.verifyResumeOwnership(resumeId)
		}

		// Fetch resume
		const resumeQuery = await db.select().from(resumes).where(eq(resumes.id, resumeId)).limit(1)

		if (resumeQuery.length === 0) {
			throw APIError.notFound(`Resume with ID '${resumeId}' not found`)
		}

		const resume = resumeQuery[0]

		// Fetch user data
		const user = await this.fetchUserData(resume.user_id)

		// Fetch job data if job_id exists
		let jobData = null
		if (resume.job_id) {
			jobData = await this.fetchJobData(resume.job_id)
		}

		// Fetch all sections with relations
		const sections = await db
			.select()
			.from(resumeSections)
			.where(eq(resumeSections.resume_id, resumeId))
			.orderBy(resumeSections.index)

		// Collect all section data first
		const sectionDataPromises = sections.map(async section => {
			switch (section.type) {
				case 'Education':
					return db.select().from(educations).where(eq(educations.resume_section_id, section.id)).limit(1)
				case 'Experience':
					return db.select().from(experiences).where(eq(experiences.resume_section_id, section.id)).limit(1)
				case 'Project':
					return db.select().from(projects).where(eq(projects.resume_section_id, section.id)).limit(1)
				case 'Certification':
					return db.select().from(certifications).where(eq(certifications.resume_section_id, section.id)).limit(1)
				case 'Skill':
					return db.select().from(proficiencies).where(eq(proficiencies.resume_section_id, section.id))
				default:
					return []
			}
		})

		const allSectionData = await Promise.all(sectionDataPromises)

		// Collect all unique country codes
		const countryCodes: string[] = []
		allSectionData.forEach((data) => {
			if (data.length > 0) {
				const item = data[0]
				if ('country_code' in item && item.country_code) {
					countryCodes.push(item.country_code as string)
				}
			}
		})

		// Batch lookup all countries
		const countryMap = await this.batchLookupCountries(countryCodes)

		// Collect all skill IDs and project IDs for batch fetching
		const allSkillIds: string[] = []
		const projectIds: string[] = []

		allSectionData.forEach((data, idx) => {
			const section = sections[idx]
			if (data.length > 0) {
				if (section.type === 'Skill') {
					// Collect skill IDs from proficiencies
					data.forEach((prof: any) => {
						if (prof.skill_id) allSkillIds.push(prof.skill_id)
					})
				} else if (section.type === 'Project') {
					// Collect project ID for skills_used lookup
					const project = data[0] as any
					if (project.id) projectIds.push(project.id)
				}
			}
		})

		// Batch fetch all skills
		const allSkillsData = allSkillIds.length > 0
			? await db.select().from(skills).where(inArray(skills.id, allSkillIds))
			: []
		const skillMap = new Map(allSkillsData.map(s => [s.id, s]))

		// Batch fetch project skills
		const allProjectSkills = projectIds.length > 0
			? await db.select().from(projectSkills).where(inArray(projectSkills.project_id, projectIds))
			: []
		// Group by project_id
		const projectSkillsMap = new Map<string, string[]>()
		allProjectSkills.forEach(ps => {
			if (!projectSkillsMap.has(ps.project_id)) {
				projectSkillsMap.set(ps.project_id, [])
			}
			projectSkillsMap.get(ps.project_id)!.push(ps.skill_id)
		})

		// Build sections with nested data
		const sectionsWithData = sections.map((section, idx): ResumeSectionWithData => {
			let data = null
			const sectionData = allSectionData[idx]

			if (sectionData.length > 0) {
				switch (section.type) {
					case 'Education': {
						const edu = sectionData[0] as any
						const country = edu.country_code ? countryMap.get(edu.country_code) || null : null
						data = EducationHelpers.buildEducationResponse(edu, country)
						break
					}
					case 'Experience': {
						const exp = sectionData[0] as any
						const country = exp.country_code ? countryMap.get(exp.country_code) || null : null
						data = ExperienceHelpers.buildExperienceResponse(exp, country)
						break
					}
					case 'Project': {
						const project = sectionData[0] as any

						// Get skills for this project from pre-fetched data
						const projectSkillIds = projectSkillsMap.get(project.id) || []
						const projectSkillsData = projectSkillIds
							.map(skillId => skillMap.get(skillId))
							.filter((skill): skill is typeof skills.$inferSelect => skill !== undefined)

						data = ProjectHelpers.buildProjectResponse(project, projectSkillsData)
						break
					}
					case 'Certification': {
						const cert = sectionData[0] as any
						data = CertificationHelpers.buildCertificationResponse(cert)
						break
					}
					case 'Skill': {
						// Build ProficiencyWithSkill array from pre-fetched data
						const proficiencyRecords = sectionData as any[]
						const proficienciesWithSkills = proficiencyRecords.map(prof => {
							const skill = skillMap.get(prof.skill_id)
							if (!skill) {
								throw APIError.internal(`Skill not found for proficiency ${prof.id}`)
							}
							return SkillHelpers.buildSkillResponse(prof.id, skill, prof.level, prof.resume_section_id)
						})

						data = {skills: proficienciesWithSkills}
						break
					}
				}
			}

			return {
				id: section.id,
				resume: section.resume_id,
				index: section.index,
				type: section.type,
				created_at: section.created_at,
				updated_at: section.updated_at,
				data
			}
		})

		return {
			...resume,
			user,
			job: jobData,
			sections: sectionsWithData
		}
	},

	/**
	 * Get minimal resume data by ID
	 * Fast endpoint that returns only essential resume information
	 * without fetching sections or full user/job data
	 */
	async getResumeMinimal({id}: GetResumeParams): Promise<ResumeMinimal> {
		const resumeId = await this.resolveResumeId(id)
		await this.verifyResumeOwnership(resumeId)

		// Fetch resume with optional job title in a single optimized query
		const resumeQuery = await db
			.select({
				id: resumes.id,
				base: resumes.base,
				status: resumes.status,
				job_id: resumes.job_id,
				created_at: resumes.created_at,
				updated_at: resumes.updated_at
			})
			.from(resumes)
			.where(eq(resumes.id, resumeId))
			.limit(1)

		if (resumeQuery.length === 0) {
			throw APIError.notFound(`Resume with ID '${resumeId}' not found`)
		}

		const resume = resumeQuery[0]

		// Fetch job title and company name if job_id exists (minimal fetch, very fast)
		let jobTitle: string | null = null
		let companyName: string | null = null
		if (resume.job_id) {
			try {
				const jobData = await job.getJob({id: resume.job_id})
				jobTitle = jobData.job?.title ?? null
				companyName = jobData.job?.company_name ?? null
			} catch (err) {
				// Job not found or error, leave as null
				log.warn('Failed to fetch job data for minimal resume', {
					resume_id: resumeId,
					job_id: resume.job_id,
					error: err instanceof Error ? err.message : 'Unknown error'
				})
			}
		}

		return {
			id: resume.id,
			base: resume.base,
			status: resume.status,
			job_title: jobTitle,
			company_name: companyName,
			created_at: resume.created_at,
			updated_at: resume.updated_at
		}
	},

	/**
	 * Delete resume by ID
	 * Cannot delete base resume
	 */
	async deleteResume({id}: DeleteResumeParams): Promise<void> {
		const resumeId = await this.resolveResumeId(id)
		await this.verifyResumeOwnership(resumeId)

		// Prevent deletion of base resume
		if (id === 'base') {
			throw APIError.invalidArgument('Cannot delete base resume')
		}

		// Check if it's a base resume by ID
		const resumeQuery = await db.select().from(resumes).where(eq(resumes.id, resumeId)).limit(1)

		if (resumeQuery.length === 0) {
			throw APIError.notFound(`Resume with ID '${resumeId}' not found`)
		}

		if (resumeQuery[0].base) {
			throw APIError.invalidArgument('Cannot delete base resume')
		}

		const authData = getAuthData() as AuthData
		const userId = authData.userId

		// Delete resume (cascades to sections and all nested data)
		await db.delete(resumes).where(eq(resumes.id, resumeId))

		// Publish event for search de-indexing and other cleanup
		await ResumeService.publishResumeUpdate({
			resumeId,
			changeType: 'resume_deleted'
		})

		log.info('Resume deleted and event published', {
			resume_id: resumeId,
			user_id: userId
		})
	},

	/**
	 * ==========================================
	 * SHARED UTILITIES
	 * ==========================================
	 */

	/**
	 * Create a new section for a resume with auto-incremented index
	 */
	createSectionForResume: async (resumeId: string, type: ResumeSectionType): Promise<string> => {
		// Get the max index for this resume
		const maxIndexQuery = await db
			.select({maxIndex: max(resumeSections.index)})
			.from(resumeSections)
			.where(eq(resumeSections.resume_id, resumeId))

		const nextIndex = (maxIndexQuery[0].maxIndex ?? -1) + 1

		// Create new section
		const [section] = await db
			.insert(resumeSections)
			.values({
				resume_id: resumeId,
				index: nextIndex,
				type
			})
			.returning()

		return section.id
	},

	/**
	 * Validate UUID format
	 */
	validateUUID: (id: string, fieldName: string = 'ID'): void => {
		const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
		if (!uuidRegex.test(id)) {
			throw APIError.notFound(`${fieldName} '${id}' not found`)
		}
	},

	/**
	 * Parse numeric string to number
	 * Handles both number and string inputs
	 */
	parseNumericValue: (value: number | string | null | undefined): number | null => {
		if (value === null || value === undefined) {
			return null
		}

		if (typeof value === 'number') {
			return value
		}

		// Parse string to number
		const parsed = parseInt(value, 10)
		if (isNaN(parsed)) {
			throw APIError.invalidArgument(`Invalid numeric value: '${value}'`)
		}

		return parsed
	},

	/**
	 * Validate date range values
	 * Accepts both numbers and numeric strings
	 */
	validateDateRange: (month?: number | string | null, year?: number | string | null): void => {
		if (month !== null && month !== undefined) {
			const monthNum = typeof month === 'string' ? parseInt(month, 10) : month
			if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
				throw APIError.invalidArgument('Month must be between 1 and 12')
			}
		}
		if (year !== null && year !== undefined) {
			const yearNum = typeof year === 'string' ? parseInt(year, 10) : year
			if (isNaN(yearNum) || yearNum < 1900 || yearNum > 2100) {
				throw APIError.invalidArgument('Year must be between 1900 and 2100')
			}
		}
	},

	/**
	 * Lookup country via core service
	 * Returns country data or throws error if not found
	 */
	lookupCountry: async (code: string) => {
		try {
			return await core.getCountry({code})
		} catch (err) {
			throw APIError.invalidArgument(`Invalid country code: ${code}`)
		}
	},

	/**
	 * Resolve country from various input formats
	 * Handles both country_code (string) and country (string | CountryReference)
	 */
	resolveCountry: async (
		country?: string | {code: string; name: string} | null,
		country_code?: string | null
	): Promise<{country_code: string | null; country: Country | null}> => {
		// Priority: country field takes precedence over country_code
		if (country) {
			// If country is a string, treat it as a country code
			if (typeof country === 'string') {
				const countryData = await ResumeService.lookupCountry(country)
				return {country_code: country, country: countryData}
			}

			// If country is an object (CountryReference), create it if doesn't exist
			if (typeof country === 'object' && country.code && country.name) {
				const normalizedCode = country.code.toUpperCase()

				// Try to get existing country
				try {
					const existingCountry = await core.getCountry({code: normalizedCode})
					return {country_code: normalizedCode, country: existingCountry}
				} catch {
					// Country doesn't exist, create it
					try {
						const newCountry = await core.createCountry({
							code: normalizedCode,
							name: country.name.trim()
						})
						return {country_code: normalizedCode, country: newCountry}
					} catch (err) {
						// If creation fails (e.g., race condition), try to get it again
						try {
							const existingCountry = await core.getCountry({code: normalizedCode})
							return {country_code: normalizedCode, country: existingCountry}
						} catch {
							throw APIError.invalidArgument(`Failed to resolve country: ${country.code}`)
						}
					}
				}
			}
		}

		// Fallback to country_code if provided
		if (country_code) {
			const countryData = await ResumeService.lookupCountry(country_code)
			return {country_code, country: countryData}
		}

		// No country information provided
		return {country_code: null, country: null}
	},

	/**
	 * Batch lookup countries
	 * Fetches multiple countries in parallel and returns a map
	 */
	batchLookupCountries: async (codes: string[]): Promise<Map<string, Country>> => {
		const uniqueCodes = Array.from(new Set(codes.filter(code => code)))
		const countryMap = new Map<string, Country>()

		await Promise.all(
			uniqueCodes.map(async code => {
				try {
					const country = await core.getCountry({code})
					countryMap.set(code, country)
				} catch {
					// Country lookup failed, don't add to map
				}
			})
		)

		return countryMap
	},

	/**
	 * Fetch user data from identity service
	 */
	fetchUserData: async (userId: string) => {
		const user = await IdentityService.getUserById(userId)
		if (!user) {
			throw APIError.internal(`User ${userId} not found`)
		}
		return user
	},

	/**
	 * Fetch job data from job service
	 */
	fetchJobData: async (jobId: string) => {
		try {
			const jobData = await job.getJob({id: jobId})
			return jobData.job
		} catch (err) {
			// Job not found or error, return null
			return null
		}
	},

	/**
	 * Rearrange resume sections
	 * Uses two-phase update to avoid unique constraint violations
	 */
	rearrangeSections: async ({id, section_ids}: RearrangeSectionsRequest): Promise<ResumeResponse> => {
		const resumeId = await ResumeService.resolveResumeId(id)
		await ResumeService.verifyResumeOwnership(resumeId)

		// Validate section_ids are unique
		const uniqueSectionIds = new Set(section_ids)
		if (uniqueSectionIds.size !== section_ids.length) {
			throw APIError.invalidArgument('Duplicate section IDs provided')
		}

		// Get all existing sections for this resume
		const existingSections = await db
			.select()
			.from(resumeSections)
			.where(eq(resumeSections.resume_id, resumeId))
			.orderBy(resumeSections.index)

		// Validate all section_ids belong to this resume
		const existingSectionIds = new Set(existingSections.map(s => s.id))
		const invalidIds = section_ids.filter(id => !existingSectionIds.has(id))

		if (invalidIds.length > 0) {
			throw APIError.invalidArgument(`Section IDs do not belong to this resume: ${invalidIds.join(', ')}`)
		}

		// Validate all existing sections are included
		if (existingSectionIds.size !== section_ids.length) {
			const missingIds = Array.from(existingSectionIds).filter(id => !uniqueSectionIds.has(id))
			throw APIError.invalidArgument(`Missing section IDs in request: ${missingIds.join(', ')}`)
		}

		/*
		 * Two-phase update to avoid unique constraint violations
		 * Phase 1: Set all to negative indices
		 */
		await db.transaction(async tx => {
			// Phase 1: Set all to negative indices
			for (let i = 0; i < section_ids.length; i++) {
				await tx
					.update(resumeSections)
					.set({index: -(i + 1)})
					.where(eq(resumeSections.id, section_ids[i]))
			}

			// Phase 2: Set final positive indices
			for (let i = 0; i < section_ids.length; i++) {
				await tx
					.update(resumeSections)
					.set({index: i})
					.where(eq(resumeSections.id, section_ids[i]))
			}
		})

		// Publish event for thumbnail generation
		await ResumeService.publishResumeUpdate({
			resumeId,
			changeType: 'section_reordered'
		})

		// Return updated resume with sections
		return ResumeService.getResumeById({id: resumeId})
	},

	/**
	 * Tailor resume for a job
	 * Creates or retrieves a job-specific resume and initiates tailoring process
	 *
	 * Retry Logic:
	 * - If job scraping previously failed, retries by calling scrapeJob again
	 * - If resume tailoring previously failed, creates new process and resets status
	 */
	async tailorResume({target}: TailorResumeRequest): Promise<ResumeResponse> {
		const userId = this.getAuthenticatedUserId()

		// Validate target
		if (!target || target.trim().length < 10) {
			throw APIError.invalidArgument('Target must be at least 10 characters')
		}

		// Detect if target is a URL
		const isUrl = /^https?:\/\//i.test(target.trim())
		const jobUrl = isUrl ? target.trim() : undefined

		// Call scrapeJob to create/get the job (handles deduplication internally)
		const {job: scrapedJob} = await job.scrapeJob({target})

		// Check if resume already exists for this user + job
		const existingResumeQuery = await db
			.select()
			.from(resumes)
			.where(and(eq(resumes.user_id, userId), eq(resumes.job_id, scrapedJob.id)))
			.limit(1)

		if (existingResumeQuery.length > 0) {
			const existingResume = existingResumeQuery[0]

			// If existing resume failed, retry by resetting it
			if (existingResume.status === ResumeStatus.Failure) {
				log.info('Existing resume failed, retrying tailoring', {
					resume_id: existingResume.id,
					job_id: scrapedJob.id,
					user_id: userId
				})

				// Create a new resume process for the retry
				const [newResumeProcess] = await db
					.insert(resumeProcesses)
					.values({
						desc: 'Retrying resume tailoring for job',
						status: ProcessStatus.Initiated,
						status_details: null
					})
					.returning()

				// Update resume: reset status, detach old process, attach new process
				await db
					.update(resumes)
					.set({
						status: ResumeStatus.Processing,
						process_id: newResumeProcess.id
					})
					.where(eq(resumes.id, existingResume.id))

				log.info('Resume reset for retry', {
					resume_id: existingResume.id,
					old_process_id: existingResume.process_id,
					new_process_id: newResumeProcess.id,
					user_id: userId
				})

				// Conditionally publish event based on job status
				if (scrapedJob.status === JobStatus.Success) {
					try {
						await resumeTailoringTriggered.publish({
							resume_id: existingResume.id,
							job_id: scrapedJob.id,
							process_id: newResumeProcess.id,
							user_id: userId,
							job_url: jobUrl,
							triggered_at: new Date()
						})

						log.info('Resume tailoring triggered event published (retry, job ready)', {
							resume_id: existingResume.id,
							job_id: scrapedJob.id,
							user_id: userId
						})
					} catch (error) {
						const errorMessage = error instanceof Error ? error.message : 'Unknown error'
						log.error('Failed to publish resume tailoring triggered event', {
							resume_id: existingResume.id,
							job_id: scrapedJob.id,
							user_id: userId,
							error: errorMessage
						})
					}
				} else {
					log.info('Resume retry initiated, waiting for job scraping', {
						resume_id: existingResume.id,
						job_id: scrapedJob.id,
						job_status: scrapedJob.status,
						user_id: userId
					})
				}

				// Return the updated resume
				return this.getResumeById({id: existingResume.id})
			}

			// Resume exists and is not failed - return it as-is
			return this.getResumeById({id: existingResume.id})
		}

		// Create a new resume process for tracking tailoring
		const [resumeProcess] = await db
			.insert(resumeProcesses)
			.values({
				desc: 'Tailoring resume for job',
				status: ProcessStatus.Initiated,
				status_details: null
			})
			.returning()

		// Create a new non-base resume linked to the job
		const [newResume] = await db
			.insert(resumes)
			.values({
				user_id: userId,
				base: false,
				job_id: scrapedJob.id,
				status: ResumeStatus.Processing,
				process_id: resumeProcess.id
			})
			.returning()

		// Only publish tailoring triggered event if job scraping already succeeded
		if (scrapedJob.status === JobStatus.Success) {
			try {
				await resumeTailoringTriggered.publish({
					resume_id: newResume.id,
					job_id: scrapedJob.id,
					process_id: resumeProcess.id,
					user_id: userId,
					job_url: jobUrl,
					triggered_at: new Date()
				})

				log.info('Resume tailoring triggered event published (job ready)', {
					resume_id: newResume.id,
					job_id: scrapedJob.id,
					user_id: userId
				})
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : 'Unknown error'
				log.error('Failed to publish resume tailoring triggered event', {
					resume_id: newResume.id,
					job_id: scrapedJob.id,
					user_id: userId,
					error: errorMessage
				})
			}
		} else {
			// Job is still processing - event will be published when job scraping succeeds
			log.info('Resume created, waiting for job scraping to complete', {
				resume_id: newResume.id,
				job_id: scrapedJob.id,
				job_status: scrapedJob.status,
				user_id: userId
			})
		}

		// Get the full resume with sections
		return this.getResumeById({id: newResume.id})
	},

	/**
	 * Export resume to PDF and LaTeX
	 * Calls the util service to generate export files
	 */
	async exportResume({id}: ExportResumeParams): Promise<ExportResumeResponse> {
		// Fetch the full resume with all sections
		const resumeWithSections = await this.getResumeById({id})

		// Fetch user's country if country_id exists
		let userCountry: Country | null = null
		if (resumeWithSections.user.country_id) {
			try {
				userCountry = await this.lookupCountry(resumeWithSections.user.country_id.toString())
			} catch (error) {
			// Country lookup failed, log but continue with null
				log.warn('Failed to lookup user country for export', {
					user_id: resumeWithSections.user.id,
					country_id: resumeWithSections.user.country_id
				})

				// Report to Sentry - country lookup failures indicate data integrity issues
				captureException(error, {
					tags: {
						operation: 'country-lookup',
						user_id: resumeWithSections.user.id
					},
					extra: {
						country_id: resumeWithSections.user.country_id,
						resume_id: resumeWithSections.id
					},
					level: 'warning' // Warning since export continues without country
				})
			}
		}

		/*
		 * Transform resume data to match util service expected format
		 * Only transform fields that have different structure (like job salary)
		 */
		const exportPayload = {
			resume: {
				...resumeWithSections,
				user: {
					...resumeWithSections.user,
					country: userCountry // Include fetched country object
				},
				job: resumeWithSections.job
					? {
						...resumeWithSections.job,
						salary: {
							max: resumeWithSections.job.salary_max,
							min: resumeWithSections.job.salary_min,
							currency: resumeWithSections.job.currency
						}
					}
					: null,
				sections: resumeWithSections.sections
			},
			theme: 'DEFAULT_THEME'
		}

		log.info('Exporting resume', {
			resume_id: resumeWithSections.id,
			user_id: resumeWithSections.user.id,
			sections_count: resumeWithSections.sections.length,
			user_has_country: !!userCountry
		})

		// Call util service export endpoint
		try {
			const utilEndpoint = UtilServiceEndpoint()
			const response = await fetch(`${utilEndpoint}/resume/export`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(exportPayload)
			})

			if (!response.ok) {
				throw new Error(`Util service responded with status ${response.status}`)
			}

			const result = await response.json() as {
				status: string
				message?: string
				pdf_url?: string
				latex_url?: string
			}

			// Check if export failed
			if (result.status === 'FAILURE') {
				throw APIError.internal(`Export failed: ${result.message || 'Unknown error'}`)
			}

			// Validate response has required URLs
			if (!result.pdf_url || !result.latex_url) {
				throw APIError.internal('Export response missing PDF or LaTeX URL')
			}

			log.info('Resume export completed successfully', {
				resume_id: resumeWithSections.id,
				user_id: resumeWithSections.user.id,
				pdf_url: result.pdf_url,
				latex_url: result.latex_url
			})

			// Publish resume export success event
			try {
				await resumeExportSuccess.publish({
					resume_id: resumeWithSections.id,
					user_id: resumeWithSections.user.id,
					exported_at: new Date()
				})
			} catch (error) {
				log.warn('Failed to publish resume export success event', {
					resume_id: resumeWithSections.id,
					error: error instanceof Error ? error.message : String(error)
				})
			}

			return {
				pdf_url: result.pdf_url,
				latex_url: result.latex_url
			}
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Unknown error'
			log.error(error as Error, 'Failed to export resume', {
				resume_id: resumeWithSections.id,
				user_id: resumeWithSections.user.id,
				error: errorMessage
			})

			// Publish resume export failure event
			try {
				await resumeExportFailed.publish({
					resume_id: resumeWithSections.id,
					user_id: resumeWithSections.user.id,
					error_message: errorMessage,
					failed_at: new Date()
				})
			} catch (publishError) {
				log.warn('Failed to publish resume export failure event', {
					resume_id: resumeWithSections.id,
					error: publishError instanceof Error ? publishError.message : String(publishError)
				})
			}

			// Report export failures to Sentry - this is a critical user-facing feature
			if (!(error instanceof APIError)) {
				captureException(error, {
					tags: {
						operation: 'resume-export',
						resume_id: resumeWithSections.id,
						user_id: resumeWithSections.user.id
					},
					extra: {
						error_message: errorMessage,
						has_job: !!resumeWithSections.job
					},
					level: 'error'
				})
			}

			if (error instanceof APIError) {
				throw error
			}

			throw APIError.internal(`Failed to export resume: ${errorMessage}`)
		}
	},

	/**
	 * Delete all resumes for a user
	 * Used when a user is deleted from the system
	 */
	deleteAllUserResumes: async (userId: string): Promise<number> => {
		const deletedResumes = await db.delete(resumes).where(eq(resumes.user_id, userId)).returning()

		log.info('Deleted all resumes for user', {
			user_id: userId,
			count: deletedResumes.length
		})

		return deletedResumes.length
	},

	/**
	 * Clear resume service database
	 * Deletes all data from all resume-related tables
	 *
	 * Tables cleared (in order to handle foreign key constraints):
	 * - proficiencies (references skills and resume_sections)
	 * - project_skills (references projects and skills)
	 * - certifications (references resume_sections)
	 * - projects (references resume_sections)
	 * - experiences (references resume_sections)
	 * - educations (references resume_sections)
	 * - resume_sections (references resumes)
	 * - resumes (references resume_processes)
	 * - skill_aliases (references skills)
	 * - skills (standalone master table)
	 * - resume_processes (standalone process tracking)
	 *
	 * WARNING: This is a destructive operation and cannot be undone
	 */
	clearDatabase: async (): Promise<ClearDatabaseResponse> => {
		const timestamp = new Date().toISOString()
		const clearedTables: string[] = []

		log.info('Starting resume database clearing operation')

		try {
			// Clear in order to respect foreign key constraints

			// 1. Clear proficiencies (references skills and resume_sections)
			await db.delete(proficiencies)
			clearedTables.push('proficiencies')
			log.info('Cleared proficiencies table')

			// 2. Clear project_skills (references projects and skills)
			await db.delete(projectSkills)
			clearedTables.push('project_skills')
			log.info('Cleared project_skills table')

			// 3. Clear certifications (references resume_sections)
			await db.delete(certifications)
			clearedTables.push('certifications')
			log.info('Cleared certifications table')

			// 4. Clear projects (references resume_sections)
			await db.delete(projects)
			clearedTables.push('projects')
			log.info('Cleared projects table')

			// 5. Clear experiences (references resume_sections)
			await db.delete(experiences)
			clearedTables.push('experiences')
			log.info('Cleared experiences table')

			// 6. Clear educations (references resume_sections)
			await db.delete(educations)
			clearedTables.push('educations')
			log.info('Cleared educations table')

			// 7. Clear resume_sections (references resumes)
			await db.delete(resumeSections)
			clearedTables.push('resume_sections')
			log.info('Cleared resume_sections table')

			// 8. Clear resumes (references resume_processes)
			await db.delete(resumes)
			clearedTables.push('resumes')
			log.info('Cleared resumes table')

			// 9. Clear skills table (master table, referenced by many)
			await db.delete(skills)
			clearedTables.push('skills')
			log.info('Cleared skills table')

			// 10. Clear resume_processes (standalone process tracking)
			await db.delete(resumeProcesses)
			clearedTables.push('resume_processes')
			log.info('Cleared resume_processes table')

			log.info('Resume database clearing operation completed', {
				cleared_tables: clearedTables,
				timestamp
			})

			return {
				success: true,
				message: `Successfully cleared ${clearedTables.length} table(s) from resume database`,
				cleared_tables: clearedTables,
				timestamp
			}
		} catch (error) {
			log.error(error as Error, 'Failed to clear resume database', {
				cleared_tables: clearedTables,
				timestamp
			})
			throw error
		}
	}

}
