'use server'

import {db} from '@/db/drizzle'
import {eq} from 'drizzle-orm'
import {personalInfo} from '@/db/schema'

const createBaseResume = async (userId: string) => {
	const basePersonalInfo = await db.query.personalInfo.findFirst({where: eq(personalInfo.userId, userId)})

	if (!basePersonalInfo) {
		throw new Error('Couldn\'t create résumé. No personal info found')
	}
}
