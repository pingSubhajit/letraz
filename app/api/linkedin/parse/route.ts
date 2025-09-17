import {NextRequest, NextResponse} from 'next/server'
import {z} from 'zod'
import {parseLinkedInProfile} from '@/lib/linkedin/parser'

export const runtime = 'nodejs'

/**
 * POST /api/linkedin/parse
 *
 * Body (JSON): { url: string }
 *
 * Header:
 *   - x-authentication: SELF_SECRET_KEY (validated by middleware.ts)
 */
export const POST = async (req: NextRequest): Promise<NextResponse> => {
	try {
		const body = await req.json().catch(() => null)
		if (!body || typeof body !== 'object') {
			return NextResponse.json({error: 'Invalid JSON body'}, {status: 400})
		}

		const InputSchema = z.object({
			url: z
				.string()
				.url('Invalid URL')
				.refine((u) => /linkedin\.com\/in\//.test(u), 'Must be a LinkedIn profile URL (contains /in/)')
		})

		const {url} = InputSchema.parse(body)

		const data = await parseLinkedInProfile(url)
		return NextResponse.json({data})
	} catch (error) {
		const message = (error as Error)?.message ?? 'Unknown error'
		return NextResponse.json({error: message}, {status: 500})
	}
}
