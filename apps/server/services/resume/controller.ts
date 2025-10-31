import {api} from 'encore.dev/api'
import type {
	AddSkillRequest,
	CertificationCreateRequest,
	CertificationPathParams,
	CertificationResponse,
	CertificationUpdateRequest,
	CertificationWithIdParams,
	ClearDatabaseResponse,
	DeleteResumeParams,
	EducationCreateRequest,
	EducationPathParams,
	EducationResponse,
	EducationUpdateRequest,
	EducationWithIdParams,
	ExperienceCreateRequest,
	ExperiencePathParams,
	ExperienceResponse,
	ExperienceUpdateRequest,
	ExperienceWithIdParams,
	ExportResumeParams,
	ExportResumeResponse,
	GetResumeParams,
	GlobalSkillCategoriesResponse,
	ListResumesParams,
	ProjectCreateRequest,
	ProjectPathParams,
	ProjectResponse,
	ProjectUpdateRequest,
	ProjectWithIdParams,
	RearrangeSectionsRequest,
	ReplaceResumeRequest,
	ResumeMinimal,
	ResumeResponse,
	ResumeShort,
	Skill,
	SkillCategoriesResponse,
	SkillPathParams,
	SkillResponse,
	SkillWithIdParams,
	TailorResumeRequest,
	UpdateSkillRequest
} from '@/services/resume/interface'
import {ResumeService} from '@/services/resume/service'
import {EducationService} from '@/services/resume/services/education.service'
import {ExperienceService} from '@/services/resume/services/experience.service'
import {SkillService} from '@/services/resume/services/skill.service'
import {ProjectService} from '@/services/resume/services/project.service'
import {CertificationService} from '@/services/resume/services/certification.service'
import {BulkReplaceService} from '@/services/resume/services/bulk-replace.service'
import log from 'encore.dev/log'

/**
 * List all resumes for authenticated user
 * Supports pagination and filtering by status/base
 * GET /resume
 */
export const listResumes = api(
	{method: 'GET', path: '/resume', auth: true, expose: true},
	async (params: ListResumesParams): Promise<{resumes: ResumeShort[]}> => {
		return ResumeService.listResumes(params)
	}
)

/**
 * Get resume by ID with all sections
 * Supports 'base' as ID to get base resume
 * GET /resume/:id
 */
export const getResume = api(
	{method: 'GET', path: '/resume/:id', auth: true, expose: true},
	async ({id}: GetResumeParams): Promise<ResumeResponse> => {
		return ResumeService.getResumeById({id})
	}
)

/**
 * Get minimal resume data by ID
 * Fast endpoint that returns only essential resume information
 * without fetching sections or nested data
 * GET /resume/:id/minimal
 */
export const getResumeMinimal = api(
	{method: 'GET', path: '/resume/:id/minimal', auth: true, expose: true},
	async ({id}: GetResumeParams): Promise<ResumeMinimal> => {
		return ResumeService.getResumeMinimal({id})
	}
)

/**
 * Export resume as PDF and LaTeX
 * Sends resume data to util service for export
 * GET /resume/:id/export
 */
export const exportResume = api(
	{method: 'GET', path: '/resume/:id/export', auth: true, expose: true},
	async ({id}: ExportResumeParams): Promise<ExportResumeResponse> => {
		return ResumeService.exportResume({id})
	}
)

/**
 * Delete resume by ID
 * Cannot delete base resume
 * DELETE /resume/:id
 */
export const deleteResume = api(
	{method: 'DELETE', path: '/resume/:id', auth: true, expose: true},
	async ({id}: DeleteResumeParams): Promise<void> => {
		await ResumeService.deleteResume({id})
	}
)

/**
 * ==========================================
 * EDUCATION ENDPOINTS
 * ==========================================
 */

/**
 * List all educations for a resume
 * GET /resume/:resume_id/education
 */
export const listEducations = api(
	{method: 'GET', path: '/resume/:resume_id/education', auth: true, expose: true},
	async ({resume_id}: EducationPathParams): Promise<{educations: EducationResponse[]}> => {
		return EducationService.listEducations({resume_id})
	}
)

/**
 * Get specific education by ID
 * GET /resume/:resume_id/education/:id
 */
export const getEducation = api(
	{method: 'GET', path: '/resume/:resume_id/education/:id', auth: true, expose: true},
	async ({resume_id, id}: EducationWithIdParams): Promise<EducationResponse> => {
		return EducationService.getEducationById({resume_id, id})
	}
)

/**
 * Create new education entry
 * POST /resume/:resume_id/education
 */
export const createEducation = api(
	{method: 'POST', path: '/resume/:resume_id/education', auth: true, expose: true},
	async ({resume_id, ...data}: EducationPathParams & EducationCreateRequest): Promise<EducationResponse> => {
		log.info('Education request received')
		return EducationService.createEducation({resume_id, ...data})
	}
)

/**
 * Update education entry
 * PATCH /resume/:resume_id/education/:id
 */
export const updateEducation = api(
	{method: 'PATCH', path: '/resume/:resume_id/education/:id', auth: true, expose: true},
	async ({resume_id, id, ...data}: EducationWithIdParams & EducationUpdateRequest): Promise<EducationResponse> => {
		return EducationService.updateEducation({resume_id, id, ...data})
	}
)

/**
 * Delete education entry
 * DELETE /resume/:resume_id/education/:id
 */
export const deleteEducation = api(
	{method: 'DELETE', path: '/resume/:resume_id/education/:id', auth: true, expose: true},
	async ({resume_id, id}: EducationWithIdParams): Promise<void> => {
		await EducationService.deleteEducation({resume_id, id})
	}
)

/**
 * ==========================================
 * EXPERIENCE ENDPOINTS
 * ==========================================
 */

/**
 * List all experiences for a resume
 * GET /resume/:resume_id/experience
 */
export const listExperiences = api(
	{method: 'GET', path: '/resume/:resume_id/experience', auth: true, expose: true},
	async ({resume_id}: ExperiencePathParams): Promise<{experiences: ExperienceResponse[]}> => {
		return ExperienceService.listExperiences({resume_id})
	}
)

/**
 * Get specific experience by ID
 * GET /resume/:resume_id/experience/:id
 */
export const getExperience = api(
	{method: 'GET', path: '/resume/:resume_id/experience/:id', auth: true, expose: true},
	async ({resume_id, id}: ExperienceWithIdParams): Promise<ExperienceResponse> => {
		return ExperienceService.getExperienceById({resume_id, id})
	}
)

/**
 * Create new experience entry
 * POST /resume/:resume_id/experience
 */
export const createExperience = api(
	{method: 'POST', path: '/resume/:resume_id/experience', auth: true, expose: true},
	async ({resume_id, ...data}: ExperiencePathParams & ExperienceCreateRequest): Promise<ExperienceResponse> => {
		return ExperienceService.createExperience({resume_id, ...data})
	}
)

/**
 * Update experience entry
 * PATCH /resume/:resume_id/experience/:id
 */
export const updateExperience = api(
	{method: 'PATCH', path: '/resume/:resume_id/experience/:id', auth: true, expose: true},
	async ({resume_id, id, ...data}: ExperienceWithIdParams & ExperienceUpdateRequest): Promise<ExperienceResponse> => {
		return ExperienceService.updateExperience({resume_id, id, ...data})
	}
)

/**
 * Delete experience entry
 * DELETE /resume/:resume_id/experience/:id
 */
export const deleteExperience = api(
	{method: 'DELETE', path: '/resume/:resume_id/experience/:id', auth: true, expose: true},
	async ({resume_id, id}: ExperienceWithIdParams): Promise<void> => {
		await ExperienceService.deleteExperience({resume_id, id})
	}
)

/**
 * ==========================================
 * SKILL ENDPOINTS
 * ==========================================
 */

/**
 * List all skills/proficiencies for resume
 * GET /resume/:resume_id/skill
 */
export const listSkills = api(
	{method: 'GET', path: '/resume/:resume_id/skill', auth: true, expose: true},
	async ({resume_id}: SkillPathParams): Promise<{skills: SkillResponse[]}> => {
		return SkillService.listSkills({resume_id})
	}
)

/**
 * Add skill to resume
 * POST /resume/:resume_id/skill
 */
export const addSkill = api(
	{method: 'POST', path: '/resume/:resume_id/skill', auth: true, expose: true},
	async ({resume_id, ...data}: SkillPathParams & AddSkillRequest): Promise<SkillResponse> => {
		return SkillService.addSkill({resume_id, ...data})
	}
)

/**
 * Update skill proficiency
 * PATCH /resume/:resume_id/skill/:id
 */
export const updateSkill = api(
	{method: 'PATCH', path: '/resume/:resume_id/skill/:id', auth: true, expose: true},
	async ({resume_id, id, ...data}: SkillWithIdParams & UpdateSkillRequest): Promise<SkillResponse> => {
		return SkillService.updateSkill({resume_id, id, ...data})
	}
)

/**
 * Remove skill from resume
 * DELETE /resume/:resume_id/skill/:id
 */
export const removeSkill = api(
	{method: 'DELETE', path: '/resume/:resume_id/skill/:id', auth: true, expose: true},
	async ({resume_id, id}: SkillWithIdParams): Promise<void> => {
		await SkillService.removeSkill({resume_id, id})
	}
)

/**
 * Get unique skill categories for resume
 * GET /resume/:resume_id/skill/categories
 */
export const getSkillCategories = api(
	{method: 'GET', path: '/resume/:resume_id/skill/categories', auth: true, expose: true},
	async ({resume_id}: SkillPathParams): Promise<SkillCategoriesResponse> => {
		return SkillService.getCategories({resume_id})
	}
)

/**
 * ==========================================
 * GLOBAL SKILL ENDPOINTS
 * ==========================================
 */

/**
 * Get all skills in the system
 * GET /skills
 * Useful for autocomplete/suggestions when adding skills
 */
export const getAllSkills = api(
	{method: 'GET', path: '/skill', auth: true, expose: true},
	async (): Promise<{skills: Skill[]}> => {
		return SkillService.getAllSkills()
	}
)

/**
 * Get all unique skill categories in the system
 * GET /skills/categories
 * Useful for category filtering and autocomplete
 */
export const getAllSkillCategories = api(
	{method: 'GET', path: '/skills/categories', auth: true, expose: true},
	async (): Promise<GlobalSkillCategoriesResponse> => {
		return SkillService.getAllCategories()
	}
)

/**
 * ==========================================
 * PROJECT ENDPOINTS
 * ==========================================
 */

/**
 * List all projects for resume
 * GET /resume/:resume_id/project
 */
export const listProjects = api(
	{method: 'GET', path: '/resume/:resume_id/project', auth: true, expose: true},
	async ({resume_id}: ProjectPathParams): Promise<{projects: ProjectResponse[]}> => {
		return ProjectService.listProjects({resume_id})
	}
)

/**
 * Get specific project
 * GET /resume/:resume_id/project/:id
 */
export const getProject = api(
	{method: 'GET', path: '/resume/:resume_id/project/:id', auth: true, expose: true},
	async ({resume_id, id}: ProjectWithIdParams): Promise<ProjectResponse> => {
		return ProjectService.getProjectById({resume_id, id})
	}
)

/**
 * Create project
 * POST /resume/:resume_id/project
 */
export const createProject = api(
	{method: 'POST', path: '/resume/:resume_id/project', auth: true, expose: true},
	async ({resume_id, ...data}: ProjectPathParams & ProjectCreateRequest): Promise<ProjectResponse> => {
		return ProjectService.createProject({resume_id, ...data})
	}
)

/**
 * Update project
 * PATCH /resume/:resume_id/project/:id
 */
export const updateProject = api(
	{method: 'PATCH', path: '/resume/:resume_id/project/:id', auth: true, expose: true},
	async ({resume_id, id, ...data}: ProjectWithIdParams & ProjectUpdateRequest): Promise<ProjectResponse> => {
		return ProjectService.updateProject({resume_id, id, ...data})
	}
)

/**
 * Delete project
 * DELETE /resume/:resume_id/project/:id
 */
export const deleteProject = api(
	{method: 'DELETE', path: '/resume/:resume_id/project/:id', auth: true, expose: true},
	async ({resume_id, id}: ProjectWithIdParams): Promise<void> => {
		await ProjectService.deleteProject({resume_id, id})
	}
)

/**
 * ==========================================
 * CERTIFICATION ENDPOINTS
 * ==========================================
 */

/**
 * List all certifications for resume
 * GET /resume/:resume_id/certification
 */
export const listCertifications = api(
	{method: 'GET', path: '/resume/:resume_id/certification', auth: true, expose: true},
	async ({resume_id}: CertificationPathParams): Promise<{certifications: CertificationResponse[]}> => {
		return CertificationService.listCertifications({resume_id})
	}
)

/**
 * Get specific certification
 * GET /resume/:resume_id/certification/:id
 */
export const getCertification = api(
	{method: 'GET', path: '/resume/:resume_id/certification/:id', auth: true, expose: true},
	async ({resume_id, id}: CertificationWithIdParams): Promise<CertificationResponse> => {
		return CertificationService.getCertificationById({resume_id, id})
	}
)

/**
 * Create certification
 * POST /resume/:resume_id/certification
 */
export const createCertification = api(
	{method: 'POST', path: '/resume/:resume_id/certification', auth: true, expose: true},
	async ({resume_id, ...data}: CertificationPathParams & CertificationCreateRequest): Promise<CertificationResponse> => {
		return CertificationService.createCertification({resume_id, ...data})
	}
)

/**
 * Update certification
 * PATCH /resume/:resume_id/certification/:id
 */
export const updateCertification = api(
	{method: 'PATCH', path: '/resume/:resume_id/certification/:id', auth: true, expose: true},
	async ({
		resume_id,
		id,
		...data
	}: CertificationWithIdParams & CertificationUpdateRequest): Promise<CertificationResponse> => {
		return CertificationService.updateCertification({resume_id, id, ...data})
	}
)

/**
 * Delete certification
 * DELETE /resume/:resume_id/certification/:id
 */
export const deleteCertification = api(
	{method: 'DELETE', path: '/resume/:resume_id/certification/:id', auth: true, expose: true},
	async ({resume_id, id}: CertificationWithIdParams): Promise<void> => {
		await CertificationService.deleteCertification({resume_id, id})
	}
)

/**
 * Rearrange resume sections
 * PUT /resume/:id/sections/rearrange
 *
 * Uses two-phase update to avoid unique constraint violations:
 * - Phase 1: Set all sections to negative indices
 * - Phase 2: Set final positive indices in desired order
 */
export const rearrangeSections = api(
	{method: 'PUT', path: '/resume/:id/sections/rearrange', auth: true, expose: true},
	async ({id, section_ids}: RearrangeSectionsRequest): Promise<ResumeResponse> => {
		return ResumeService.rearrangeSections({id, section_ids})
	}
)

/**
 * Bulk replace resume sections
 * PUT /resume/:id
 *
 * Completely replaces all sections of a resume with new data.
 * Uses atomic transaction for all-or-nothing operation.
 *
 * Features:
 * - Validates entire payload before any DB changes
 * - Deletes all existing sections (cascades)
 * - Bulk skill resolution (single-pass)
 * - Optimized with minimal queries
 * - Returns complete updated resume
 */
export const replaceResume = api(
	{method: 'PUT', path: '/resume/:id', auth: true, expose: true},
	async ({id, sections}: ReplaceResumeRequest): Promise<ResumeResponse> => {
		return BulkReplaceService.replaceResume({id, sections})
	}
)

/**
 * ==========================================
 * TAILOR RESUME
 * ==========================================
 */

/**
 * Tailor Resume - POST /resume/tailor
 *
 * Creates or retrieves a job-specific resume and initiates tailoring process.
 *
 * Flow:
 * 1. Check if resume already exists for this job (URL targets only)
 * 2. If exists, return existing resume
 * 3. If not, create new resume + resume process (status: Processing)
 * 4. Call job.scrapeJob to create/get job (handles job creation + job process)
 * 5. Link resume to job
 * 6. Return resume with linked job
 *
 * Features:
 * - Handles both URL and text job descriptions
 * - Returns existing resume if already tailored for job
 * - Creates separate process for resume tailoring tracking
 * - Job service handles job scraping process independently
 */
export const tailorResume = api(
	{method: 'POST', path: '/resume/tailor', auth: true, expose: true},
	async (params: TailorResumeRequest): Promise<ResumeResponse> => {
		return ResumeService.tailorResume(params)
	}
)

/**
 * ==========================================
 * ADMIN ENDPOINTS
 * ==========================================
 */

/**
 * Get Resume by ID (Admin)
 * Fetches any resume by ID regardless of ownership
 * Requires x-admin-api-key header for authentication
 *
 * The unified gateway detects the admin API key and authenticates as admin.
 * The resume service recognizes admin users and skips ownership checks.
 *
 * GET /admin/resume/:id
 */
export const getResumeByIdAdmin = api(
	{method: 'GET', path: '/admin/resume/:id', auth: true, expose: true},
	async ({id}: GetResumeParams): Promise<ResumeResponse> => {
		return ResumeService.getResumeById({id})
	}
)

/**
 * Clear resume service database.
 * Deletes all data from all resume-related tables.
 *
 * Internal endpoint for use by admin service.
 * Accessible at DELETE /resume/database/clear
 *
 * WARNING: This is a destructive operation and cannot be undone
 */
export const clearDatabase = api({
	method: 'DELETE', path: '/resume/database/clear'
}, async (): Promise<ClearDatabaseResponse> => {
	return ResumeService.clearDatabase()
})
