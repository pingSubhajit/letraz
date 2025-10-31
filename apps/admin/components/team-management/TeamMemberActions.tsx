'use client'

import {useState} from 'react'
import {useMutation} from 'convex/react'
import {api} from '@/convex/_generated/api'
import {Button} from '@/components/ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from '@/components/ui/dialog'
import {Edit, Eye, MoreHorizontal, Trash2} from 'lucide-react'
import {toast} from 'sonner'
import type {EnrichedTeamMember} from '@/types/teamMember'
import EditTeamMemberDialog from './EditTeamMemberDialog'
import ViewTeamMemberDialog from './ViewTeamMemberDialog'

interface TeamMemberActionsProps {
  member: EnrichedTeamMember;
}

const TeamMemberActions = ({member}: TeamMemberActionsProps) => {
	const [showEditDialog, setShowEditDialog] = useState(false)
	const [showViewDialog, setShowViewDialog] = useState(false)
	const [showDeleteDialog, setShowDeleteDialog] = useState(false)
	const [isDeleting, setIsDeleting] = useState(false)

	const deleteTeamMember = useMutation(api.teamMembers.deleteTeamMember)

	const handleDelete = async () => {
		setIsDeleting(true)
		try {
			await deleteTeamMember({id: member._id})
			toast.success('Team member removed successfully')
			setShowDeleteDialog(false)
		} catch (error) {
			toast.error('Failed to remove team member')
		} finally {
			setIsDeleting(false)
		}
	}

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost" className="h-8 w-8 p-0">
						<span className="sr-only">Open menu</span>
						<MoreHorizontal className="h-4 w-4" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<DropdownMenuItem onClick={() => setShowViewDialog(true)}>
						<Eye className="mr-2 h-4 w-4" />
						View Details
					</DropdownMenuItem>
					<DropdownMenuItem onClick={() => setShowEditDialog(true)}>
						<Edit className="mr-2 h-4 w-4" />
						Edit
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem
						onClick={() => setShowDeleteDialog(true)}
						className="text-destructive"
					>
						<Trash2 className="mr-2 h-4 w-4" />
						Delete
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			{/* View Dialog */}
			<ViewTeamMemberDialog
				member={member}
				open={showViewDialog}
				onOpenChange={setShowViewDialog}
			/>

			{/* Edit Dialog */}
			<EditTeamMemberDialog
				member={member}
				open={showEditDialog}
				onOpenChange={setShowEditDialog}
			/>

			{/* Delete Confirmation Dialog */}
			<Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Delete Team Member</DialogTitle>
						<DialogDescription>
							Are you sure you want to remove <strong>{member.name}</strong> from the team?
							This action cannot be undone.
						</DialogDescription>
					</DialogHeader>
					<div className="flex justify-end space-x-2">
						<Button
							variant="outline"
							onClick={() => setShowDeleteDialog(false)}
							disabled={isDeleting}
						>
							Cancel
						</Button>
						<Button
							variant="destructive"
							onClick={handleDelete}
							disabled={isDeleting}
						>
							{isDeleting ? 'Deleting...' : 'Delete'}
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		</>
	)
}

export default TeamMemberActions
