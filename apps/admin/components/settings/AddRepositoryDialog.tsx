'use client'

import {useEffect, useState} from 'react'
import {useMutation} from 'convex/react'
import {api} from '@/convex/_generated/api'
import {fetchMutation} from 'convex/nextjs'
import {toast} from 'sonner'
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from '@/components/ui/dialog'
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select'
import {Button} from '@/components/ui/button'
import {Label} from '@/components/ui/label'
import {CheckCircle, Github, Loader2} from 'lucide-react'
import {useLinearUser} from '@/hooks/useLinearUser'

// Generate webhook secret
const generateWebhookSecret = (): string => {
	const bytes = new Uint8Array(32)
	crypto.getRandomValues(bytes)
	return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('')
}

interface AddRepositoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface GitHubRepository {
  id: number
  name: string
  full_name: string
  html_url: string
  description: string | null
  private: boolean
}

export const AddRepositoryDialog = ({open, onOpenChange}: AddRepositoryDialogProps) => {
	const {user} = useLinearUser()
	const [isLoading, setIsLoading] = useState(false)
	const [repositories, setRepositories] = useState<GitHubRepository[]>([])
	const [selectedRepoId, setSelectedRepoId] = useState<string>('')
	const [step, setStep] = useState<'select' | 'confirm'>('select')

	const createRepository = useMutation(api.repositories.createRepository)

	const fetchRepositories = async () => {
		if (!user?.id) {
			toast.error('User not authenticated')
			return
		}

		setIsLoading(true)
		try {
			const res = await fetch('/api/github-app/repositories', {cache: 'no-store'})
			if (!res.ok) throw new Error('Failed to fetch repositories')
			const data = await res.json()
			setRepositories(data.repositories || [])
			setStep('select')
		} catch (error) {
			toast.error('Failed to fetch repositories from GitHub App')
		} finally {
			setIsLoading(false)
		}
	}

	// Load repositories automatically when dialog opens
	useEffect(() => {
		if (open && user?.id) {
			fetchRepositories()
		}
	}, [open, user?.id])

	const handleRepositorySelect = (repoId: string) => {
		setSelectedRepoId(repoId)
		setStep('confirm')
	}

	const handleAddRepository = async () => {
		if (!user?.id || !selectedRepoId) return

		setIsLoading(true)
		try {
			const selectedRepo = repositories.find((r: any) => r.id.toString() === selectedRepoId)
			if (!selectedRepo || !(selectedRepo as any).owner?.login) throw new Error('Repository not found or invalid owner')

			// Use GitHub App installation token server-side; no client OAuth required

			// Test webhook URL accessibility
			const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/github/webhooks`
			try {
				const testResponse = await fetch(webhookUrl, {method: 'GET'})
			} catch {}

			// Check for existing webhooks first
			const existingWebhooks = [] as any[]

			const ourWebhook = existingWebhooks.find(hook => hook.config.url === webhookUrl && hook.events.includes('push'))

			if (ourWebhook) {
				throw new Error(`Webhook already exists for ${selectedRepo.name}. Please check your GitHub repository's webhook settings and either delete the existing webhook or verify its configuration. The webhook URL should be: ${webhookUrl}`)
			}

			// Create webhook in GitHub first (before saving to database)
			const webhookSecret = generateWebhookSecret()

			// Create webhook using server-side App token
			try {
				const res = await fetch('/api/github-app/create-webhook', {
					method: 'POST',
					headers: {'Content-Type': 'application/json'},
					body: JSON.stringify({
						owner: (selectedRepo as any).owner.login,
						repo: selectedRepo.name,
						url: webhookUrl,
						secret: webhookSecret
					})
				})

				if (!res.ok) throw new Error('Webhook creation failed')
			} catch (webhookError) {
				throw webhookError instanceof Error ? webhookError : new Error('Failed to create webhook')
			}

			// Save repository to database after webhook creation succeeds
			const repositoryResult = await createRepository({
				name: selectedRepo.name,
				owner: (selectedRepo as any).owner.login,
				githubId: selectedRepo.id,
				accessToken: '',
				createdByUserId: user.id
			})

			// Update the repository with the webhook secret
			await fetchMutation(api.repositories.updateRepository, {
				id: repositoryResult.id,
				webhookSecret: webhookSecret
			})

			toast.success(`Repository ${selectedRepo.name} added successfully! Webhook may need to be created manually in GitHub if you see permission errors.`)
			onOpenChange(false)
			setStep('select')
			setSelectedRepoId('')
		} catch (error) {
			toast.error(error instanceof Error ? error.message : 'Failed to add repository')
		} finally {
			setIsLoading(false)
		}
	}

	const handleOpenChange = (newOpen: boolean) => {
		if (!newOpen) {
			setStep('select')
			setSelectedRepoId('')
			setRepositories([])
			setIsLoading(false)
		}
		onOpenChange(newOpen)
	}

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Github className="h-5 w-5" />
						Add GitHub Repository
					</DialogTitle>
					<DialogDescription>
						Select a repository to configure for webhook-based PR creation
					</DialogDescription>
				</DialogHeader>

				{step === 'select' ? (
					<div className="space-y-4">
						<div>
							<Label htmlFor="repository">Repository</Label>
							{isLoading && (
								<div className="flex items-center gap-2 mt-2">
									<Loader2 className="h-4 w-4 animate-spin" />
									<span className="text-sm text-neutral-600">Loading repositories...</span>
								</div>
							)}
						</div>

						{isLoading ? (
							<div className="text-center py-8 text-neutral-500">
								<Github className="h-12 w-12 mx-auto mb-4 opacity-50" />
								<p>Loading your GitHub repositories...</p>
							</div>
						) : repositories.length > 0 ? (
							<div className="w-full">
								<Select value={selectedRepoId} onValueChange={handleRepositorySelect}>
									<SelectTrigger className="w-full">
										<SelectValue placeholder="Select a repository" />
									</SelectTrigger>
									<SelectContent className="w-[400px] max-h-[300px]">
										{repositories
											.filter((repo: any) => repo.owner && repo.owner.login)
											.map((repo: any) => (
												<SelectItem key={repo.id} value={repo.id.toString()} className="w-full">
													<div className="flex items-center justify-between w-full min-w-0">
														<div className="flex-1 min-w-0">
															<div className="font-medium truncate">{repo.name}</div>
															<div className="text-sm text-neutral-500 truncate">
																{repo.description || 'No description'}
															</div>
														</div>
														<div className="ml-3 flex-shrink-0">
															{repo.private ? (
																<span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
																	Private
																</span>
															) : (
																<span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
																	Public
																</span>
															)}
														</div>
													</div>
												</SelectItem>
											))}
									</SelectContent>
								</Select>
							</div>
						) : (
							<div className="text-center py-8 text-neutral-500">
								<Github className="h-12 w-12 mx-auto mb-4 opacity-50" />
								<p>No repositories found. Make sure you have GitHub connected and have repositories to select from.</p>
							</div>
						)}
					</div>
				) : (
					<div className="space-y-4">
						{(() => {
							const selectedRepo = repositories.find((r: any) => r.id.toString() === selectedRepoId)
							if (!selectedRepo || !(selectedRepo as any).owner?.login) return null

							return (
								<div className="p-4 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
									<div className="flex items-center gap-3">
										<CheckCircle className="h-5 w-5 text-green-500" />
										<div>
											<h3 className="font-medium">{selectedRepo.name}</h3>
											<p className="text-sm text-neutral-600 dark:text-neutral-400">
												{selectedRepo.full_name}
											</p>
											{selectedRepo.description && (
												<p className="text-sm text-neutral-500 mt-1">
													{selectedRepo.description}
												</p>
											)}
										</div>
									</div>
								</div>
							)
						})()}

						<div className="text-sm text-neutral-600 dark:text-neutral-400">
							<p>
								<strong>What happens next?</strong>
							</p>
							<ul className="list-disc list-inside mt-2 space-y-1">
								<li>A webhook will be created in the selected repository</li>
								<li>The system will listen for push events</li>
								<li>PRs will be automatically created for matching Linear issues</li>
							</ul>
						</div>
					</div>
				)}

				<DialogFooter>
					{step === 'select' ? (
						<Button
							onClick={() => onOpenChange(false)}
							variant="outline"
						>
							Cancel
						</Button>
					) : (
						<>
							<Button
								onClick={() => setStep('select')}
								variant="outline"
								disabled={isLoading}
							>
								Back
							</Button>
							<Button
								onClick={handleAddRepository}
								disabled={isLoading}
								className="gap-2"
							>
								{isLoading ? (
									<Loader2 className="h-4 w-4 animate-spin" />
								) : (
									<CheckCircle className="h-4 w-4" />
								)}
								{isLoading ? 'Adding...' : 'Add Repository'}
							</Button>
						</>
					)}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
