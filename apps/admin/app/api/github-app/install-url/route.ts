export const runtime = 'nodejs'

import {NextResponse} from 'next/server'
import {getGitHubAppClient} from '@/lib/github-app'

export const GET = async () => {
	try {
		const client = getGitHubAppClient()
		const url = client.getInstallationUrl()
		return NextResponse.json({url})
	} catch (error: any) {
		// eslint-disable-next-line no-console
		console.error('GitHub App install URL error:', error)
		return NextResponse.json({error: error?.message || 'Failed to get install URL'}, {status: 500})
	}
}


