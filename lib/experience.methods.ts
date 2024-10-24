'use server'

import {db} from '@/db/drizzle'
import {experiences, ExperiencesInsert} from '@/db/schema'
import {eq} from 'drizzle-orm'

export const addExperienceToDB = async (experienceValues: (typeof experiences.$inferInsert)) => {
	const params = ExperiencesInsert.parse(experienceValues)
	return db.insert(experiences).values(params).returning()
}

export const getExperiencesFromDB = async (userId: string) => {
	return db.query.experiences.findMany({
		where: eq(experiences.userId, userId)
	})
}

export const deleteExperienceFromDB = async (experienceId: string) => {
	return db.delete(experiences).where(eq(experiences.id, experienceId)).returning()
}
