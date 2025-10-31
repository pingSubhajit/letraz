'use client'

import {useState} from 'react'
import {Filter, GitPullRequest} from 'lucide-react'
import {SiLinear} from 'react-icons/si'
import {Button} from '@/components/ui/button'
import useLinearClient from '@/hooks/useLinearClient'
import IssueSelect from '@/components/generate-pr/IssueSelect'
import {CustomInstructionsDialog} from '@/components/generate-pr/CustomInstructionsDialog'
import {PRDescription} from '@/components/generate-pr/PRDescription'

const PRGenerator = () => {
	const {issues, isLoading, error: linearError} = useLinearClient()
	const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null)
	const [isGenerating, setIsGenerating] = useState(false)
	const [completion, setCompletion] = useState<string | null>(null)
	const [generationError, setGenerationError] = useState<string | null>(null)
	const [customInstructions, setCustomInstructions] = useState('')

	const selectedIssue = issues.find(issue => issue.id === selectedIssueId)

	const handleGeneratePR = async () => {
		if (!selectedIssue) return
		setIsGenerating(true)
		setGenerationError(null)
		try {
			const response = await fetch('/api/generate', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					issue: selectedIssue,
					customInstructions: customInstructions.trim()
				})
			})

			const data = await response.json()

			if (!response.ok) {
				throw new Error(data.error || 'Failed to generate PR description')
			}

			setCompletion(data.text)
		} catch (err) {
			setGenerationError(err instanceof Error ? err.message : 'Something went wrong')
		} finally {
			setIsGenerating(false)
		}
	}

	return (
		<div className="space-y-3">
			<div className="flex items-center gap-2 px-1">
				<Filter className="h-3.5 w-3.5 text-neutral-400" />
				<p className="text-sm text-neutral-500 dark:text-neutral-400">
					Filtered to show in-progress issues assigned to you
				</p>
			</div>

			<div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
				<div className="p-5">
					<div className="space-y-1.5">
						<div className="flex items-center justify-between mb-2">
							<div className="flex items-center gap-1.5">
								<SiLinear className="h-3 w-3" />
								<label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
									Linear Issue
								</label>
							</div>
							<CustomInstructionsDialog
								value={customInstructions}
								onChange={setCustomInstructions}
							/>
						</div>
						<IssueSelect
							issues={issues}
							isLoading={isLoading}
							error={linearError}
							onSelect={setSelectedIssueId}
						/>
					</div>
				</div>

				{isGenerating && <GeneratingIndicator />}

				{completion && !isGenerating && (
					<div className="border-t border-neutral-200 dark:border-neutral-800">
						<div className="p-5">
							<PRDescription content={completion} onChange={setCompletion} />
						</div>
					</div>
				)}

				{generationError && <ErrorMessage error={generationError} />}

				<div className="border-t border-neutral-200 dark:border-neutral-800">
					<div className="p-4 flex items-center justify-between">
						<StatusMessage
							completion={completion}
							selectedIssueId={selectedIssueId}
						/>
						<Button
							disabled={!selectedIssueId || isGenerating}
							onClick={handleGeneratePR}
							variant="secondary"
							size="sm"
							className="h-8 px-3 text-xs font-medium"
						>
							<GitPullRequest className="h-3.5 w-3.5" />
							{isGenerating ? 'Generating...' : 'Generate Description'}
						</Button>
					</div>
				</div>
			</div>
		</div>
	)
}

const GeneratingIndicator = () => (
	<div className="border-t border-neutral-200 dark:border-neutral-800">
		<div className="p-5">
			<div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 p-8">
				<div className="flex flex-col items-center justify-center gap-3">
					<div className="h-5 w-5 animate-spin rounded-full border-2 border-neutral-800 border-t-transparent dark:border-neutral-200 dark:border-t-transparent" />
					<p className="text-sm text-neutral-600 dark:text-neutral-400">
						Generating PR description...
					</p>
				</div>
			</div>
		</div>
	</div>
)

const ErrorMessage = ({error}: {error: string}) => (
	<div className="border-t border-neutral-200 dark:border-neutral-800">
		<div className="p-5">
			<div className="rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900 p-3">
				<p className="text-sm text-red-600 dark:text-red-400">{error}</p>
			</div>
		</div>
	</div>
)

const StatusMessage = ({
	completion,
	selectedIssueId
}: {
	completion: string | null
	selectedIssueId: string | null
}) => (
	<p className="text-sm text-neutral-500 dark:text-neutral-400">
		{completion
			? 'PR description generated successfully'
			: selectedIssueId
				? 'Ready to generate PR description'
				: 'Select an in-progress issue to continue'}
	</p>
)

export default PRGenerator
