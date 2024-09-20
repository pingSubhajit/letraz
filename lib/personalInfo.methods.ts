'use server'

import {db} from '@/db/drizzle'
import {personalInfo, PersonalInfoInsert} from '@/db/schema'

export const addPersonalInfoToDB = async (personalInfoValues: (typeof personalInfo.$inferInsert)) => {
	const params = PersonalInfoInsert.parse(personalInfoValues)
	return db.insert(personalInfo).values(params).returning()
}
