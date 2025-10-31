'use client'

import {useState} from 'react'
import {useQuery} from 'convex/react'
import {api} from '@/convex/_generated/api'
import {Button} from '@/components/ui/button'
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card'
import {Github, Plus} from 'lucide-react'
import {AddRepositoryDialog} from '@/components/settings/AddRepositoryDialog'
import {RepositoryCard} from '@/components/settings/RepositoryCard'
import {GitHubConnectButton} from '@/components/settings/GitHubConnectButton'
import {GitHubAppSettings} from '@/components/settings/GitHubAppSettings'
import {useLinearUser} from '@/hooks/useLinearUser'

const SettingsPage = () => {
	const {user, isLoading, error} = useLinearUser()
	const [showAddDialog, setShowAddDialog] = useState(false)

	const repositories = useQuery(api.repositories.listRepositories, {
		createdByUserId: user?.id
	}) || []

	// Show loading state while fetching user info
	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-64">
				<div className="text-center">
					<div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-300 border-t-neutral-900 mx-auto mb-4"></div>
					<p className="text-neutral-600">Loading user information...</p>
				</div>
			</div>
		)
	}

	// Show error state if user info couldn't be loaded
	if (error) {
		return (
			<div className="flex items-center justify-center h-64">
				<div className="text-center">
					<div className="h-8 w-8 text-red-500 mx-auto mb-4">⚠️</div>
					<p className="text-red-600 mb-2">Failed to load user information</p>
					<p className="text-neutral-500 text-sm">{error}</p>
				</div>
			</div>
		)
	}

	const handleAddRepository = () => {
		setShowAddDialog(true)
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold">Repository Settings</h1>
					<p className="text-neutral-600 dark:text-neutral-400">
						Manage your GitHub repositories for automated PR creation
					</p>
				</div>
				<Button onClick={handleAddRepository} className="gap-2">
					<Plus className="h-4 w-4" />
					Add Repository
				</Button>
			</div>

			{/* GitHub Connection Status */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Github className="h-5 w-5" />
						GitHub Connection
					</CardTitle>
					<CardDescription>
						Connect your GitHub account to manage repositories
					</CardDescription>
				</CardHeader>
				<CardContent>
					<GitHubConnectButton />
				</CardContent>
			</Card>

			{/* GitHub App Integration */}
			<GitHubAppSettings />

			{/* Repositories List */}
			<Card>
				<CardHeader>
					<CardTitle>Configured Repositories</CardTitle>
					<CardDescription>
						Repositories configured for webhook-based PR creation
					</CardDescription>
				</CardHeader>
				<CardContent>
					{repositories.length === 0 ? (
						<div className="text-center py-8">
							<Github className="h-12 w-12 mx-auto text-neutral-400 mb-4" />
							<h3 className="text-lg font-medium mb-2">No repositories configured</h3>
							<p className="text-neutral-600 dark:text-neutral-400 mb-4">
								Add a repository to start receiving webhook events and automatically create PRs
							</p>
							<Button onClick={handleAddRepository} variant="outline" className="gap-2">
								<Plus className="h-4 w-4" />
								Add Your First Repository
							</Button>
						</div>
					) : (
						<div className="space-y-4">
							{repositories.map((repo) => (
								<RepositoryCard key={repo._id} repository={repo} />
							))}
						</div>
					)}
				</CardContent>
			</Card>

			{/* Add Repository Dialog */}
			<AddRepositoryDialog
				open={showAddDialog}
				onOpenChange={setShowAddDialog}
			/>
		</div>
	)
}

export default SettingsPage
