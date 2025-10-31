import {JobStatus, ProcessStatus} from '@/services/job/schema'
import {IsURL, MinLen} from 'encore.dev/validate'

/**
 * Process Interface
 * Represents a process for tracking job operations
 */
export interface Process {
	id: string;
	desc: string;
	status: ProcessStatus;
	status_details: string | null;
	created_at: Date;
	updated_at: Date;
}

/**
 * New Process Interface
 * Represents data for creating a new process
 */
export interface NewProcess {
	desc: string;
	status?: ProcessStatus;
	status_details?: string | null;
}

/**
 * Job Interface
 * Represents a job posting with all its properties
 * Matches the database schema return type
 */
export interface Job {
	id: string;
	job_url: string | null;
	title: string;
	company_name: string;
	location: string | null;
	currency: string | null;
	salary_max: number | null;
	salary_min: number | null;
	requirements: string[] | null;
	description: string | null;
	responsibilities: string[] | null;
	benefits: string[] | null;
	status: JobStatus | null;
	process_id: string | null;
	created_at: Date;
	updated_at: Date;
}

/**
 * New Job Interface
 * Represents data for inserting a new job (without id, timestamps)
 */
export interface NewJob {
	title: string;
	company_name: string;
	job_url?: string | null;
	location?: string | null;
	currency?: string | null;
	salary_max?: number | null;
	salary_min?: number | null;
	requirements?: string[] | null;
	description?: string | null;
	responsibilities?: string[] | null;
	benefits?: string[] | null;
	status?: JobStatus | null;
	process_id?: string | null;
}

/**
 * Request/Response interfaces for Job service endpoints
 */

/**
 * Create Job Request
 * Parameters for creating a new job posting
 */
export interface CreateJobRequest {
	// Required fields
	title: string;
	company_name: string;

	// Optional fields
	job_url?: string;
	location?: string;
	currency?: string;
	salary_max?: number;
	salary_min?: number;
	requirements?: string[];
	description?: string;
	responsibilities?: string[];
	benefits?: string[];
	status?: JobStatus;
	process_id?: string;
}

/**
 * Update Job Request
 * Parameters for updating an existing job posting
 */
export interface UpdateJobRequest {
	id: string;
	title?: string;
	company_name?: string;
	job_url?: string;
	location?: string;
	currency?: string;
	salary_max?: number;
	salary_min?: number;
	requirements?: string[];
	description?: string;
	responsibilities?: string[];
	benefits?: string[];
	status?: JobStatus;
	process_id?: string;
}

/**
 * Job Response
 * Full job data returned from endpoints
 */
export interface JobResponse {
	job: Job;
}

/**
 * List Jobs Request
 * Parameters for listing/filtering jobs
 */
export interface ListJobsRequest {
	page?: number;
	page_size?: number;
	status?: JobStatus;
	company_name?: string;
	location?: string;
}

/**
 * List Jobs Response
 * Paginated list of jobs
 */
export interface ListJobsResponse {
	jobs: Job[];
	page: number;
	page_size: number;
	total: number;
	has_next: boolean;
	has_prev: boolean;
}

/**
 * Delete Job Request
 * Parameters for deleting a job
 */
export interface DeleteJobRequest {
	id: string;
}

/**
 * Delete Job Response
 */
export interface DeleteJobResponse {
	success: boolean;
	message: string;
}

/**
 * Scrape Job Request
 * Parameters for initiating a job scraping process
 */
export interface ScrapeJobRequest {
	target: string & MinLen<10> & (IsURL | MinLen<300>);
}

/**
 * Scrape Job Response
 * Response containing the created job and process
 */
export interface ScrapeJobResponse {
	job: Job;
	process: Process;
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

