import {pgTable, uuid, varchar} from 'drizzle-orm/pg-core'
import {sql} from 'drizzle-orm'

export const jobs = pgTable('jobs', {
	id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
	jobUrl: varchar('job_url'),
	title: varchar('title').notNull(),
	companyName: varchar('company_name').notNull(),
	location: varchar('location'),
	salaryMax: varchar('salary_max'),
	salaryMin: varchar('salary_min'),
	requirements: varchar('requirements').array(),
	description: varchar('description'),
	responsibilities: varchar('responsibilities').array(),
	benefits: varchar('benefits').array(),
})
