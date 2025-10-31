import {APIError} from 'encore.dev/api'
import {db} from '@/services/resume/database'
import {certifications, resumeSections, ResumeSectionType} from '@/services/resume/schema'
import type {
	Certification,
	CertificationCreateRequest,
	CertificationPathParams,
	CertificationResponse,
	CertificationUpdateRequest,
	CertificationWithIdParams
} from '@/services/resume/interface'
import {ResumeService} from '@/services/resume/service'
import {and, eq} from 'drizzle-orm'

/**
 * Certification Service
 * Handles all CRUD operations for certification entries
 *
 * Key responsibilities:
 * - Manage certification lifecycle
 * - Validate required fields
 * - Auto-create resume sections
 * - Return clean responses without internal fields
 */

/**
 * Helper Functions
 * Internal utilities for certification operations
 */
export const CertificationHelpers = {
	/**
	 * Parse and validate date input
	 * Accepts Date objects or date strings, returns Date object or null
	 */
	parseDate: (dateInput: any): Date | null => {
		if (dateInput === undefined || dateInput === null) {
			return null
		}

		if (dateInput instanceof Date) {
			return dateInput
		}

		if (typeof dateInput === 'string') {
			const parsed = new Date(dateInput)
			if (isNaN(parsed.getTime())) {
				throw APIError.invalidArgument('Invalid date format. Expected ISO date string (e.g., "2023-11-10")')
			}
			return parsed
		}

		throw APIError.invalidArgument('Date must be a string or Date object')
	},

	/**
	 * Get and verify certification exists and belongs to resume
	 * Returns the certification record
	 */
	getAndVerifyCertification: async (id: string, resumeId: string) => {
		// Validate UUID format
		ResumeService.validateUUID(id, 'Certification')

		// Get certification
		const certificationQuery = await db.select().from(certifications).where(eq(certifications.id, id)).limit(1)

		if (certificationQuery.length === 0) {
			throw APIError.notFound(`Certification with ID '${id}' not found`)
		}

		const certification = certificationQuery[0]

		// Verify certification belongs to a section in this resume
		const sectionQuery = await db
			.select()
			.from(resumeSections)
			.where(and(eq(resumeSections.id, certification.resume_section_id), eq(resumeSections.resume_id, resumeId)))
			.limit(1)

		if (sectionQuery.length === 0) {
			throw APIError.notFound(`Certification with ID '${id}' not found in resume '${resumeId}'`)
		}

		return certification
	},

	/**
	 * Build clean certification response
	 * Removes internal fields and formats date as ISO string (YYYY-MM-DD)
	 */
	buildCertificationResponse: (cert: typeof certifications.$inferSelect): Certification => {
		return {
			id: cert.id,
			user: cert.user_id,
			resume_section: cert.resume_section_id,
			name: cert.name,
			issuing_organization: cert.issuing_organization,
			issue_date: cert.issue_date ? cert.issue_date.toISOString().split('T')[0] : null,
			credential_url: cert.credential_url,
			created_at: cert.created_at,
			updated_at: cert.updated_at
		}
	}
}

/**
 * Certification Service
 * Public API for certification operations
 */
export const CertificationService = {
	/**
	 * List all certifications for a resume
	 */
	listCertifications: async ({resume_id}: CertificationPathParams): Promise<{certifications: CertificationResponse[]}> => {
		const resumeId = await ResumeService.resolveResumeId(resume_id)
		await ResumeService.verifyResumeOwnership(resumeId)

		// Get all certification sections for this resume
		const sections = await db
			.select()
			.from(resumeSections)
			.where(and(eq(resumeSections.resume_id, resumeId), eq(resumeSections.type, ResumeSectionType.Certification)))
			.orderBy(resumeSections.index)

		// Get certifications for each section
		const certificationQueries = await Promise.all(
			sections.map(section => db.select().from(certifications).where(eq(certifications.resume_section_id, section.id)).limit(1))
		)

		// Build clean certification list
		const validCertifications: Certification[] = []
		certificationQueries.forEach(certQuery => {
			if (certQuery.length > 0) {
				validCertifications.push(CertificationHelpers.buildCertificationResponse(certQuery[0]))
			}
		})

		return {certifications: validCertifications}
	},

	/**
	 * Get specific certification by ID
	 */
	getCertificationById: async ({resume_id, id}: CertificationWithIdParams): Promise<CertificationResponse> => {
		const resumeId = await ResumeService.resolveResumeId(resume_id)
		await ResumeService.verifyResumeOwnership(resumeId)

		// Get and verify certification
		const certification = await CertificationHelpers.getAndVerifyCertification(id, resumeId)

		return CertificationHelpers.buildCertificationResponse(certification)
	},

	/**
	 * Create new certification entry
	 * Auto-creates resume section
	 */
	createCertification: async ({
		resume_id,
		...data
	}: CertificationPathParams & CertificationCreateRequest): Promise<CertificationResponse> => {
		const userId = ResumeService.getAuthenticatedUserId()
		const resumeId = await ResumeService.resolveResumeId(resume_id)
		await ResumeService.verifyResumeOwnership(resumeId)

		// Validate required field
		if (!data.name || data.name.trim() === '') {
			throw APIError.invalidArgument('Certification name is required')
		}

		// Create section
		const sectionId = await ResumeService.createSectionForResume(resumeId, ResumeSectionType.Certification)

		// Parse date if provided
		const parsedDate = CertificationHelpers.parseDate(data.issue_date)

		// Create certification
		const [certification] = await db
			.insert(certifications)
			.values({
				user_id: userId,
				resume_section_id: sectionId,
				name: data.name.trim(),
				issuing_organization: data.issuing_organization?.trim() || null,
				issue_date: parsedDate,
				credential_url: data.credential_url || null
			})
			.returning()

		// Publish event for thumbnail generation
		await ResumeService.publishResumeUpdate({
			resumeId,
			changeType: 'section_added',
			sectionType: 'Certification',
			sectionId: certification.id
		})

		return CertificationHelpers.buildCertificationResponse(certification)
	},

	/**
	 * Update certification entry
	 * Supports partial updates
	 */
	updateCertification: async ({
		resume_id,
		id,
		...data
	}: CertificationWithIdParams & CertificationUpdateRequest): Promise<CertificationResponse> => {
		const resumeId = await ResumeService.resolveResumeId(resume_id)
		await ResumeService.verifyResumeOwnership(resumeId)

		// Get and verify certification
		await CertificationHelpers.getAndVerifyCertification(id, resumeId)

		// Build update data (partial update)
		const updateData: Partial<typeof certifications.$inferInsert> = {}
		if (data.name !== undefined) {
			if (data.name.trim() === '') {
				throw APIError.invalidArgument('Certification name cannot be empty')
			}
			updateData.name = data.name.trim()
		}
		if (data.issuing_organization !== undefined) {
			updateData.issuing_organization = data.issuing_organization?.trim() || null
		}
		if (data.issue_date !== undefined) {
			// Parse and validate date
			updateData.issue_date = CertificationHelpers.parseDate(data.issue_date)
		}
		if (data.credential_url !== undefined) {
			updateData.credential_url = data.credential_url || null
		}

		// Update certification
		const [updatedCertification] = await db
			.update(certifications)
			.set(updateData)
			.where(eq(certifications.id, id))
			.returning()

		// Track which major fields changed
		const changedFields = Object.keys(updateData).filter(field => ['name', 'issuing_organization'].includes(field))

		// Publish event for thumbnail generation
		if (changedFields.length > 0 || Object.keys(updateData).length > 0) {
			await ResumeService.publishResumeUpdate({
				resumeId,
				changeType: 'section_updated',
				sectionType: 'Certification',
				sectionId: id,
				changedFields
			})
		}

		return CertificationHelpers.buildCertificationResponse(updatedCertification)
	},

	/**
	 * Delete certification entry
	 * Cascade deletes ResumeSection via FK
	 */
	deleteCertification: async ({resume_id, id}: CertificationWithIdParams): Promise<void> => {
		const resumeId = await ResumeService.resolveResumeId(resume_id)
		await ResumeService.verifyResumeOwnership(resumeId)

		// Get and verify certification
		const certification = await CertificationHelpers.getAndVerifyCertification(id, resumeId)

		// Delete section (cascades to certification via FK)
		await db.delete(resumeSections).where(eq(resumeSections.id, certification.resume_section_id))

		// Publish event for thumbnail generation
		await ResumeService.publishResumeUpdate({
			resumeId,
			changeType: 'section_removed',
			sectionType: 'Certification',
			sectionId: id
		})
	}
}

