'use client'

import {useState} from 'react'
import {WaitlistEntry} from '@/lib/actions/waitlistActions'
import {Button} from '@/components/ui/button'
import {Checkbox} from '@/components/ui/checkbox'
import {Badge} from '@/components/ui/badge'
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card'
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table'
import {format} from 'date-fns'
import ClerkAllowlistStatusColumn from './ClerkAllowlistStatusColumn'

interface WaitlistTableProps {
  entries: WaitlistEntry[]
  title: string
  description: string
  showBulkAction?: boolean
  bulkActionLabel?: string
  onBulkAction?: (selectedIds: string[]) => void
  isLoading?: boolean
}

const WaitlistTable = ({
	entries,
	title,
	description,
	showBulkAction = false,
	bulkActionLabel = 'Update',
	onBulkAction,
	isLoading = false
}: WaitlistTableProps) => {
	const [selectedIds, setSelectedIds] = useState<string[]>([])

	const handleSelectAll = (checked: boolean) => {
		if (checked) {
			setSelectedIds(entries.map(entry => entry.id))
		} else {
			setSelectedIds([])
		}
	}

	const handleSelectEntry = (id: string, checked: boolean) => {
		if (checked) {
			setSelectedIds(prev => [...prev, id])
		} else {
			setSelectedIds(prev => prev.filter(selectedId => selectedId !== id))
		}
	}

	const handleBulkAction = () => {
		if (onBulkAction && selectedIds.length > 0) {
			onBulkAction(selectedIds)
			setSelectedIds([])
		}
	}

	const formatDate = (dateString: string) => {
		try {
			return format(new Date(dateString), 'MMM dd, yyyy')
		} catch {
			return dateString
		}
	}

	return (
		<Card>
			<CardHeader>
				<div className="flex justify-between items-center">
					<div>
						<CardTitle className="text-xl">{title}</CardTitle>
						<CardDescription>{description}</CardDescription>
					</div>
					{showBulkAction && selectedIds.length > 0 && (
						<Button
							onClick={handleBulkAction}
							disabled={isLoading}
							className="ml-4"
						>
							{bulkActionLabel} ({selectedIds.length})
						</Button>
					)}
				</div>
			</CardHeader>
			<CardContent>
				{entries.length === 0 ? (
					<div className="text-center py-8 text-muted-foreground">
						No entries found
					</div>
				) : (
					<Table>
						<TableHeader>
							<TableRow>
								{showBulkAction && (
									<TableHead className="w-12">
										<Checkbox
											checked={selectedIds.length === entries.length}
											onCheckedChange={handleSelectAll}
											disabled={isLoading}
										/>
									</TableHead>
								)}
								<TableHead>Email</TableHead>
								<TableHead>Name</TableHead>
								<TableHead>Created At</TableHead>
								<TableHead>Status</TableHead>
								<TableHead>Clerk Allowlist</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{entries.map((entry) => (
								<TableRow key={entry.id}>
									{showBulkAction && (
										<TableCell>
											<Checkbox
												checked={selectedIds.includes(entry.id)}
												onCheckedChange={(checked) => handleSelectEntry(entry.id, checked as boolean)}
												disabled={isLoading}
											/>
										</TableCell>
									)}
									<TableCell className="font-medium">{entry.email}</TableCell>
									<TableCell>
										{entry.first_name || entry.last_name
											? `${entry.first_name || ''} ${entry.last_name || ''}`.trim()
											: 'N/A'}
									</TableCell>
									<TableCell>{formatDate(entry.created_at)}</TableCell>
									<TableCell>
										<Badge variant={entry.has_access ? 'success' : 'secondary'}>
											{entry.has_access ? 'Has Access' : 'Awaiting Approval'}
										</Badge>
									</TableCell>
									<TableCell>
										<ClerkAllowlistStatusColumn
											email={entry.email}
											hasAccess={entry.has_access}
										/>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				)}
			</CardContent>
		</Card>
	)
}

export default WaitlistTable
