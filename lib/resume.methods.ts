'use server'

import {db} from '@/db/drizzle'
import {eq} from 'drizzle-orm'
import {educations, experiences, personalInfo, resumes, resumeSections} from '@/db/schema'
import {Resume, ResumeSections, typeToModel} from '@/db/resumes.schema'
import {deepCopy} from '@/lib/utils'

export const constructResume = async (resumeFromDB: Resume): Promise<Resume> => {
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
		base: true,
	}).returning()

	const baseEducations = await db.query.educations.findMany({where: eq(educations.userId, userId)})
	await db.insert(resumeSections).values(baseEducations.map(education => ({
		resumeId: resume[0].id,
		type: ResumeSections.EDUCATION,
		dataId: education.id,
	})))

	const baseExperiences = await db.query.experiences.findMany({where: eq(experiences.userId, userId)})
	await db.insert(resumeSections).values(baseExperiences.map(experience => ({
		resumeId: resume[0].id,
		type: ResumeSections.EXPERIENCE,
		dataId: experience.id,
	})))

	const resumeFromDB = await db.query.resumes.findFirst({where: eq(resumes.id, resume[0].id), with: {sections: true, personalInfo: true}})
	return await constructResume(resumeFromDB as Resume)
}
