'use server'

import {setRizeBackfillStatusForUser} from '@/lib/user/metadata'
import {rizeAdminApiUrl} from '@/config'
import {type RizeUser, RizeUserSchema} from '@/lib/rize/types'
import {parseRizeUserToEnhancedResume} from '@/lib/rize/parser'
import {replaceResume} from '@/lib/resume/actions'
import {addOrUpdateUserInfoToDB} from '@/lib/user-info/actions'

const fetchRizeProfile = async (rizeUserId: string, letrazId: string): Promise<RizeUser> => {
	const url = `${rizeAdminApiUrl}/users/${encodeURIComponent(rizeUserId)}?letrazId=${encodeURIComponent(letrazId)}`

	const res = await fetch(url, {
		method: 'GET',
		headers: {
			'x-admin-api-key': process.env.RIZE_ADMIN_API_KEY as string
		},
		cache: 'no-store'
	})

	if (!res.ok) {
		const text = await res.text().catch(() => '')
		throw new Error(text || 'Failed to fetch Rize profile')
	}

	const json = await res.json()

	const parsed = RizeUserSchema.parse(json)
	return parsed
}

const applyProfileToLetraz = async (profile: RizeUser, authHeaders?: Record<string, string>) => {
	const enhanced = await parseRizeUserToEnhancedResume(profile)

	// Update resume sections
	await replaceResume({sections: enhanced.sections}, 'base', {headers: authHeaders})

	// Update user info if available
	if (enhanced.userProfile && Object.keys(enhanced.userProfile).length > 0) {
		await addOrUpdateUserInfoToDB(enhanced.userProfile, {headers: authHeaders})
	}
}

export const kickoffRizeBackfill = async (userId: string, rizeUserId: string, authHeaders?: Record<string, string>): Promise<void> => {
	try {
		await setRizeBackfillStatusForUser(userId, 'pending', {startedAt: new Date().toISOString()})
		const profile = await fetchRizeProfile(rizeUserId, userId)
		await applyProfileToLetraz(profile, authHeaders)
		await setRizeBackfillStatusForUser(userId, 'complete', {completedAt: new Date().toISOString()})
	} catch (error: any) {
		await setRizeBackfillStatusForUser(userId, 'error', {error: error?.message || 'Backfill failed'})
	}
}


