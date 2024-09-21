import {boolean, pgEnum, pgTable, uuid} from 'drizzle-orm/pg-core'
import {relations, sql} from 'drizzle-orm'
import {educations, personalInfo} from '@/db/schema'
import {createInsertSchema, createSelectSchema} from 'drizzle-zod'

export enum ResumeSections {
	PERSONAL_INFO = 'personal_info',
	EDUCATION = 'education',
	EXPERIENCE = 'experience',
	SKILLS = 'skills',
	PROJECTS = 'projects', // TODO: Implement this section
	STRENGTHS = 'strengths',
	CERTIFICATIONS = 'certifications', // TODO: Implement this section
	LANGUAGES = 'languages', // TODO: Implement this section
}

export const typeToModel = {
	'personal_info': personalInfo,
	'education': educations
}

export const resumeSectionTypeEnum = pgEnum('resume_section_type', Object.keys(typeToModel) as [string, ...string[]])

export const resumeSections = pgTable('resume_sections', {
	id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
	resumeId: uuid('resume_id').notNull(),
	type: resumeSectionTypeEnum('type').notNull(),
	dataId: uuid('data_id').notNull(),
})

export const resumeSectionsRelations = relations(resumeSections, ({ one }) => ({
	resume: one(resumes, {
		fields: [resumeSections.resumeId],
		references: [resumes.id]
	})
}))

export const ResumeSectionsInsert = createInsertSchema(resumeSections)
export const ResumeSectionsSelect = createSelectSchema(resumeSections)

export const resumes = pgTable('resumes', {
	id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
	userId: uuid('user_id').notNull(),
	jobId: uuid('job_id'),
	base: boolean('base').default(false),
})

export const resumesRelations = relations(resumes, ({ many }) => ({
	sections: many(resumeSections)
}))

export const ResumesInsert = createInsertSchema(resumes)
export const ResumesSelect = createSelectSchema(resumes)
