'use server'

import {db} from '@/db/drizzle'
import {eq} from 'drizzle-orm'
import {educations, experiences, personalInfo, resumes, resumeSections} from '@/db/schema'
import {Resume as ResumeModel, ResumeSections, typeToModel} from '@/db/resumes.schema'
import {deepCopy} from '@/lib/utils'
import {auth} from '@clerk/nextjs/server'
import {Resume} from '@/lib/resume/types'

export const constructResume = async (resumeFromDB: ResumeModel): Promise<ResumeModel> => {
	const resume = deepCopy(resumeFromDB)

	if (resume.sections) {
		for (const section of resume.sections) {
			const model = typeToModel[section.type as keyof typeof typeToModel]
			const data = await db.select().from(model).where(eq(model.id, section.dataId))

			if (!data) {
				throw new Error('Couldn\'t find section data')
			}

			section.data = data[0] as (typeof educations.$inferSelect) | (typeof experiences.$inferSelect)
		}

		return resume
	} else {
		return resume
	}
}

export const createBaseResume = async (userId: string) => {
	const basePersonalInfo = await db.query.personalInfo.findFirst({where: eq(personalInfo.userId, userId)})

	if (!basePersonalInfo) {
		throw new Error('Couldn\'t create résumé. No personal info found')
	}

	const resume = await db.insert(resumes).values({
		userId,
		base: true
	}).returning()

	const baseEducations = await db.query.educations.findMany({where: eq(educations.userId, userId)})
	await db.insert(resumeSections).values(baseEducations.map(education => ({
		resumeId: resume[0].id,
		type: ResumeSections.EDUCATION,
		dataId: education.id
	})))

	const baseExperiences = await db.query.experiences.findMany({where: eq(experiences.userId, userId)})
	await db.insert(resumeSections).values(baseExperiences.map(experience => ({
		resumeId: resume[0].id,
		type: ResumeSections.EXPERIENCE,
		dataId: experience.id
	})))

	await db.query.resumes.findFirst({where: eq(resumes.id, resume[0].id), with: {sections: true, personalInfo: true}})
}

/**
 * Retrieves a single experience object from the database by its ID
 * @param {string} [resumeId] - The ID of the resume to retrieve experience entries from. Defaults to 'base'.
 * @returns {Promise<Resume>} - The retrieved experience objects
 */
export const getResumeFromDB = async (resumeId?: string | 'base'): Promise<Resume> => {
	const session = await auth()
	const token = await session.getToken()

	const response = await fetch(`${process.env.API_URL}/resume/${resumeId ?? 'base'}/`, {
		headers: {
			Authorization: `Bearer ${token}`
		}
	})

	return await response.json()
}
