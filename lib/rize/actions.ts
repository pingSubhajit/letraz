'use server'

import {after} from 'next/server'
import {kickoffRizeBackfill} from '@/lib/rize/rize'

export const executeRizeBackfill = async (
	userId: string,
	rizeUserId: string,
	authHeaders?: Record<string, string>
): Promise<void> => {

	// Run the actual backfill in the background
	after(async () => {
		try {
			await kickoffRizeBackfill(userId, rizeUserId, authHeaders)
		} catch {}
	})
}
