'use client'

import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card'
import {Button} from '@/components/ui/button'
import {Badge} from '@/components/ui/badge'
import {AlertCircle, CheckCircle, ExternalLink, Github, Settings, Trash2} from 'lucide-react'
import {useState} from 'react'
import {useMutation} from 'convex/react'
import {api} from '@/convex/_generated/api'
import {toast} from 'sonner'
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger
} from '@/components/ui/alert-dialog'

interface RepositoryCardProps {
  repository: {
    _id: string
    name: string
    owner: string
    githubId: number
    isActive: boolean
    createdAt: string
    updatedAt: string
    webhookSecret?: string
  }
}

export const RepositoryCard = ({repository}: RepositoryCardProps) => {
	const [isDeleting, setIsDeleting] = useState(false)
	const deleteRepository = useMutation(api.repositories.deleteRepository)

	const handleDelete = async () => {
		setIsDeleting(true)
		try {
			await deleteRepository({id: repository._id as any})
			toast.success('Repository removed successfully')
		} catch (error) {
			toast.error('Failed to remove repository')
		} finally {
			setIsDeleting(false)
		}
	}

	const getRepositoryUrl = () => {
		return `https://github.com/${repository.owner}/${repository.name}`
	}

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString()
	}

	return (
		<Card className="relative">
			<CardHeader className="pb-3">
				<div className="flex items-start justify-between">
					<div className="flex items-center gap-3">
						<Github className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
						<div>
							<CardTitle className="text-lg">{repository.name}</CardTitle>
							<CardDescription className="flex items-center gap-1">
								<span>{repository.owner}</span>
								<span>•</span>
								<span>Added {formatDate(repository.createdAt)}</span>
							</CardDescription>
						</div>
					</div>

					<div className="flex items-center gap-2">
						<Badge variant={repository.isActive ? 'default' : 'secondary'}>
							{repository.isActive ? (
								<>
									<CheckCircle className="h-3 w-3 mr-1" />
									Active
								</>
							) : (
								<>
									<AlertCircle className="h-3 w-3 mr-1" />
									Inactive
								</>
							)}
						</Badge>

						<Button
							variant="ghost"
							size="sm"
							onClick={() => window.open(getRepositoryUrl(), '_blank')}
							className="h-8 w-8 p-0"
						>
							<ExternalLink className="h-4 w-4" />
						</Button>

						<AlertDialog>
							<AlertDialogTrigger asChild>
								<Button
									variant="ghost"
									size="sm"
									className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
								>
									<Trash2 className="h-4 w-4" />
								</Button>
							</AlertDialogTrigger>
							<AlertDialogContent>
								<AlertDialogHeader>
									<AlertDialogTitle>Remove Repository</AlertDialogTitle>
									<AlertDialogDescription>
										Are you sure you want to remove {repository.name}? This will disable webhook processing for this repository.
									</AlertDialogDescription>
								</AlertDialogHeader>
								<AlertDialogFooter>
									<AlertDialogCancel>Cancel</AlertDialogCancel>
									<AlertDialogAction
										onClick={handleDelete}
										disabled={isDeleting}
										className="bg-red-500 hover:bg-red-600"
									>
										{isDeleting ? 'Removing...' : 'Remove Repository'}
									</AlertDialogAction>
								</AlertDialogFooter>
							</AlertDialogContent>
						</AlertDialog>
					</div>
				</div>
			</CardHeader>

			<CardContent className="pt-0">
				<div className="flex items-center justify-between text-sm text-neutral-600 dark:text-neutral-400">
					<div className="flex items-center gap-4">
						<span>Repository ID: {repository.githubId}</span>
						<span>Last updated: {formatDate(repository.updatedAt)}</span>
					</div>

					<Button variant="outline" size="sm" className="gap-2">
						<Settings className="h-4 w-4" />
						Configure
					</Button>
				</div>

				{/* Webhook Secret - Show only if available */}
				{repository.webhookSecret && (
					<div className="mt-3 p-2 bg-neutral-50 dark:bg-neutral-900 rounded text-xs font-mono">
						<div className="flex items-center justify-between">
							<span>Webhook Secret:</span>
							<code className="text-neutral-600 dark:text-neutral-400">
								{repository.webhookSecret.substring(0, 8)}...
							</code>
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	)
}
