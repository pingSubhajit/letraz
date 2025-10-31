export const runtime = 'nodejs'

import {NextResponse} from 'next/server'
import {getGitHubAppClient} from '@/lib/github-app'
import {Octokit} from '@octokit/rest'

export const POST = async (req: Request) => {
	try {
		const {owner, repo, url, secret} = await req.json()
		if (!owner || !repo || !url || !secret) {
			return NextResponse.json({error: 'Missing required fields'}, {status: 400})
		}

		const appClient = getGitHubAppClient()
		const installation = await appClient.getRepositoryInstallation(owner, repo)
		if (!installation) {
			return NextResponse.json({error: 'GitHub App is not installed on this repository'}, {status: 403})
		}

		const token = await appClient.getInstallationToken(installation.id)
		const octokit = new Octokit({auth: token})

		// Create webhook
		await octokit.repos.createWebhook({
			owner,
			repo,
			config: {
				url,
				content_type: 'json',
				secret,
				insecure_ssl: '0'
			} as any,
			events: ['push'],
			active: true
		})

		return NextResponse.json({success: true})
	} catch (error: any) {
		// eslint-disable-next-line no-console
		console.error('GitHub App create webhook error:', error)
		return NextResponse.json({error: error?.message || 'Failed to create webhook'}, {status: 500})
	}
}


