import {and, eq} from 'drizzle-orm'
import {APIError} from 'encore.dev/api'
import {db} from '@/services/resume/database'
import type {
	Experience,
	ExperienceCreateRequest,
	ExperiencePathParams,
	ExperienceResponse,
	ExperienceUpdateRequest,
	ExperienceWithIdParams
} from '@/services/resume/interface'
import type {Country} from '@/services/core/interface'
import {EmploymentTypeLabels, experiences, resumeSections, ResumeSectionType} from '@/services/resume/schema'
import {ResumeService} from '@/services/resume/service'

/**
 * Helper Functions
 * Internal utilities for experience operations
 */
export const ExperienceHelpers = {
	/**
	 * Build experience response with country data
	 */
	buildExperienceResponse: (experience: Experience, country: Country | null): ExperienceResponse => {
		const {employment_type, user_id, resume_section_id, country_code, ...rest} = experience
		return {
			...rest,
			country,
			user: user_id,
			resume_section: resume_section_id,
			employment_type: EmploymentTypeLabels[employment_type]
		}
	}
}

/**
 * Experience Service
 * Handles all CRUD operations for experience entries
 */
export const ExperienceService = {
	/**
	 * List all experiences for a resume
	 */
	listExperiences: async ({resume_id}: ExperiencePathParams): Promise<{experiences: ExperienceResponse[]}> => {
		const resumeId = await ResumeService.resolveResumeId(resume_id)
		await ResumeService.verifyResumeOwnership(resumeId)

		// Get all experience sections for this resume
		const sections = await db
			.select()
			.from(resumeSections)
			.where(and(eq(resumeSections.resume_id, resumeId), eq(resumeSections.type, ResumeSectionType.Experience)))
			.orderBy(resumeSections.index)

		// Fetch all experience data in parallel
		const experienceQueries = await Promise.all(
			sections.map(section => db.select().from(experiences).where(eq(experiences.resume_section_id, section.id)).limit(1))
		)

		// Collect all unique country codes
		const countryCodes: string[] = []
		experienceQueries.forEach(expQuery => {
			if (expQuery.length > 0 && expQuery[0].country_code) {
				countryCodes.push(expQuery[0].country_code)
			}
		})

		// Batch lookup all countries
		const countryMap = await ResumeService.batchLookupCountries(countryCodes)

		// Build experience list with country data
		const validExperiences: ExperienceResponse[] = []
		experienceQueries.forEach(expQuery => {
			if (expQuery.length > 0) {
				const exp = expQuery[0]
				const country = exp.country_code ? countryMap.get(exp.country_code) || null : null

				validExperiences.push(ExperienceHelpers.buildExperienceResponse(exp, country))
			}
		})

		return {experiences: validExperiences}
	},

	/**
	 * Get specific experience by ID
	 */
	getExperienceById: async ({resume_id, id}: ExperienceWithIdParams): Promise<ExperienceResponse> => {
		// Validate UUID format
		ResumeService.validateUUID(id, 'Experience')

		const resumeId = await ResumeService.resolveResumeId(resume_id)
		await ResumeService.verifyResumeOwnership(resumeId)

		// Get experience
		const expQuery = await db.select().from(experiences).where(eq(experiences.id, id)).limit(1)

		if (expQuery.length === 0) {
			throw APIError.notFound(`Experience with ID '${id}' not found`)
		}

		const exp = expQuery[0]

		// Verify experience belongs to a section in this resume
		const sectionQuery = await db
			.select()
			.from(resumeSections)
			.where(and(eq(resumeSections.id, exp.resume_section_id), eq(resumeSections.resume_id, resumeId)))
			.limit(1)

		if (sectionQuery.length === 0) {
			throw APIError.notFound(`Experience with ID '${id}' not found in resume '${resumeId}'`)
		}

		// Lookup country if present
		let country = null
		if (exp.country_code) {
			try {
				country = await ResumeService.lookupCountry(exp.country_code)
			} catch {
				// Country lookup failed, leave as null
			}
		}

		return ExperienceHelpers.buildExperienceResponse(exp, country)
	},

	/**
	 * Create new experience entry
	 */
	createExperience: async ({
		resume_id,
		...data
	}: ExperiencePathParams & ExperienceCreateRequest): Promise<ExperienceResponse> => {
		const userId = ResumeService.getAuthenticatedUserId()
		const resumeId = await ResumeService.resolveResumeId(resume_id)
		await ResumeService.verifyResumeOwnership(resumeId)

		// Validate date ranges
		ResumeService.validateDateRange(data.started_from_month, data.started_from_year)
		ResumeService.validateDateRange(data.finished_at_month, data.finished_at_year)

		// Resolve country (handles both country and country_code fields)
		const {country_code, country} = await ResumeService.resolveCountry(data.country, data.country_code)

		// Create section
		const sectionId = await ResumeService.createSectionForResume(resumeId, ResumeSectionType.Experience)

		// Create experience
		const [exp] = await db
			.insert(experiences)
			.values({
				user_id: userId,
				resume_section_id: sectionId,
				company_name: data.company_name,
				job_title: data.job_title,
				employment_type: data.employment_type,
				city: data.city || null,
				country_code,
				started_from_month: ResumeService.parseNumericValue(data.started_from_month),
				started_from_year: ResumeService.parseNumericValue(data.started_from_year),
				finished_at_month: ResumeService.parseNumericValue(data.finished_at_month),
				finished_at_year: ResumeService.parseNumericValue(data.finished_at_year),
				current: data.current || false,
				description: data.description || null
			})
			.returning()

		// Publish event for thumbnail generation
		await ResumeService.publishResumeUpdate({
			resumeId,
			changeType: 'section_added',
			sectionType: 'Experience',
			sectionId: exp.id
		})

		return ExperienceHelpers.buildExperienceResponse(exp, country)
	},

	/**
	 * Update experience entry
	 */
	updateExperience: async ({
		resume_id,
		id,
		...data
	}: ExperienceWithIdParams & ExperienceUpdateRequest): Promise<ExperienceResponse> => {
		// Validate UUID format
		ResumeService.validateUUID(id, 'Experience')

		const resumeId = await ResumeService.resolveResumeId(resume_id)
		await ResumeService.verifyResumeOwnership(resumeId)

		// Verify experience exists and belongs to this resume
		const expQuery = await db.select().from(experiences).where(eq(experiences.id, id)).limit(1)

		if (expQuery.length === 0) {
			throw APIError.notFound(`Experience with ID '${id}' not found`)
		}

		const existingExp = expQuery[0]

		// Verify section belongs to this resume
		const sectionQuery = await db
			.select()
			.from(resumeSections)
			.where(and(eq(resumeSections.id, existingExp.resume_section_id), eq(resumeSections.resume_id, resumeId)))
			.limit(1)

		if (sectionQuery.length === 0) {
			throw APIError.notFound(`Experience with ID '${id}' not found in resume '${resumeId}'`)
		}

		// Validate date ranges if provided
		if (data.started_from_month !== undefined || data.started_from_year !== undefined) {
			ResumeService.validateDateRange(
				data.started_from_month ?? existingExp.started_from_month,
				data.started_from_year ?? existingExp.started_from_year
			)
		}
		if (data.finished_at_month !== undefined || data.finished_at_year !== undefined) {
			ResumeService.validateDateRange(
				data.finished_at_month ?? existingExp.finished_at_month,
				data.finished_at_year ?? existingExp.finished_at_year
			)
		}

		// Resolve country if changed (handles both country and country_code fields)
		let country = null
		let resolvedCountryCode = existingExp.country_code

		if (data.country !== undefined || data.country_code !== undefined) {
			const resolved = await ResumeService.resolveCountry(data.country, data.country_code)
			country = resolved.country
			resolvedCountryCode = resolved.country_code
		} else if (existingExp.country_code) {
			// If country not changed but exists, fetch it for response
			try {
				country = await ResumeService.lookupCountry(existingExp.country_code)
			} catch {
				// Country lookup failed, leave as null
			}
		}

		// Update experience (partial update)
		const updateData: any = {}
		if (data.company_name !== undefined) updateData.company_name = data.company_name
		if (data.job_title !== undefined) updateData.job_title = data.job_title
		if (data.employment_type !== undefined) updateData.employment_type = data.employment_type
		if (data.city !== undefined) updateData.city = data.city
		if (data.country !== undefined || data.country_code !== undefined) updateData.country_code = resolvedCountryCode
		if (data.started_from_month !== undefined) updateData.started_from_month = ResumeService.parseNumericValue(data.started_from_month)
		if (data.started_from_year !== undefined) updateData.started_from_year = ResumeService.parseNumericValue(data.started_from_year)
		if (data.finished_at_month !== undefined) updateData.finished_at_month = ResumeService.parseNumericValue(data.finished_at_month)
		if (data.finished_at_year !== undefined) updateData.finished_at_year = ResumeService.parseNumericValue(data.finished_at_year)
		if (data.current !== undefined) updateData.current = data.current
		if (data.description !== undefined) updateData.description = data.description

		const [updatedExp] = await db.update(experiences).set(updateData).where(eq(experiences.id, id)).returning()

		// Track which major fields changed
		const changedFields = Object.keys(updateData).filter(field => ['company_name', 'job_title', 'employment_type', 'city', 'country_code'].includes(field))

		// Publish event for thumbnail generation
		if (changedFields.length > 0 || Object.keys(updateData).length > 0) {
			await ResumeService.publishResumeUpdate({
				resumeId,
				changeType: 'section_updated',
				sectionType: 'Experience',
				sectionId: id,
				changedFields
			})
		}

		return ExperienceHelpers.buildExperienceResponse(updatedExp, country)
	},

	/**
	 * Delete experience entry
	 * Also deletes associated ResumeSection (cascade)
	 */
	deleteExperience: async ({resume_id, id}: ExperienceWithIdParams): Promise<void> => {
		// Validate UUID format
		ResumeService.validateUUID(id, 'Experience')

		const resumeId = await ResumeService.resolveResumeId(resume_id)
		await ResumeService.verifyResumeOwnership(resumeId)

		// Get experience
		const expQuery = await db.select().from(experiences).where(eq(experiences.id, id)).limit(1)

		if (expQuery.length === 0) {
			throw APIError.notFound(`Experience with ID '${id}' not found`)
		}

		const exp = expQuery[0]

		// Verify section belongs to this resume
		const sectionQuery = await db
			.select()
			.from(resumeSections)
			.where(and(eq(resumeSections.id, exp.resume_section_id), eq(resumeSections.resume_id, resumeId)))
			.limit(1)

		if (sectionQuery.length === 0) {
			throw APIError.notFound(`Experience with ID '${id}' not found in resume '${resumeId}'`)
		}

		// Delete section (cascades to experience via FK)
		await db.delete(resumeSections).where(eq(resumeSections.id, exp.resume_section_id))

		// Publish event for thumbnail generation
		await ResumeService.publishResumeUpdate({
			resumeId,
			changeType: 'section_removed',
			sectionType: 'Experience',
			sectionId: id
		})
	}
}

