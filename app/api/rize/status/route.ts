import {NextResponse} from 'next/server'
import {getPrivateMetadata} from '@/lib/user/metadata'

export const dynamic = 'force-dynamic'

export const GET = async () => {
	try {
		const meta = await getPrivateMetadata()
		return NextResponse.json({
			rizeUserId: meta.rizeUserId || null,
			rizeBackfill: meta.rizeBackfill || {status: 'idle'}
		})
	} catch (e: any) {
		return NextResponse.json({error: e?.message || 'Unauthorized'}, {status: 401})
	}
}
