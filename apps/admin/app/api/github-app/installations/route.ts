export const runtime = 'nodejs'

import {NextResponse} from 'next/server'
import {getGitHubAppClient} from '@/lib/github-app'

export const GET = async () => {
	try {
		const client = getGitHubAppClient()
		const installations = await client.getInstallations()
		return NextResponse.json({installations})
	} catch (error: any) {
		// eslint-disable-next-line no-console
		console.error('GitHub App installations error:', error)
		return NextResponse.json({error: error?.message || 'Failed to fetch installations'}, {status: 500})
	}
}


