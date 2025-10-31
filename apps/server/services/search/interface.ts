import {ProficiencyLevel, ResumeSectionType, ResumeStatus} from '@/services/resume/schema'

/**
 * Algolia Search Index Interfaces
 * These interfaces define the structure of data indexed in Algolia for search
 *
 * Design principles:
 * - Flatten nested structures for better searchability
 * - Use display values instead of IDs where appropriate
 * - Include only searchable/filterable fields
 */

/**
 * Algolia Resume Index Document
 * Top-level document stored in Algolia's resume index
 */
export interface AlgoliaResumeDocument {
	/** Algolia's required unique identifier */
	objectID: string
	/** Resume ID (same as objectID, kept for compatibility) */
	id: string
	/** User ID who owns this resume */
	user: string
	/** Associated job information (if tailored) */
	job: AlgoliaJobReference | null
	/** Resume status (display value) */
	status: string | null
	/** Resume sections with searchable content */
	sections: AlgoliaSectionDocument[]
	/** Thumbnail URL for visual preview */
	thumbnail: string | null
	/** Timestamp when this document was indexed */
	indexed_at: string
}

/**
 * Algolia Job Reference
 * Lightweight job data for resume search context
 */
export interface AlgoliaJobReference {
	/** Job ID */
	id: string
	/** Job title (primary searchable field) */
	title: string
	/** Company name */
	company_name: string
	/** Location */
	location: string | null
	/** Job status */
	status: string | null
	/** Job URL */
	job_url: string | null
	/** Job description (searchable) */
	description: string | null
	/** Salary information */
	salary: {
		min: number | null
		max: number | null
		currency: string | null
	} | null
}

/**
 * Algolia Section Document
 * Polymorphic section with type-specific data
 */
export interface AlgoliaSectionDocument {
	/** Section type (display value) */
	type: ResumeSectionType
	/** Section content (varies by type) */
	data: AlgoliaSectionData
}

/**
 * Algolia Section Data Union Type
 * Discriminated union for different section types
 */
export type AlgoliaSectionData =
	| AlgoliaEducationData
	| AlgoliaExperienceData
	| AlgoliaProjectData
	| AlgoliaCertificationData
	| AlgoliaSkillsData

/**
 * Algolia Education Data
 * Simplified education section for search indexing
 */
export interface AlgoliaEducationData {
	/** Institution name (highly searchable) */
	institution_name: string
	/** Field of study (searchable) */
	field_of_study: string
	/** Degree obtained */
	degree: string | null
	/** Country name (not code) for better searchability */
	country: string | null
	/** Whether currently enrolled */
	current: boolean
	/** Description text (searchable) */
	description: string | null
}

/**
 * Algolia Experience Data
 * Simplified work experience section for search indexing
 */
export interface AlgoliaExperienceData {
	/** Company name (highly searchable) */
	company_name: string
	/** Job title (highly searchable) */
	job_title: string
	/** Employment type (display value) */
	employment_type: string | null
	/** City location */
	city: string | null
	/** Country name (not code) for better searchability */
	country: string | null
	/** Whether currently employed */
	current: boolean
	/** Description text (searchable) */
	description: string | null
}

/**
 * Algolia Project Data
 * Simplified project section for search indexing
 */
export interface AlgoliaProjectData {
	/** Project category (filterable) */
	category: string | null
	/** Project name (highly searchable) */
	name: string
	/** Project description (searchable) */
	description: string | null
	/** Role in project */
	role: string | null
	/** GitHub URL */
	github_url: string | null
	/** Live demo URL */
	live_url: string | null
	/** Whether currently active */
	current: boolean | null
}

/**
 * Algolia Certification Data
 * Simplified certification section for search indexing
 */
export interface AlgoliaCertificationData {
	/** Certification name (highly searchable) */
	name: string
	/** Issuing organization (searchable) */
	issuing_organization: string | null
	/** Issue date (for recency filtering) */
	issue_date: Date | null
	/** Credential verification URL */
	credential_url: string | null
}

/**
 * Algolia Skills Data
 * Skills section with proficiency levels
 */
export interface AlgoliaSkillsData {
	/** Array of skills with proficiency */
	skills: AlgoliaSkillItem[]
}

/**
 * Algolia Skill Item
 * Individual skill with searchable fields
 */
export interface AlgoliaSkillItem {
	/** Skill name (highly searchable) */
	name: string
	/** Skill category (filterable) */
	category: string | null
	/** Proficiency level (filterable) */
	level: ProficiencyLevel | null
}

/**
 * Algolia Search Query Parameters
 * Parameters for searching resumes in Algolia
 */
export interface AlgoliaSearchParams {
	/** Search query string */
	query: string
	/** Optional filters */
	filters?: {
		/** Filter by user ID */
		user_id?: string
		/** Filter by job ID */
		job_id?: string
		/** Filter by status */
		status?: ResumeStatus
		/** Filter by section type */
		section_type?: ResumeSectionType
		/** Filter by skills */
		skills?: string[]
	}
	/** Pagination */
	page?: number
	/** Results per page */
	hits_per_page?: number
}

/**
 * Algolia Search Response
 * Response structure from Algolia search
 */
export interface AlgoliaSearchResponse {
	/** Search results */
	hits: AlgoliaResumeDocument[]
	/** Total number of hits */
	nb_hits: number
	/** Current page */
	page: number
	/** Number of pages */
	nb_pages: number
	/** Hits per page */
	hits_per_page: number
}

