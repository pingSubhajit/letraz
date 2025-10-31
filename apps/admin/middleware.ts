import type {NextRequest} from 'next/server'
import {NextResponse} from 'next/server'

const PUBLIC_PATHS = ['/login']

export const middleware = async (request: NextRequest) => {
	const {pathname} = request.nextUrl

	// Skip authentication for all API routes - they have their own auth mechanisms
	if (pathname.startsWith('/api/')) {
		return NextResponse.next()
	}

	// Skip authentication for other public paths
	if (PUBLIC_PATHS.some(path => pathname.startsWith(path))) {
		return NextResponse.next()
	}

	const token = request.cookies.get('linear_access_token')

	if (!token) {
		const url = new URL('/login', request.url)
		url.searchParams.set('from', pathname)
		return NextResponse.redirect(url)
	}

	return NextResponse.next()
}

export const config = {
	matcher: [
		/*
		 * Match all request paths except:
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 * - public folder
		 * - api routes (handled separately in middleware logic)
		 */
		'/((?!_next/static|_next/image|favicon.ico|public/).*)'
	]
}
