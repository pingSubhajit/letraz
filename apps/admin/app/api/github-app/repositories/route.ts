export const runtime = 'nodejs'

import {NextResponse} from 'next/server'
import {getGitHubAppClient} from '@/lib/github-app'
import {Octokit} from '@octokit/rest'

export const GET = async () => {
	try {
		const appClient = getGitHubAppClient()
		const installations = await appClient.getInstallations()

		const allRepos: any[] = []

		for (const inst of installations) {
			const token = await appClient.getInstallationToken(inst.id)
			const octokit = new Octokit({auth: token})

			// Fetch first page; extend to paginate if needed
			const {data} = await octokit.apps.listReposAccessibleToInstallation({per_page: 100})
			const repos = (data.repositories as any[]).map((r: any) => ({
				id: r.id,
				name: r.name,
				full_name: r.full_name,
				html_url: r.html_url,
				description: r.description,
				private: r.private,
				owner: {login: r.owner?.login}
			}))

			allRepos.push(...repos)
		}

		return NextResponse.json({repositories: allRepos})
	} catch (error: any) {
		// eslint-disable-next-line no-console
		console.error('GitHub App repositories error:', error)
		return NextResponse.json({error: error?.message || 'Failed to fetch repositories'}, {status: 500})
	}
}


