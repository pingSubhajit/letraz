import {and, eq} from 'drizzle-orm'
import {APIError} from 'encore.dev/api'
import {db} from '@/services/resume/database'
import type {
	Education,
	EducationCreateRequest,
	EducationPathParams,
	EducationResponse,
	EducationUpdateRequest,
	EducationWithIdParams
} from '@/services/resume/interface'
import type {Country} from '@/services/core/interface'
import {educations, resumeSections, ResumeSectionType} from '@/services/resume/schema'
import {ResumeService} from '@/services/resume/service'
import log from 'encore.dev/log'

/**
 * Helper Functions
 * Internal utilities for education operations
 */
export const EducationHelpers = {
	/**
	 * Build education response with country data
	 */
	buildEducationResponse: (education: Education, country: Country | null): EducationResponse => {
		return {
			...education,
			country,
			user: education.user_id,
			resume_section: education.resume_section_id
		}
	}
}

/**
 * Education Service
 * Handles all CRUD operations for education entries
 */
export const EducationService = {
	/**
	 * List all educations for a resume
	 */
	listEducations: async ({resume_id}: EducationPathParams): Promise<{educations: EducationResponse[]}> => {
		const resumeId = await ResumeService.resolveResumeId(resume_id)
		await ResumeService.verifyResumeOwnership(resumeId)

		// Get all education sections for this resume
		const sections = await db
			.select()
			.from(resumeSections)
			.where(and(eq(resumeSections.resume_id, resumeId), eq(resumeSections.type, ResumeSectionType.Education)))
			.orderBy(resumeSections.index)

		// Fetch all education data in parallel
		const educationQueries = await Promise.all(
			sections.map(section => db.select().from(educations).where(eq(educations.resume_section_id, section.id)).limit(1))
		)

		// Collect all unique country codes
		const countryCodes: string[] = []
		educationQueries.forEach(eduQuery => {
			if (eduQuery.length > 0 && eduQuery[0].country_code) {
				countryCodes.push(eduQuery[0].country_code)
			}
		})

		// Batch lookup all countries
		const countryMap = await ResumeService.batchLookupCountries(countryCodes)

		// Build education list with country data
		const validEducations: EducationResponse[] = []
		educationQueries.forEach(eduQuery => {
			if (eduQuery.length > 0) {
				const edu = eduQuery[0]
				const country = edu.country_code ? countryMap.get(edu.country_code) || null : null

				validEducations.push(EducationHelpers.buildEducationResponse(edu, country))
			}
		})

		return {educations: validEducations}
	},

	/**
	 * Get specific education by ID
	 */
	getEducationById: async ({resume_id, id}: EducationWithIdParams): Promise<EducationResponse> => {
		// Validate UUID format
		ResumeService.validateUUID(id, 'Education')

		const resumeId = await ResumeService.resolveResumeId(resume_id)
		await ResumeService.verifyResumeOwnership(resumeId)

		// Get education
		const eduQuery = await db.select().from(educations).where(eq(educations.id, id)).limit(1)

		if (eduQuery.length === 0) {
			throw APIError.notFound(`Education with ID '${id}' not found`)
		}

		const edu = eduQuery[0]

		// Verify education belongs to a section in this resume
		const sectionQuery = await db
			.select()
			.from(resumeSections)
			.where(and(eq(resumeSections.id, edu.resume_section_id), eq(resumeSections.resume_id, resumeId)))
			.limit(1)

		if (sectionQuery.length === 0) {
			throw APIError.notFound(`Education with ID '${id}' not found in resume '${resumeId}'`)
		}

		// Lookup country if present
		let country = null
		if (edu.country_code) {
			try {
				country = await ResumeService.lookupCountry(edu.country_code)
			} catch {
				// Country lookup failed, leave as null
			}
		}

		return EducationHelpers.buildEducationResponse(edu, country)
	},

	/**
	 * Create new education entry
	 */
	createEducation: async ({resume_id, ...data}: EducationPathParams & EducationCreateRequest): Promise<EducationResponse> => {
		const userId = ResumeService.getAuthenticatedUserId()
		const resumeId = await ResumeService.resolveResumeId(resume_id)
		await ResumeService.verifyResumeOwnership(resumeId)

		// Validate date ranges
		ResumeService.validateDateRange(data.started_from_month, data.started_from_year)
		ResumeService.validateDateRange(data.finished_at_month, data.finished_at_year)

		// Resolve country (handles both country and country_code fields)
		const {country_code, country} = await ResumeService.resolveCountry(data.country, data.country_code)

		// Create section
		const sectionId = await ResumeService.createSectionForResume(resumeId, ResumeSectionType.Education)

		log.info('Education section created in DB')

		// Create education
		const [edu] = await db
			.insert(educations)
			.values({
				user_id: userId,
				resume_section_id: sectionId,
				institution_name: data.institution_name,
				field_of_study: data.field_of_study,
				degree: data.degree || null,
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
			sectionType: 'Education',
			sectionId: edu.id
		})

		return EducationHelpers.buildEducationResponse(edu, country)
	},

	/**
	 * Update education entry
	 */
	updateEducation: async ({resume_id, id, ...data}: EducationWithIdParams & EducationUpdateRequest): Promise<EducationResponse> => {
		// Validate UUID format
		ResumeService.validateUUID(id, 'Education')

		const resumeId = await ResumeService.resolveResumeId(resume_id)
		await ResumeService.verifyResumeOwnership(resumeId)

		// Verify education exists and belongs to this resume
		const eduQuery = await db.select().from(educations).where(eq(educations.id, id)).limit(1)

		if (eduQuery.length === 0) {
			throw APIError.notFound(`Education with ID '${id}' not found`)
		}

		const existingEdu = eduQuery[0]

		// Verify section belongs to this resume
		const sectionQuery = await db
			.select()
			.from(resumeSections)
			.where(and(eq(resumeSections.id, existingEdu.resume_section_id), eq(resumeSections.resume_id, resumeId)))
			.limit(1)

		if (sectionQuery.length === 0) {
			throw APIError.notFound(`Education with ID '${id}' not found in resume '${resumeId}'`)
		}

		// Validate date ranges if provided
		if (data.started_from_month !== undefined || data.started_from_year !== undefined) {
			ResumeService.validateDateRange(
				data.started_from_month ?? existingEdu.started_from_month,
				data.started_from_year ?? existingEdu.started_from_year
			)
		}
		if (data.finished_at_month !== undefined || data.finished_at_year !== undefined) {
			ResumeService.validateDateRange(
				data.finished_at_month ?? existingEdu.finished_at_month,
				data.finished_at_year ?? existingEdu.finished_at_year
			)
		}

		// Resolve country if changed (handles both country and country_code fields)
		let country = null
		let resolvedCountryCode = existingEdu.country_code

		if (data.country !== undefined || data.country_code !== undefined) {
			const resolved = await ResumeService.resolveCountry(data.country, data.country_code)
			country = resolved.country
			resolvedCountryCode = resolved.country_code
		} else if (existingEdu.country_code) {
			// If country not changed but exists, fetch it for response
			try {
				country = await ResumeService.lookupCountry(existingEdu.country_code)
			} catch {
				// Country lookup failed, leave as null
			}
		}

		// Update education (partial update)
		const updateData: any = {}
		if (data.institution_name !== undefined) updateData.institution_name = data.institution_name
		if (data.field_of_study !== undefined) updateData.field_of_study = data.field_of_study
		if (data.degree !== undefined) updateData.degree = data.degree
		if (data.country !== undefined || data.country_code !== undefined) updateData.country_code = resolvedCountryCode
		if (data.started_from_month !== undefined) updateData.started_from_month = ResumeService.parseNumericValue(data.started_from_month)
		if (data.started_from_year !== undefined) updateData.started_from_year = ResumeService.parseNumericValue(data.started_from_year)
		if (data.finished_at_month !== undefined) updateData.finished_at_month = ResumeService.parseNumericValue(data.finished_at_month)
		if (data.finished_at_year !== undefined) updateData.finished_at_year = ResumeService.parseNumericValue(data.finished_at_year)
		if (data.current !== undefined) updateData.current = data.current
		if (data.description !== undefined) updateData.description = data.description

		const [updatedEdu] = await db.update(educations).set(updateData).where(eq(educations.id, id)).returning()

		// Track which major fields changed
		const changedFields = Object.keys(updateData).filter(field => ['institution_name', 'field_of_study', 'degree', 'country_code'].includes(field))

		// Publish event for thumbnail generation
		if (changedFields.length > 0 || Object.keys(updateData).length > 0) {
			await ResumeService.publishResumeUpdate({
				resumeId,
				changeType: 'section_updated',
				sectionType: 'Education',
				sectionId: id,
				changedFields
			})
		}

		return EducationHelpers.buildEducationResponse(updatedEdu, country)
	},

	/**
	 * Delete education entry
	 * Also deletes associated ResumeSection (cascade)
	 */
	deleteEducation: async ({resume_id, id}: EducationWithIdParams): Promise<void> => {
		// Validate UUID format
		ResumeService.validateUUID(id, 'Education')

		const resumeId = await ResumeService.resolveResumeId(resume_id)
		await ResumeService.verifyResumeOwnership(resumeId)

		// Get education
		const eduQuery = await db.select().from(educations).where(eq(educations.id, id)).limit(1)

		if (eduQuery.length === 0) {
			throw APIError.notFound(`Education with ID '${id}' not found`)
		}

		const edu = eduQuery[0]

		// Verify section belongs to this resume
		const sectionQuery = await db
			.select()
			.from(resumeSections)
			.where(and(eq(resumeSections.id, edu.resume_section_id), eq(resumeSections.resume_id, resumeId)))
			.limit(1)

		if (sectionQuery.length === 0) {
			throw APIError.notFound(`Education with ID '${id}' not found in resume '${resumeId}'`)
		}

		// Delete section (cascades to education via FK)
		await db.delete(resumeSections).where(eq(resumeSections.id, edu.resume_section_id))

		// Publish event for thumbnail generation
		await ResumeService.publishResumeUpdate({
			resumeId,
			changeType: 'section_removed',
			sectionType: 'Education',
			sectionId: id
		})
	}
}

