'use client'

import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from '@/components/ui/dropdown-menu'
import {Button} from '@/components/ui/button'
import {ChevronDown} from 'lucide-react'
import {useState} from 'react'
import {Issue} from '@linear/sdk'
import {cn} from '@/lib/utils'

type IssueSelectProps = {
	issues: Issue[]
	isLoading: boolean
	error: string | null
	onSelect: (issueId: string) => void
}

const IssueSelect = ({issues, isLoading, error, onSelect}: IssueSelectProps) => {
	const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null)

	if (error) {
		return (
			<div className="rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900 p-3">
				<p className="text-sm text-red-600 dark:text-red-400">{error}</p>
			</div>
		)
	}

	const handleSelect = (issue: Issue) => {
		setSelectedIssue(issue)
		onSelect(issue.id)
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="outline"
					className={cn(
						'w-full justify-between border-neutral-200 dark:border-neutral-800',
						'bg-white dark:bg-neutral-900',
						'focus-visible:ring-0 focus-visible:ring-offset-0',
						'hover:bg-neutral-50 dark:hover:bg-neutral-800'
					)}
					disabled={isLoading}
				>
					<span className="truncate font-normal">
						{isLoading
							? 'Loading issues...'
							: selectedIssue
								? `${selectedIssue.identifier}: ${selectedIssue.title}`
								: 'Select an in-progress issue'}
					</span>
					<ChevronDown className="ml-2 h-4 w-4 opacity-50" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				align="start"
				className="w-[var(--radix-dropdown-menu-trigger-width)] max-h-[280px] overflow-y-auto"
			>
				{issues.length === 0 ? (
					<DropdownMenuItem disabled className="text-neutral-500">
						No in-progress issues assigned to you
					</DropdownMenuItem>
				) : (
					issues.map(issue => (
						<DropdownMenuItem
							key={issue.id}
							onSelect={() => handleSelect(issue)}
							className="flex items-center py-2 px-3"
						>
							<div className="min-w-0">
								<div className="flex items-center gap-2">
									<span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
										{issue.identifier}
									</span>
									<span className="truncate text-sm text-neutral-500 dark:text-neutral-400">
										{issue.title}
									</span>
								</div>
							</div>
						</DropdownMenuItem>
					))
				)}
			</DropdownMenuContent>
		</DropdownMenu>
	)
}

export default IssueSelect
