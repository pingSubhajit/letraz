'use client'

import {useEffect, useState} from 'react'
import {toast} from 'sonner'
import {bulkUpdateWaitlistEntries, fetchWaitlistEntries, WaitlistEntry} from '@/lib/actions/waitlistActions'
import WaitlistTable from '@/components/waitlist/WaitlistTable'
import {Loader2, RefreshCw} from 'lucide-react'
import {Button} from '@/components/ui/button'

const WaitlistPage = () => {
	const [entries, setEntries] = useState<WaitlistEntry[]>([])
	const [loading, setLoading] = useState(true)
	const [bulkUpdateLoading, setBulkUpdateLoading] = useState(false)
	const [refreshing, setRefreshing] = useState(false)

	const loadEntries = async () => {
		try {
			const response = await fetchWaitlistEntries()
			if (response.success && response.data) {
				setEntries(response.data)
			} else {
				toast.error(response.error || 'Failed to load waitlist entries')
			}
		} catch (error) {
			toast.error('An unexpected error occurred')
		} finally {
			setLoading(false)
		}
	}

	const refreshEntries = async () => {
		setRefreshing(true)
		try {
			const response = await fetchWaitlistEntries()
			if (response.success && response.data) {
				setEntries(response.data)
				toast.success('Waitlist refreshed successfully')
			} else {
				toast.error(response.error || 'Failed to refresh waitlist entries')
			}
		} catch (error) {
			toast.error('An unexpected error occurred')
		} finally {
			setRefreshing(false)
		}
	}

	const handleBulkGrantAccess = async (selectedIds: string[]) => {
		setBulkUpdateLoading(true)
		try {
			const response = await bulkUpdateWaitlistEntries(selectedIds, true, entries)
			if (response.success) {
				const selectedEmails = entries
					.filter(entry => selectedIds.includes(entry.id))
					.map(entry => entry.email)

				toast.success(`Successfully granted access to ${selectedIds.length} user(s) and added them to Clerk allowlist`)

				// Update local state to reflect the changes
				setEntries(prevEntries => prevEntries.map(entry => selectedIds.includes(entry.id)
					? {...entry, has_access: true}
					: entry))
			} else {
				toast.error(response.error || 'Failed to grant access')
			}
		} catch (error) {
			toast.error('An unexpected error occurred')
		} finally {
			setBulkUpdateLoading(false)
		}
	}

	useEffect(() => {
		loadEntries()
	}, [])

	const awaitingApprovalEntries = entries.filter(entry => !entry.has_access)
	const approvedEntries = entries.filter(entry => entry.has_access)

	if (loading) {
		return (
			<div className="flex items-center justify-center h-full">
				<div className="flex items-center space-x-2">
					<Loader2 className="h-6 w-6 animate-spin" />
					<span>Loading waitlist entries...</span>
				</div>
			</div>
		)
	}

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<div>
					<h1 className="text-2xl font-bold">Waitlist Management</h1>
					<p className="text-muted-foreground">
						Manage user access to the Letraz platform
					</p>
				</div>
				<Button
					onClick={refreshEntries}
					disabled={refreshing}
					variant="outline"
					className="flex items-center space-x-2"
				>
					<RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
					<span>Refresh</span>
				</Button>
			</div>

			<div className="space-y-6">
				<WaitlistTable
					entries={awaitingApprovalEntries}
					title="Awaiting Approval"
					description={`${awaitingApprovalEntries.length} user(s) waiting for access approval`}
					showBulkAction={true}
					bulkActionLabel="Grant Access"
					onBulkAction={handleBulkGrantAccess}
					isLoading={bulkUpdateLoading}
				/>

				<WaitlistTable
					entries={approvedEntries}
					title="Can Access"
					description={`${approvedEntries.length} user(s) with approved access`}
					showBulkAction={false}
				/>
			</div>
		</div>
	)
}

export default WaitlistPage
