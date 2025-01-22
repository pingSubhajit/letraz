import {auth} from '@clerk/nextjs/server'

export const GET = async () => {
	const session = await auth()
	const token = await session.getToken({template: 'TEST_LONG_LIVED'})

	return Response.json({token, sessionId: session.sessionId})
}
