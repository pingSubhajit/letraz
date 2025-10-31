import {boolean, date, integer, pgTable, text, timestamp, varchar} from 'drizzle-orm/pg-core'

/**
 * Users Table
 * Stores user identity and profile information
 */
const users = pgTable('users', {
	// Primary identifier from Clerk
	id: varchar('id', {length: 32}).primaryKey(),

	// Personal Information
	title: varchar('title', {length: 10}),
	first_name: varchar('first_name', {length: 50}).notNull(),
	last_name: varchar('last_name', {length: 50}),
	email: varchar('email', {length: 255}).notNull().unique(),
	phone: varchar('phone', {length: 25}),
	dob: date('dob', {mode: 'date'}),
	nationality: varchar('nationality', {length: 50}),

	// Address Information
	address: text('address'),
	city: varchar('city', {length: 50}),
	postal: varchar('postal', {length: 50}),
	country_id: integer('country_id'), // Foreign key to countries table

	// Additional Profile Information
	website: varchar('website', {length: 200}),
	profile_text: text('profile_text'),

	// System Fields
	is_active: boolean('is_active').notNull().default(true),
	is_staff: boolean('is_staff').notNull().default(false),
	last_login: timestamp('last_login', {withTimezone: true}),

	// Timestamps
	created_at: timestamp('created_at', {withTimezone: true}).notNull().defaultNow(),
	updated_at: timestamp('updated_at', {withTimezone: true})
		.notNull()
		.defaultNow()
		.$onUpdate(() => new Date())
})

export {users}

