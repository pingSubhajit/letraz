'use server'

import {db} from '@/db/drizzle'
import {educations, EducationsInsert} from '@/db/schema'
import {eq} from 'drizzle-orm'

export const addEducationToDB = async (educationValues: (typeof educations.$inferInsert)) => {
	const params = EducationsInsert.parse(educationValues)
	return db.insert(educations).values(params).returning()
}

export const getEducationsFromDB = async (userId: string) => {
	return db.query.educations.findMany({
		where: eq(educations.userId, userId)
	})
}

export const deleteEducationFromDB = async (educationId: string) => {
	return db.delete(educations).where(eq(educations.id, educationId)).returning()
}
