import {pgTable, serial, timestamp, uuid, varchar} from 'drizzle-orm/pg-core'
import {sql} from 'drizzle-orm'

export const waitlist = pgTable('waitlist', {
	id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
	email: varchar('email').notNull().unique(),
	referralLink: varchar('referral_link'),
	waitingNumber: serial('waiting_number'),
	createdAt: timestamp('created_at').notNull().defaultNow(),
})
