'use client'

import {useEffect, useState} from 'react'
import {Button} from '@/components/ui/button'
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card'
import {Badge} from '@/components/ui/badge'
import {AlertCircle, ExternalLink, Settings} from 'lucide-react'
// Client must not import server env; use API routes instead

export const GitHubAppSettings = () => {
	const [installations, setInstallations] = useState<any[]>([])
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const loadInstallations = async () => {
		setLoading(true)
		setError(null)
		try {
			const res = await fetch('/api/github-app/installations', {cache: 'no-store'})
			if (!res.ok) throw new Error('Failed to fetch installations')
			const data = await res.json()
			setInstallations(data.installations || [])
		} catch (err) {
			setError('Failed to load GitHub App installations')
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		loadInstallations()
	}, [])

	const getInstallationUrl = async () => {
		const res = await fetch('/api/github-app/install-url', {cache: 'no-store'})
		if (!res.ok) throw new Error('Failed to fetch install URL')
		const data = await res.json()
		return data.url as string
	}

	const getStatusBadge = (installation: any) => {
		if (installation.suspended_at) {
			return <Badge variant="destructive">Suspended</Badge>
		}
		return <Badge variant="default" className="bg-green-500">Active</Badge>
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Settings className="h-5 w-5" />
					GitHub App Integration
				</CardTitle>
				<CardDescription>
					Manage your GitHub App installations for automated PR creation
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				{error && (
					<div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
						<AlertCircle className="h-4 w-4" />
						{error}
					</div>
				)}

				<div className="space-y-4">
					<div className="flex items-center justify-between">
						<div>
							<h4 className="text-sm font-medium">Install GitHub App</h4>
							<p className="text-sm text-muted-foreground">
								Install the Letraz Admin app on repositories to enable automated PR creation
							</p>
						</div>
						<Button onClick={async () => window.open(await getInstallationUrl(), '_blank')} variant="outline">
							<ExternalLink className="h-4 w-4 mr-2" />
							Install App
						</Button>
					</div>

					<div>
						<h4 className="text-sm font-medium mb-2">Current Installations</h4>
						{loading ? (
							<p className="text-sm text-muted-foreground">Loading installations...</p>
						) : installations.length === 0 ? (
							<p className="text-sm text-muted-foreground">
								No installations found. Install the app on repositories to get started.
							</p>
						) : (
							<div className="space-y-2">
								{installations.map((installation) => (
									<div key={installation.id} className="flex items-center justify-between p-3 border rounded-md">
										<div>
											<div className="flex items-center gap-2">
												<span className="font-medium">
													{installation.account.login}
												</span>
												{getStatusBadge(installation)}
											</div>
											<p className="text-sm text-muted-foreground">
												{installation.repository_selection === 'all'
													? 'All repositories'
													: 'Selected repositories'}
											</p>
										</div>
										<Button
											onClick={() => window.open(`https://github.com/${installation.account.login}`, '_blank')}
											variant="ghost"
											size="sm"
										>
											<ExternalLink className="h-4 w-4" />
										</Button>
									</div>
								))}
							</div>
						)}
					</div>
				</div>
			</CardContent>
		</Card>
	)
}
