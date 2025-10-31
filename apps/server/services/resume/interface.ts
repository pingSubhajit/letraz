import {
	EmploymentType,
	ProcessStatus,
	ProficiencyLevel,
	ResumeSectionType,
	ResumeStatus
} from '@/services/resume/schema'
import {IsURL, Max, Min, MinLen} from 'encore.dev/validate'
import type {User} from '@/services/identity/interface'
import type {Job} from '@/services/job/interface'

/**
 * ==========================================
 * TYPE DEFINITIONS
 * ==========================================
 */

/**
 * Employment Type Label
 * Union type of all possible employment type labels for API responses
 */
export type EmploymentTypeLabel =
	| 'Full Time'
	| 'Part Time'
	| 'Contract'
	| 'Internship'
	| 'Freelance'
	| 'Self Employed'
	| 'Volunteer'
	| 'Trainee'

/**
 * ==========================================
 * BASE ENTITY INTERFACES
 * ==========================================
 */

/**
 * Resume Process Interface
 * Represents a process for tracking resume operations
 */
export interface ResumeProcess {
	id: string
	desc: string
	status: ProcessStatus
	status_details: string | null
	created_at: Date
	updated_at: Date
}

/**
 * Skill Interface
 * Represents a skill with category and metadata
 */
export interface Skill {
	id: string
	name: string
	category: string | null
	preferred: boolean
	created_at: Date
	updated_at: Date
}

/**
 * Country Reference Interface
 * Lightweight country data from core service
 */
export interface CountryReference {
	code: string
	name: string
}

/**
 * Resume Interface
 * Main resume entity
 */
export interface Resume {
	id: string
	user_id: string
	job_id: string | null
	base: boolean
	status: ResumeStatus | null
	thumbnail: string | null
	process_id: string | null
	created_at: Date
	updated_at: Date
}

/**
 * Resume Section Interface
 * Polymorphic section container
 */
export interface ResumeSection {
	id: string
	resume: string
	index: number
	type: ResumeSectionType
	created_at: Date
	updated_at: Date
}

/**
 * Education Interface
 */
export interface Education {
	id: string
	user_id: string
	resume_section_id: string
	institution_name: string
	field_of_study: string
	degree: string | null
	country_code: string | null
	started_from_month: number | null
	started_from_year: number | null
	finished_at_month: number | null
	finished_at_year: number | null
	current: boolean
	description: string | null
	created_at: Date
	updated_at: Date
}

/**
 * Experience Interface
 */
export interface Experience {
	id: string
	user_id: string
	resume_section_id: string
	company_name: string
	job_title: string
	employment_type: EmploymentType
	city: string | null
	country_code: string | null
	started_from_month: number | null
	started_from_year: number | null
	finished_at_month: number | null
	finished_at_year: number | null
	current: boolean
	description: string | null
	created_at: Date
	updated_at: Date
}

/**
 * Project Interface
 */
export interface Project {
	id: string
	user_id: string
	resume_section_id: string
	name: string
	category: string | null
	description: string | null
	role: string | null
	github_url: string | null
	live_url: string | null
	started_from_month: number | null
	started_from_year: number | null
	finished_at_month: number | null
	finished_at_year: number | null
	current: boolean | null
	created_at: Date
	updated_at: Date
}

/**
 * Certification Interface
 * Clean response without internal fields
 */
export interface Certification {
	id: string
	user: string
	resume_section: string
	name: string
	issuing_organization: string | null
	issue_date: string | null
	credential_url: string | null
	created_at: Date
	updated_at: Date
}

/**
 * Proficiency Interface
 * Skill with proficiency level for a resume
 */
export interface Proficiency {
	id: string
	skill_id: string
	resume_section_id: string
	level: ProficiencyLevel | null
	created_at: Date
	updated_at: Date
}

/**
 * ==========================================
 * NESTED RESPONSE INTERFACES
 * ==========================================
 */

/**
 * Project response
 */
export interface ProjectResponse
	extends Omit<Project, 'user_id' | 'resume_section_id'>{
	user: string
	resume_section: string
	skills_used: Skill[]
}

/**
 * Education response
 */
export interface EducationResponse
	extends Omit<Education, 'user_id' | 'resume_section_id' | 'country_code'> {
	user: string
	resume_section: string
	country: CountryReference | null
}

/**
 * Experience response
 */
export interface ExperienceResponse
	extends Omit<Experience, 'user_id' | 'resume_section_id' | 'country_code' | 'employment_type'> {
	user: string
	resume_section: string
	country: CountryReference | null
	employment_type: EmploymentTypeLabel
}

/**
 * Certification response
 */
export interface CertificationResponse extends Certification {}

/**
 * Section Data Union Type
 */
export type SectionData =
	| {skills: SkillResponse[]}
	| EducationResponse
	| ExperienceResponse
	| ProjectResponse
	| CertificationResponse
	| null

/**
 * Resume Section with Data
 * Full section with nested content
 */
export interface ResumeSectionWithData extends ResumeSection{
	data: SectionData
}

/**
 * User data for resume response (aliased from identity service)
 */
export type ResumeUser = User

/**
 * Job data for resume response (aliased from job service)
 */
export type ResumeJob = Job

/**
 * Full Resume Response
 * Complete resume with all nested sections
 */
export interface ResumeResponse {
	id: string
	base: boolean
	user: ResumeUser
	job: ResumeJob | null
	status: ResumeStatus | null
	thumbnail: string | null
	sections: ResumeSectionWithData[]
	created_at: Date
	updated_at: Date
}

/**
 * Short Resume Response
 * Resume summary without sections
 */
export interface ResumeShort {
	id: string
	base: boolean
	user: string
	job: ResumeJob | null
	status: ResumeStatus | null
	thumbnail: string | null
	created_at: Date
	updated_at: Date
}

/**
 * ==========================================
 * REQUEST INTERFACES - RESUME
 * ==========================================
 */

/**
 * Get Resume Request
 */
export interface GetResumeParams {
	/** Resume ID or 'base' for base resume */
	id: string
}

/**
 * Delete Resume Request
 */
export interface DeleteResumeParams {
	/** Resume ID (cannot be 'base') */
	id: string
}

/**
 * List Resumes Request
 */
export interface ListResumesParams {
	/** Filter by status */
	status?: ResumeStatus
	/** Filter by base resume */
	base?: boolean
}

/**
 * ==========================================
 * REQUEST INTERFACES - EDUCATION
 * ==========================================
 */

/**
 * Create Education Request (all required fields must be present)
 */
export interface EducationCreateRequest {
	institution_name: string
	field_of_study: string
	degree?: string
	country_code?: string
	country?: string | CountryReference
	started_from_month?: (number & Min<1> & Max<12>) | string
	started_from_year?: (number & Min<1900> & Max<2100>) | string
	finished_at_month?: (number & Min<1> & Max<12>) | string
	finished_at_year?: (number & Min<1900> & Max<2100>) | string
	current?: boolean
	description?: string
}

/**
 * Update Education Request (all fields optional for partial updates)
 */
export interface EducationUpdateRequest {
	institution_name?: string
	field_of_study?: string
	degree?: string
	country_code?: string
	country?: string | CountryReference
	started_from_month?: (number & Min<1> & Max<12>) | string
	started_from_year?: (number & Min<1900> & Max<2100>) | string
	finished_at_month?: (number & Min<1> & Max<12>) | string
	finished_at_year?: (number & Min<1900> & Max<2100>) | string
	current?: boolean
	description?: string
}

/**
 * Education Path Params (for list/create)
 */
export interface EducationPathParams {
	resume_id: string
}

/**
 * Education Path Params with ID (for get/update/delete)
 */
export interface EducationWithIdParams {
	resume_id: string
	id: string
}

/**
 * ==========================================
 * REQUEST INTERFACES - EXPERIENCE
 * ==========================================
 */

/**
 * Create Experience Request (all required fields must be present)
 */
export interface ExperienceCreateRequest {
	company_name: string
	job_title: string
	employment_type: EmploymentType
	city?: string
	country_code?: string
	country?: string | CountryReference
	started_from_month?: (number & Min<1> & Max<12>) | string
	started_from_year?: (number & Min<1900> & Max<2100>) | string
	finished_at_month?: (number & Min<1> & Max<12>) | string
	finished_at_year?: (number & Min<1900> & Max<2100>) | string
	current?: boolean
	description?: string
}

/**
 * Update Experience Request (all fields optional for partial updates)
 */
export interface ExperienceUpdateRequest {
	company_name?: string
	job_title?: string
	employment_type?: EmploymentType
	city?: string
	country_code?: string
	country?: string | CountryReference
	started_from_month?: (number & Min<1> & Max<12>) | string
	started_from_year?: (number & Min<1900> & Max<2100>) | string
	finished_at_month?: (number & Min<1> & Max<12>) | string
	finished_at_year?: (number & Min<1900> & Max<2100>) | string
	current?: boolean
	description?: string
}

/**
 * Experience Path Params (for list/create)
 */
export interface ExperiencePathParams {
	resume_id: string
}

/**
 * Experience Path Params with ID (for get/update/delete)
 */
export interface ExperienceWithIdParams {
	resume_id: string
	id: string
}

/**
 * ==========================================
 * REQUEST INTERFACES - SKILLS
 * ==========================================
 */

/**
 * Skill Input (for creation)
 */
export interface SkillInput {
	name: string
	category?: string | null
}

/**
 * Add/Update Skill Request
 */
export interface SkillUpsertRequest {
	name: string
	category?: string
	level?: ProficiencyLevel
}

/**
 * Skill Query Params
 */
export interface SkillParams {
	resume_id: string
	id?: string
}

/**
 * ==========================================
 * REQUEST INTERFACES - PROJECTS
 * ==========================================
 */

/**
 * Create Project Request (all required fields must be present)
 */
export interface ProjectCreateRequest {
	name: string
	category?: string
	description?: string
	role?: string
	github_url?: string & IsURL
	live_url?: string & IsURL
	skills_used?: SkillInput[]
	started_from_month?: (number & Min<1> & Max<12>) | string
	started_from_year?: (number & Min<1900> & Max<2100>) | string
	finished_at_month?: (number & Min<1> & Max<12>) | string
	finished_at_year?: (number & Min<1900> & Max<2100>) | string
	current?: boolean
}

/**
 * Update Project Request (all fields optional for partial updates)
 */
export interface ProjectUpdateRequest {
	name?: string
	category?: string
	description?: string
	role?: string
	github_url?: string & IsURL
	live_url?: string & IsURL
	skills_used?: SkillInput[]
	started_from_month?: (number & Min<1> & Max<12>) | string
	started_from_year?: (number & Min<1900> & Max<2100>) | string
	finished_at_month?: (number & Min<1> & Max<12>) | string
	finished_at_year?: (number & Min<1900> & Max<2100>) | string
	current?: boolean
}

/**
 * Path parameters for project endpoints
 */
export interface ProjectPathParams {
	/** Resume ID or 'base' */
	resume_id: string
}

/**
 * Path parameters for specific project operations
 */
export interface ProjectWithIdParams extends ProjectPathParams {
	/** Project ID */
	id: string
}

/**
 * ==========================================
 * REQUEST INTERFACES - CERTIFICATIONS
 * ==========================================
 */

/**
 * Create Certification Request (all required fields must be present)
 */
export interface CertificationCreateRequest {
	name: string
	issuing_organization?: string
	issue_date?: string | Date
	credential_url?: string & IsURL
}

/**
 * Update Certification Request (all fields optional for partial updates)
 */
export interface CertificationUpdateRequest {
	name?: string
	issuing_organization?: string
	issue_date?: string | Date
	credential_url?: string & IsURL
}

/**
 * Certification Path Parameters (resume_id only)
 */
export interface CertificationPathParams {
	resume_id: string
}

/**
 * Certification Path Parameters with ID (resume_id + id)
 */
export interface CertificationWithIdParams {
	resume_id: string
	id: string
}

/**
 * ==========================================
 * REQUEST INTERFACES - ADVANCED OPERATIONS
 * ==========================================
 */

/**
 * Rearrange Sections Request
 */
export interface RearrangeSectionsRequest {
	/** Resume ID */
	id: string
	/** Ordered array of section IDs */
	section_ids: string[]
}

/**
 * Section for Bulk Replace
 */
export interface SectionReplaceInput {
	type: ResumeSectionType
	data: Record<string, any>
}

/**
 * Bulk Replace Resume Request
 */
export interface ReplaceResumeRequest {
	/** Resume ID */
	id: string
	/** Complete ordered array of sections */
	sections: SectionReplaceInput[]
}

/**
 * Tailor Resume Request
 */
export interface TailorResumeRequest {
	/** Target URL or job description text */
	target: string & MinLen<10> & (IsURL | MinLen<300>);
}

/**
 * ==========================================
 * RESPONSE INTERFACES
 * ==========================================
 */


/**
 * Skill Categories Response
 */
export interface SkillCategoriesResponse {
	categories: string[]
}


/**
 * ==========================================
 * SKILL & PROFICIENCY TYPES
 * ==========================================
 */

/**
 * Base Skill interface
 * Skills are shared resources across all resumes
 */
export interface Skill {
	/** Unique skill ID */
	id: string
	/** Skill category (e.g., 'Programming', 'Design', 'Languages') */
	category: string | null
	/** Skill name (e.g., 'TypeScript', 'Figma', 'Spanish') */
	name: string
	/** Whether this skill is preferred/featured */
	preferred: boolean
	/** Timestamps */
	created_at: Date
	updated_at: Date
}

/**
 * Proficiency with full skill details
 * Used for read operations
 */
export interface SkillResponse {
	/** Proficiency record ID */
	id: string
	/** Full skill details */
	skill: Skill
	level: ProficiencyLevel | null
	resume_section: string
}

/**
 * Request to add a skill to resume
 */
export interface AddSkillRequest {
	/** Skill name (required) */
	name: string
	/** Skill category (optional) */
	category?: string | null
	/** Proficiency level (optional) - validated against ProficiencyLevel enum */
	level?: string | null
}

/**
 * Request to update skill proficiency
 * Partial update - all fields optional
 */
export interface UpdateSkillRequest {
	/** Updated skill name */
	name?: string
	/** Updated skill category */
	category?: string | null
	/** Updated proficiency level - validated against ProficiencyLevel enum */
	level?: string | null
}

/**
 * Path parameters for skill endpoints
 */
export interface SkillPathParams {
	/** Resume ID or 'base' */
	resume_id: string
}

/**
 * Path parameters for specific skill operations
 */
export interface SkillWithIdParams extends SkillPathParams {
	/** Proficiency ID */
	id: string
}

/**
 * Skill categories response
 */
export interface SkillCategoriesResponse {
	categories: string[]
}

/**
 * Global skill categories response
 * Returns all unique categories from all skills
 */
export interface GlobalSkillCategoriesResponse {
	categories: string[]
}

/**
 * ==========================================
 * EXPORT INTERFACES
 * ==========================================
 */

/**
 * Export Resume Path Params
 */
export interface ExportResumeParams {
	/** Resume ID */
	id: string
}

/**
 * Export Resume Response
 */
export interface ExportResumeResponse {
	/** URL to the exported PDF file */
	pdf_url: string
	/** URL to the exported LaTeX file */
	latex_url: string
}

/**
 * ==========================================
 * MINIMAL RESUME INTERFACES
 * ==========================================
 */

/**
 * Resume Minimal Response
 * Lightweight resume data for quick lookups
 */
export interface ResumeMinimal {
	/** Resume ID */
	id: string
	/** Whether this is a base/template resume */
	base: boolean
	/** Resume status */
	status: ResumeStatus | null
	/** Job title from linked job (null if no job linked) */
	job_title: string | null
	/** Company name from linked job (null if no job linked) */
	company_name: string | null
	/** Resume created timestamp */
	created_at: Date
	/** Resume last updated timestamp */
	updated_at: Date
}

/**
 * Response for clear database operation
 */
export interface ClearDatabaseResponse {
	/** Success status */
	success: boolean
	/** Message describing the operation result */
	message: string
	/** Tables that were cleared */
	cleared_tables: string[]
	/** Timestamp of the operation */
	timestamp: string
}
