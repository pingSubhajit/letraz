import {boolean, pgEnum, pgTable, unique, uuid, varchar} from 'drizzle-orm/pg-core'
import {relations, sql} from 'drizzle-orm'
import {educations, experiences, personalInfo} from '@/db/schema'
import {createInsertSchema, createSelectSchema} from 'drizzle-zod'

export enum ResumeSections {
	EDUCATION = 'education',
	EXPERIENCE = 'experience',
	SKILLS = 'skills',
	PROJECTS = 'projects', // TODO: Implement this section
	STRENGTHS = 'strengths',
	CERTIFICATIONS = 'certifications', // TODO: Implement this section
	LANGUAGES = 'languages', // TODO: Implement this section
}

export const typeToModel = {
	education: educations,
	experience: experiences,
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

export type ResumeSection = {
	id: string,
	resumeId: string,
	type: ResumeSections,
	dataId: string,
	data: (typeof educations.$inferSelect) | (typeof experiences.$inferSelect),
}

export type Resume = {
	id: string,
	userId: string,
	jobId: string | null,
	base: boolean,
	sections?: ResumeSection[],
	personalInfo: (typeof personalInfo.$inferSelect) | null
}

export const resumes = pgTable('resumes', {
	id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
	userId: varchar('user_id').notNull(),
	jobId: uuid('job_id'),
	base: boolean('base').default(false),
}, (table) => ({
	unq: unique().on(table.userId, table.base),
}))

export const resumesRelations = relations(resumes, ({ many, one }) => ({
	sections: many(resumeSections),
	personalInfo: one(personalInfo, {
		fields: [resumes.userId],
		references: [personalInfo.userId]
	})
}))

export const ResumesInsert = createInsertSchema(resumes)
export const ResumesSelect = createSelectSchema(resumes)
