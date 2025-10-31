import {NextResponse} from 'next/server'
import {cookies} from 'next/headers'

type ErrorResponse = {
	error: string
}

export const GET = async (request: Request) => {
	const {searchParams} = new URL(request.url)
	const code = searchParams.get('code')
	const state = searchParams.get('state')
	const cookieStore = await cookies()

	if (!code) {
		return NextResponse.json<ErrorResponse>(
			{error: 'No code provided'},
			{status: 400}
		)
	}

	try {
		const tokenResponse = await fetch('https://api.linear.app/oauth/token', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			body: new URLSearchParams({
				code,
				client_id: process.env.LINEAR_CLIENT_ID!,
				client_secret: process.env.LINEAR_CLIENT_SECRET!,
				redirect_uri: process.env.NEXT_PUBLIC_APP_URL + '/api/linear/callback',
				grant_type: 'authorization_code'
			})
		})

		const data = await tokenResponse.json()

		if (!tokenResponse.ok) {
			throw new Error(data.error || 'Failed to exchange code for token')
		}

		const response = NextResponse.redirect(
			new URL(state || '/', request.url)
		)

		cookieStore.set('linear_access_token', data.access_token, {
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			maxAge: 30 * 24 * 60 * 60 // 30 days
		})

		return response
	} catch (error) {
		return NextResponse.redirect(
			new URL('/login?error=Failed to exchange code for token', request.url)
		)
	}
}
