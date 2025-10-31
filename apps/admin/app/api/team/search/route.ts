import {NextResponse} from 'next/server'
import {ConvexHttpClient} from 'convex/browser'
import {api} from '@/convex/_generated/api'

// Public endpoint to search active team members by name/email/position
export const GET = async (request: Request) => {
	try {
		// Require Bearer token
		const authHeader = request.headers.get('authorization') || request.headers.get('Authorization')
		const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : undefined
		if (!token) {
			return NextResponse.json({error: 'Unauthorized'}, {status: 401})
		}

		const {searchParams} = new URL(request.url)
		const q = (searchParams.get('q') || '').trim()

		// If no query provided, return all active team members

		const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL
		if (!convexUrl) {
			return NextResponse.json(
				{error: 'Server not configured'},
				{status: 500}
			)
		}

		// Use Convex HTTP client since this is running on the server
		const convex = new ConvexHttpClient(convexUrl)

		// Verify token via Convex
		const ok = await convex.query(api.apiTokens.verifyToken, {token})
		if (!ok) {
			return NextResponse.json({error: 'Forbidden'}, {status: 403})
		}
		// Record token usage asynchronously (do not block response)
		convex.mutation(api.apiTokens.recordTokenUse, {token}).catch(() => {})
		const results = !q
			? await convex.query(api.teamMembers.getAllTeamMembers, {})
			: await convex.query(api.teamMembers.searchTeamMembers, {searchTerm: q})

		// Normalize output and limit fields to what the Raycast extension needs
		const normalized = (results || []).map((m: any) => ({
			id: m._id,
			name: m.name,
			email: m.email,
			phone: m.phone ?? null,
			department: m.department,
			position: m.position ?? null,
			photoUrl: m.photoUrl ?? null,
			bio: m.bio ?? null,
			joiningDate: m.joiningDate
		}))

		return NextResponse.json({results: normalized})
	} catch (error) {
		return NextResponse.json(
			{error: error instanceof Error ? error.message : 'Unknown error'},
			{status: 500}
		)
	}
}
