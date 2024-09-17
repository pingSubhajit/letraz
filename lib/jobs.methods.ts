'use server'

import {db} from '@/db/drizzle'
import {jobs} from '@/db/schema'

export const addJobToDB = async (job: (typeof jobs.$inferInsert)) => {
	return (await db.insert(jobs).values(job).returning())[0]
}
