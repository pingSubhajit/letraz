'use server'

import {auth, clerkClient} from '@clerk/nextjs/server'

export type RizeBackfillStatus = 'idle' | 'pending' | 'complete' | 'error'

export type PrivateMetadata = {
    rizeUserId?: string
    rizeBackfill?: {
        status: RizeBackfillStatus
        startedAt?: string
        completedAt?: string
        error?: string
    }
}

export const getPrivateMetadata = async (): Promise<PrivateMetadata> => {
	const {userId} = await auth()
	if (!userId) throw new Error('User not authenticated')
	const client = await clerkClient()
	const user = await client.users.getUser(userId)
	return (user.privateMetadata as PrivateMetadata) || {}
}

export const updatePrivateMetadata = async (update: Partial<PrivateMetadata>): Promise<PrivateMetadata> => {
	const {userId} = await auth()
	if (!userId) throw new Error('User not authenticated')
	const client = await clerkClient()
	const user = await client.users.getUser(userId)
	const current = (user.privateMetadata as PrivateMetadata) || {}
	const next = {...current, ...update}
	await client.users.updateUser(userId, {privateMetadata: next})
	return next
}

export const setRizeBackfillStatusForUser = async (userId: string, status: RizeBackfillStatus, extra?: Partial<NonNullable<PrivateMetadata['rizeBackfill']>>): Promise<PrivateMetadata> => {
	const client = await clerkClient()
	const user = await client.users.getUser(userId)
	const current = (user.privateMetadata as PrivateMetadata) || {}
	const rizeBackfill = {
		...(current.rizeBackfill || {}),
		status,
		...(extra || {})
	}
	if (status === 'complete' && !rizeBackfill.completedAt) {
		rizeBackfill.completedAt = new Date().toISOString()
	}
	const next = {...current, rizeBackfill}
	await client.users.updateUser(userId, {privateMetadata: next})
	return next
}


