import * as p from 'drizzle-orm/pg-core'
import {relations} from 'drizzle-orm'

// Waitlist table (parity with Django CORE.Waitlist)
const waitlist = p.pgTable('waitlist', {
	// UUID primary key (defaults to v4)
	id: p.uuid('id').defaultRandom().primaryKey(),
	// Unique email with max length 254
	email: p.varchar('email', {length: 254}).notNull().unique(),
	// Referrer/source, default 'website', max length 50
	referrer: p.varchar('referrer', {length: 50}).notNull().default('website'),
	// Auto-incrementing waiting number representing join order
	waiting_number: p.integer('waiting_number').default(0).notNull(),
	// Access flag, defaults to false
	has_access: p.boolean('has_access').notNull().default(false),
	// Created timestamp, defaults to now
	created_at: p.timestamp('created_at', {withTimezone: true}).notNull().defaultNow()
})

// Define empty relations to enable typed orm.query API
const waitlistRelations = relations(waitlist, () => ({}))

/**
 * Countries Table
 * Stores country information for use across services
 * Reference data for user profiles, job locations, education, experience, etc.
 */
const countries = p.pgTable('countries', {
	// ISO 3166-1 alpha-3 code as primary key
	code: p.varchar('code', {length: 3}).primaryKey(),
	// Country name
	name: p.varchar('name', {length: 250}).notNull()
})

// Define empty relations for countries
const countriesRelations = relations(countries, () => ({}))

/**
 * Feedback Table
 * Stores general user feedback that doesn't require immediate action
 * Feature requests go to Linear, help requests go to Help Scout
 */
const feedback = p.pgTable('feedback', {
	// UUID primary key
	id: p.uuid('id').defaultRandom().primaryKey(),
	// User ID who submitted the feedback
	user_id: p.varchar('user_id', {length: 255}).notNull(),
	// Feedback title (AI-generated summary)
	title: p.varchar('title', {length: 500}).notNull(),
	// Feedback content (AI-reformatted)
	content: p.text('content').notNull(),
	// Priority level: low, medium, high, urgent
	priority: p.varchar('priority', {length: 20}).notNull(),
	// Created timestamp
	created_at: p.timestamp('created_at', {withTimezone: true}).notNull().defaultNow()
})

// Define empty relations for feedback
const feedbackRelations = relations(feedback, () => ({}))

export {waitlist, waitlistRelations, countries, countriesRelations, feedback, feedbackRelations}
