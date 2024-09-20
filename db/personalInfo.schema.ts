import {date, pgTable, timestamp, uuid, varchar} from 'drizzle-orm/pg-core'
import {sql} from 'drizzle-orm'
import {createInsertSchema, createSelectSchema} from 'drizzle-zod'

export const personalInfo = pgTable('personal_info', {
	id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
	userId: varchar('user_id').notNull().unique(),
	title: varchar('title'),
	firstName: varchar('first_name').notNull(),
	lastName: varchar('last_name'),
	email: varchar('email').notNull(),
	phone: varchar('phone'),
	dob: date('dob'),
	nationality: varchar('nationality'),
	address: varchar('address'),
	city: varchar('city'),
	postal: varchar('postal'),
	country: varchar('country'),
	website: varchar('website'),
	profileText: varchar('profile_text'),
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()),
})

export const PersonalInfoInsert = createInsertSchema(personalInfo)
export const PersonalInfoSelect = createSelectSchema(personalInfo)
