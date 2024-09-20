import {date, pgTable, timestamp, uuid, varchar} from 'drizzle-orm/pg-core'
import {sql} from 'drizzle-orm'

export const personalInfo = pgTable('personal_info', {
	id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
	userID: uuid('user_id').notNull(),
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
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow().$onUpdate(() => sql`now()`),
})
