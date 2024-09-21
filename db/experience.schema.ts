import {boolean, integer, pgTable, timestamp, uuid, varchar} from 'drizzle-orm/pg-core'
import {sql} from 'drizzle-orm'
import {createInsertSchema, createSelectSchema} from 'drizzle-zod'

export const experiences = pgTable('experiences', {
	id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
	userId: varchar('user_id').notNull(),
	companyName: varchar('company_name'),
	jobTitle: varchar('job_title'),
	city: varchar('city'),
	country: varchar('country'),
	startedFromMonth: integer('started_from_month'),
	startedFromYear: integer('started_from_year'),
	finishedAtMonth: integer('finished_at_month'),
	finishedAtYear: integer('finished_at_year'),
	current: boolean('current'),
	description: varchar('description'),
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => sql`now()`),
})

export const ExperiencesInsert = createInsertSchema(experiences)
export const ExperiencesSelect = createSelectSchema(experiences)
