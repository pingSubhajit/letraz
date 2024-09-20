'use server'

import {db} from '@/db/drizzle'
import {personalInfo, PersonalInfoInsert} from '@/db/schema'
import {eq} from 'drizzle-orm'

export const addPersonalInfoToDB = async (personalInfoValues: (typeof personalInfo.$inferInsert)) => {
	const params = PersonalInfoInsert.parse(personalInfoValues)
	return db.insert(personalInfo).values(params).onConflictDoUpdate({
		target: personalInfo.userId,
		set: params
	}).returning()
}

export const getPersonalInfoFromDB = async (userId: string) => {
	return db.query.personalInfo.findFirst({
		where: eq(personalInfo.userId, userId)
	})
}
