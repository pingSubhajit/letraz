import {pgTable, serial, timestamp, uuid, varchar} from 'drizzle-orm/pg-core'
import {sql} from 'drizzle-orm'
import {createInsertSchema, createSelectSchema} from 'drizzle-zod'

export const waitlist = pgTable('waitlist', {
	id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
	email: varchar('email').notNull().unique(),
	referrer: varchar('referrer'),
	waitingNumber: serial('waiting_number'),
	createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const WaitlistInsert = createInsertSchema(waitlist)
export const WaitlistSelect = createSelectSchema(waitlist)
