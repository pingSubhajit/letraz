import {pgTable, uuid, varchar, timestamp} from 'drizzle-orm/pg-core'
import {sql} from 'drizzle-orm'
import {createInsertSchema, createSelectSchema} from 'drizzle-zod'

export const projects = pgTable('projects', {
	id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
	userId: varchar('user_id').notNull(),
	name: varchar('name').notNull(),
	description: varchar('description'),
	technologies: varchar('technologies'),
	role: varchar('role').notNull(),
	accomplishments: varchar('accomplishments'),
	links: varchar('links'),
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => sql`now()`)
})

export const ProjectsInsert = createInsertSchema(projects)
export const ProjectsSelect = createSelectSchema(projects)
