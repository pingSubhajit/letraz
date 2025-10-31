import * as p from 'drizzle-orm/pg-core'
import {relations, sql} from 'drizzle-orm'
import {nanoid} from 'nanoid'
import {EmploymentTypeLabel} from '@/services/resume/interface'

/**
 * Resume Status Enum
 * Represents the current status of a resume
 */
export enum ResumeStatus {
	Processing = 'Processing',
	Success = 'Success',
	Failure = 'Failure',
	Manual = 'Manual',
	Other = 'Other'
}

/**
 * Resume Section Type Enum
 * Represents the type of resume section
 */
export enum ResumeSectionType {
	Education = 'Education',
	Experience = 'Experience',
	Skill = 'Skill',
	Project = 'Project',
	Certification = 'Certification',
	Others = 'Others'
}

/**
 * Employment Type Enum
 * Represents types of employment for work experience
 * Uses short codes for database storage
 */
export enum EmploymentType {
	FullTime = 'flt',
	PartTime = 'prt',
	Contract = 'con',
	Internship = 'int',
	Freelance = 'fre',
	SelfEmployed = 'sel',
	Volunteer = 'vol',
	Trainee = 'tra'
}

/**
 * Employment Type Labels
 * Maps codes to human-readable labels for API responses
 */
export const EmploymentTypeLabels: Record<EmploymentType, EmploymentTypeLabel> = {
	[EmploymentType.FullTime]: 'Full Time',
	[EmploymentType.PartTime]: 'Part Time',
	[EmploymentType.Contract]: 'Contract',
	[EmploymentType.Internship]: 'Internship',
	[EmploymentType.Freelance]: 'Freelance',
	[EmploymentType.SelfEmployed]: 'Self Employed',
	[EmploymentType.Volunteer]: 'Volunteer',
	[EmploymentType.Trainee]: 'Trainee'
}

/**
 * Proficiency Level Enum
 * Represents skill proficiency levels
 * Uses short codes for database storage
 */
export enum ProficiencyLevel {
	Beginner = 'BEG',
	Intermediate = 'INT',
	Advanced = 'ADV',
	Expert = 'EXP'
}

/**
 * Process Status Enum
 * Represents the status of async processes (resume generation, thumbnails, etc.)
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
 * Generate a unique resume ID with 'rsm_' prefix
 */
const generateResumeId = (): string => `rsm_${nanoid()}`

/**
 * Resume Processes Table
 * Tracks async processes for resume operations (generation, thumbnails, etc.)
 */
const resumeProcesses = p.pgTable('resume_processes', {
	id: p.uuid('id').defaultRandom().primaryKey(),
	desc: p.varchar('desc', {length: 250}).notNull(),
	status: p
		.varchar('status', {length: 15})
		.notNull()
		.default(ProcessStatus.Initiated)
		.$type<ProcessStatus>(),
	status_details: p.varchar('status_details', {length: 250}),
	created_at: p.timestamp('created_at', {withTimezone: true}).notNull().defaultNow(),
	updated_at: p
		.timestamp('updated_at', {withTimezone: true})
		.notNull()
		.defaultNow()
		.$onUpdate(() => new Date())
})

/**
 * Skills Table
 * Master table for skills with categories and aliases
 * Shared across all resumes for deduplication
 */
const skills = p.pgTable(
	'skills',
	{
		id: p.uuid('id').defaultRandom().primaryKey(),
		name: p.varchar('name', {length: 250}).notNull(),
		category: p.varchar('category', {length: 50}),
		preferred: p.boolean('preferred').notNull().default(false),
		created_at: p.timestamp('created_at', {withTimezone: true}).notNull().defaultNow(),
		updated_at: p
			.timestamp('updated_at', {withTimezone: true})
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date())
	},
	(table) => ({
		// Unique constraint on (category, name) for deduplication
		uniqueSkill: p.unique().on(table.category, table.name)
	})
)

/**
 * Skill Aliases Table
 * Self-referential M2M for skill aliases (e.g., 'JavaScript' alias 'JS')
 */
const skillAliases = p.pgTable(
	'skill_aliases',
	{
		skill_id: p
			.uuid('skill_id')
			.notNull()
			.references(() => skills.id, {onDelete: 'cascade'}),
		alias_id: p
			.uuid('alias_id')
			.notNull()
			.references(() => skills.id, {onDelete: 'cascade'})
	},
	(table) => ({
		pk: p.primaryKey({columns: [table.skill_id, table.alias_id]})
	})
)

/**
 * Resumes Table
 * Main resume container - can be base (template) or job-specific
 */
const resumes = p.pgTable(
	'resumes',
	{
		id: p
			.varchar('id', {length: 25})
			.primaryKey()
			.$defaultFn(() => generateResumeId()),
		user_id: p.varchar('user_id', {length: 32}).notNull(),
		job_id: p.varchar('job_id', {length: 25}),
		base: p.boolean('base').notNull().default(false),
		status: p.varchar('status', {length: 20}).$type<ResumeStatus>(),
		thumbnail: p.varchar('thumbnail', {length: 1000}),
		process_id: p.uuid('process_id').references(() => resumeProcesses.id),
		created_at: p.timestamp('created_at', {withTimezone: true}).notNull().defaultNow(),
		updated_at: p
			.timestamp('updated_at', {withTimezone: true})
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date())
	},
	(table) => ({
		// Unique constraint: one resume per (user, job)
		uniqueUserJob: p.unique().on(table.user_id, table.job_id),
		// Partial unique index: only one base resume per user
		uniqueBaseResume: p.uniqueIndex('unique_base_resume').on(table.user_id).where(sql`${table.base} = true`)
	})
)

/**
 * Resume Sections Table
 * Polymorphic container for different section types
 * Ordered by index for presentation
 */
const resumeSections = p.pgTable(
	'resume_sections',
	{
		id: p.uuid('id').defaultRandom().primaryKey(),
		resume_id: p
			.varchar('resume_id', {length: 25})
			.notNull()
			.references(() => resumes.id, {onDelete: 'cascade'}),
		index: p.integer('index').notNull(),
		type: p.varchar('type', {length: 20}).notNull().$type<ResumeSectionType>(),
		created_at: p.timestamp('created_at', {withTimezone: true}).notNull().defaultNow(),
		updated_at: p
			.timestamp('updated_at', {withTimezone: true})
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date())
	},
	(table) => ({
		// Unique constraint: (resume_id, index) for ordering
		uniqueResumeIndex: p.unique().on(table.resume_id, table.index)
	})
)

/**
 * Education Table
 * Academic background - OneToOne with ResumeSection
 */
const educations = p.pgTable('educations', {
	id: p.uuid('id').defaultRandom().primaryKey(),
	user_id: p.varchar('user_id', {length: 32}).notNull(),
	resume_section_id: p
		.uuid('resume_section_id')
		.notNull()
		.references(() => resumeSections.id, {onDelete: 'cascade'}),
	institution_name: p.varchar('institution_name', {length: 250}).notNull(),
	field_of_study: p.varchar('field_of_study', {length: 250}).notNull(),
	degree: p.varchar('degree', {length: 250}),
	country_code: p.varchar('country_code', {length: 3}),
	started_from_month: p.integer('started_from_month'), // 1-12
	started_from_year: p.integer('started_from_year'), // YYYY
	finished_at_month: p.integer('finished_at_month'), // 1-12
	finished_at_year: p.integer('finished_at_year'), // YYYY
	current: p.boolean('current').notNull().default(false),
	description: p.text('description'),
	created_at: p.timestamp('created_at', {withTimezone: true}).notNull().defaultNow(),
	updated_at: p
		.timestamp('updated_at', {withTimezone: true})
		.notNull()
		.defaultNow()
		.$onUpdate(() => new Date())
})

/**
 * Experience Table
 * Work history - OneToOne with ResumeSection
 */
const experiences = p.pgTable('experiences', {
	id: p.uuid('id').defaultRandom().primaryKey(),
	user_id: p.varchar('user_id', {length: 32}).notNull(),
	resume_section_id: p
		.uuid('resume_section_id')
		.notNull()
		.references(() => resumeSections.id, {onDelete: 'cascade'}),
	company_name: p.varchar('company_name', {length: 250}).notNull(),
	job_title: p.varchar('job_title', {length: 250}).notNull(),
	employment_type: p.varchar('employment_type', {length: 20}).notNull().$type<EmploymentType>(),
	city: p.varchar('city', {length: 50}),
	country_code: p.varchar('country_code', {length: 3}),
	started_from_month: p.integer('started_from_month'), // 1-12
	started_from_year: p.integer('started_from_year'), // YYYY
	finished_at_month: p.integer('finished_at_month'), // 1-12
	finished_at_year: p.integer('finished_at_year'), // YYYY
	current: p.boolean('current').notNull().default(false),
	description: p.text('description'),
	created_at: p.timestamp('created_at', {withTimezone: true}).notNull().defaultNow(),
	updated_at: p
		.timestamp('updated_at', {withTimezone: true})
		.notNull()
		.defaultNow()
		.$onUpdate(() => new Date())
})

/**
 * Projects Table
 * Personal/professional projects - OneToOne with ResumeSection
 */
const projects = p.pgTable('projects', {
	id: p.uuid('id').defaultRandom().primaryKey(),
	user_id: p.varchar('user_id', {length: 32}).notNull(),
	resume_section_id: p
		.uuid('resume_section_id')
		.notNull()
		.references(() => resumeSections.id, {onDelete: 'cascade'}),
	name: p.varchar('name', {length: 255}).notNull(),
	category: p.varchar('category', {length: 255}),
	description: p.text('description'),
	role: p.varchar('role', {length: 255}),
	github_url: p.varchar('github_url', {length: 500}),
	live_url: p.varchar('live_url', {length: 500}),
	started_from_month: p.integer('started_from_month'), // 1-12
	started_from_year: p.integer('started_from_year'), // YYYY
	finished_at_month: p.integer('finished_at_month'), // 1-12
	finished_at_year: p.integer('finished_at_year'), // YYYY
	current: p.boolean('current'),
	created_at: p.timestamp('created_at', {withTimezone: true}).notNull().defaultNow(),
	updated_at: p
		.timestamp('updated_at', {withTimezone: true})
		.notNull()
		.defaultNow()
		.$onUpdate(() => new Date())
})

/**
 * Project Skills Junction Table
 * M2M relationship between Projects and Skills
 */
const projectSkills = p.pgTable(
	'project_skills',
	{
		project_id: p
			.uuid('project_id')
			.notNull()
			.references(() => projects.id, {onDelete: 'cascade'}),
		skill_id: p
			.uuid('skill_id')
			.notNull()
			.references(() => skills.id, {onDelete: 'cascade'})
	},
	(table) => ({
		pk: p.primaryKey({columns: [table.project_id, table.skill_id]})
	})
)

/**
 * Certifications Table
 * Professional certifications - OneToOne with ResumeSection
 */
const certifications = p.pgTable('certifications', {
	id: p.uuid('id').defaultRandom().primaryKey(),
	user_id: p.varchar('user_id', {length: 32}).notNull(),
	resume_section_id: p
		.uuid('resume_section_id')
		.notNull()
		.references(() => resumeSections.id, {onDelete: 'cascade'}),
	name: p.varchar('name', {length: 255}).notNull(),
	issuing_organization: p.varchar('issuing_organization', {length: 255}),
	issue_date: p.date('issue_date', {mode: 'date'}),
	credential_url: p.varchar('credential_url', {length: 500}),
	created_at: p.timestamp('created_at', {withTimezone: true}).notNull().defaultNow(),
	updated_at: p
		.timestamp('updated_at', {withTimezone: true})
		.notNull()
		.defaultNow()
		.$onUpdate(() => new Date())
})

/**
 * Proficiencies Table
 * Skills associated with a resume with proficiency levels
 * Links ResumeSection (Skill type) with Skills table
 */
const proficiencies = p.pgTable('proficiencies', {
	id: p.uuid('id').defaultRandom().primaryKey(),
	skill_id: p
		.uuid('skill_id')
		.notNull()
		.references(() => skills.id, {onDelete: 'cascade'}),
	resume_section_id: p
		.uuid('resume_section_id')
		.notNull()
		.references(() => resumeSections.id, {onDelete: 'cascade'}),
	level: p.varchar('level', {length: 20}).$type<ProficiencyLevel>(),
	created_at: p.timestamp('created_at', {withTimezone: true}).notNull().defaultNow(),
	updated_at: p
		.timestamp('updated_at', {withTimezone: true})
		.notNull()
		.defaultNow()
		.$onUpdate(() => new Date())
})

/**
 * Relations Definitions
 * Enable type-safe queries with Drizzle ORM
 */

const resumeProcessesRelations = relations(resumeProcesses, ({many}) => ({
	resumes: many(resumes),
	thumbnail_resumes: many(resumes)
}))

const skillsRelations = relations(skills, ({many}) => ({
	proficiencies: many(proficiencies),
	projectSkills: many(projectSkills),
	aliases: many(skillAliases, {relationName: 'skill_aliases'}),
	aliasedBy: many(skillAliases, {relationName: 'skill_aliased_by'})
}))

const skillAliasesRelations = relations(skillAliases, ({one}) => ({
	skill: one(skills, {
		fields: [skillAliases.skill_id],
		references: [skills.id],
		relationName: 'skill_aliases'
	}),
	alias: one(skills, {
		fields: [skillAliases.alias_id],
		references: [skills.id],
		relationName: 'skill_aliased_by'
	})
}))

const resumesRelations = relations(resumes, ({one, many}) => ({
	process: one(resumeProcesses, {
		fields: [resumes.process_id],
		references: [resumeProcesses.id]
	}),
	sections: many(resumeSections)
}))

const resumeSectionsRelations = relations(resumeSections, ({one, many}) => ({
	resume: one(resumes, {
		fields: [resumeSections.resume_id],
		references: [resumes.id]
	}),
	education: one(educations, {
		fields: [resumeSections.id],
		references: [educations.resume_section_id]
	}),
	experience: one(experiences, {
		fields: [resumeSections.id],
		references: [experiences.resume_section_id]
	}),
	project: one(projects, {
		fields: [resumeSections.id],
		references: [projects.resume_section_id]
	}),
	certification: one(certifications, {
		fields: [resumeSections.id],
		references: [certifications.resume_section_id]
	}),
	proficiencies: many(proficiencies)
}))

const educationsRelations = relations(educations, ({one}) => ({
	resumeSection: one(resumeSections, {
		fields: [educations.resume_section_id],
		references: [resumeSections.id]
	})
}))

const experiencesRelations = relations(experiences, ({one}) => ({
	resumeSection: one(resumeSections, {
		fields: [experiences.resume_section_id],
		references: [resumeSections.id]
	})
}))

const projectsRelations = relations(projects, ({one, many}) => ({
	resumeSection: one(resumeSections, {
		fields: [projects.resume_section_id],
		references: [resumeSections.id]
	}),
	projectSkills: many(projectSkills)
}))

const projectSkillsRelations = relations(projectSkills, ({one}) => ({
	project: one(projects, {
		fields: [projectSkills.project_id],
		references: [projects.id]
	}),
	skill: one(skills, {
		fields: [projectSkills.skill_id],
		references: [skills.id]
	})
}))

const certificationsRelations = relations(certifications, ({one}) => ({
	resumeSection: one(resumeSections, {
		fields: [certifications.resume_section_id],
		references: [resumeSections.id]
	})
}))

const proficienciesRelations = relations(proficiencies, ({one}) => ({
	skill: one(skills, {
		fields: [proficiencies.skill_id],
		references: [skills.id]
	}),
	resumeSection: one(resumeSections, {
		fields: [proficiencies.resume_section_id],
		references: [resumeSections.id]
	})
}))

/**
 * Export all tables and relations
 */
export {
	resumeProcesses,
	resumeProcessesRelations,
	skills,
	skillsRelations,
	skillAliases,
	skillAliasesRelations,
	resumes,
	resumesRelations,
	resumeSections,
	resumeSectionsRelations,
	educations,
	educationsRelations,
	experiences,
	experiencesRelations,
	projects,
	projectsRelations,
	projectSkills,
	projectSkillsRelations,
	certifications,
	certificationsRelations,
	proficiencies,
	proficienciesRelations
}

