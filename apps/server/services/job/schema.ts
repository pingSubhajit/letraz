import * as p from 'drizzle-orm/pg-core'
import {relations} from 'drizzle-orm'
import {nanoid} from 'nanoid'

/**
 * Job Status Enum
 * Represents the current status of a job posting
 */
export enum JobStatus {
	Processing = 'Processing',
	Success = 'Success',
	Failure = 'Failure',
	Manual = 'Manual',
	Other = 'Other'
}

/**
 * Process Status Enum
 * Represents the current status of a process
 */
export enum ProcessStatus {
	Initiated = 'INITIATED',
	Accepted = 'ACCEPTED',
	Rejected = 'REJECTED',
	Failed = 'FAILURE',
	Success = 'SUCCESS',
	Others = 'OTHER'
}

/**
 * Generate a unique job ID with 'job_' prefix
 * Uses nanoid for generating unique identifiers
 */
const generateJobId = (): string => `job_${nanoid()}`

/**
 * Jobs Table
 * Stores job postings and their details
 *
 * Migrated from Django CORE.Job model with full feature parity
 */
const jobs = p.pgTable('jobs', {
	// Primary identifier with custom nanoid generation
	id: p.varchar('id', {length: 25}).primaryKey().$defaultFn(() => generateJobId()),

	// Job Information
	job_url: p.varchar('job_url', {length: 1000}),
	title: p.varchar('title', {length: 250}).notNull(),
	company_name: p.varchar('company_name', {length: 250}).notNull(),
	location: p.varchar('location', {length: 100}),

	// Salary Information
	currency: p.varchar('currency', {length: 5}),
	salary_max: p.bigint('salary_max', {mode: 'number'}),
	salary_min: p.bigint('salary_min', {mode: 'number'}),

	// Detailed Job Information (JSON fields)
	requirements: p.jsonb('requirements').$type<string[]>(),
	description: p.varchar('description', {length: 3000}),
	responsibilities: p.jsonb('responsibilities').$type<string[]>(),
	benefits: p.jsonb('benefits').$type<string[]>(),

	// Status and Process
	status: p.varchar('status', {length: 20}).$type<JobStatus>(),
	process_id: p.uuid('process_id'),

	// Timestamps
	created_at: p.timestamp('created_at', {withTimezone: true}).notNull().defaultNow(),
	updated_at: p.timestamp('updated_at', {withTimezone: true})
		.notNull()
		.defaultNow()
		.$onUpdate(() => new Date())
})

/**
 * Processes Table
 * Stores job processing status and tracking information
 *
 * Migrated from Django CORE.Process model with full feature parity
 * One-to-one relationship with jobs
 */
const processes = p.pgTable('processes', {
	// Primary identifier (UUID)
	id: p.uuid('id').defaultRandom().primaryKey(),

	// Process Information
	desc: p.varchar('desc', {length: 250}).notNull(),
	status: p.varchar('status', {length: 15}).notNull().default(ProcessStatus.Initiated).$type<ProcessStatus>(),
	status_details: p.varchar('status_details', {length: 250}),

	// Timestamps
	created_at: p.timestamp('created_at', {withTimezone: true}).notNull().defaultNow(),
	updated_at: p.timestamp('updated_at', {withTimezone: true})
		.notNull()
		.defaultNow()
		.$onUpdate(() => new Date())
})

/**
 * Job Relations
 * Define relationships for type-safe queries
 */
const jobRelations = relations(jobs, ({one}) => ({
	process: one(processes, {
		fields: [jobs.process_id],
		references: [processes.id]
	})
}))

/**
 * Process Relations
 */
const processRelations = relations(processes, ({one}) => ({
	job: one(jobs, {
		fields: [processes.id],
		references: [jobs.process_id]
	})
}))

export {jobs, jobRelations, processes, processRelations}
