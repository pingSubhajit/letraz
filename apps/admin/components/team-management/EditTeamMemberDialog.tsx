'use client'

import {useEffect, useState} from 'react'
import {useMutation} from 'convex/react'
import {api} from '@/convex/_generated/api'
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from '@/components/ui/dialog'
import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'
import {Label} from '@/components/ui/label'
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select'
import {Textarea} from '@/components/ui/textarea'
import {ImageUpload} from '@/components/ui/image-upload'
import {toast} from 'sonner'
import {Loader2} from 'lucide-react'
import type {EnrichedTeamMember} from '@/types/teamMember'

interface EditTeamMemberDialogProps {
  member: EnrichedTeamMember;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EditTeamMemberDialog = ({
	member,
	open,
	onOpenChange
}: EditTeamMemberDialogProps) => {
	const [isLoading, setIsLoading] = useState(false)
	const [formData, setFormData] = useState({
		name: '',
		email: '',
		phone: '',
		department: '' as 'Core Team' | 'Marketing Team' | '',
		position: '',
		joiningDate: '',
		photo: '',
		bio: ''
	})

	const updateTeamMember = useMutation(api.teamMembers.updateTeamMember)

	// Initialize form data when member changes
	useEffect(() => {
		if (member) {
			setFormData({
				name: member.name,
				email: member.email,
				phone: member.phone || '',
				department: member.department,
				position: member.position || '',
				joiningDate: member.joiningDate,
				photo: member.photo || '',
				bio: member.bio || ''
			})
		}
	}, [member])

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		if (!formData.name || !formData.email || !formData.phone || !formData.department || !formData.joiningDate || !formData.photo) {
			toast.error('Please fill in all required fields')
			return
		}

		setIsLoading(true)

		try {
			await updateTeamMember({
				id: member._id,
				name: formData.name,
				email: formData.email,
				phone: formData.phone || undefined,
				department: formData.department,
				position: formData.position || undefined,
				joiningDate: formData.joiningDate,
				photo: formData.photo || undefined,
				bio: formData.bio || undefined
			})

			toast.success('Team member updated successfully!')
			onOpenChange(false)
		} catch (error) {
			toast.error(error instanceof Error ? error.message : 'Failed to update team member')
		} finally {
			setIsLoading(false)
		}
	}

	const handleInputChange = (field: keyof typeof formData, value: string) => {
		setFormData(prev => ({...prev, [field]: value}))
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Edit Team Member</DialogTitle>
					<DialogDescription>
						Update {member.name}'s information below.
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="edit-name">
								Name <span className="text-red-500">*</span>
							</Label>
							<Input
								id="edit-name"
								value={formData.name}
								onChange={(e) => handleInputChange('name', e.target.value)}
								placeholder="Enter full name"
								disabled={isLoading}
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="edit-email">
								Email <span className="text-red-500">*</span>
							</Label>
							<Input
								id="edit-email"
								type="email"
								value={formData.email}
								onChange={(e) => handleInputChange('email', e.target.value)}
								placeholder="Enter email address"
								disabled={isLoading}
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="edit-phone">
								Phone <span className="text-red-500">*</span>
							</Label>
							<Input
								id="edit-phone"
								value={formData.phone}
								onChange={(e) => handleInputChange('phone', e.target.value)}
								placeholder="Enter phone number"
								disabled={isLoading}
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="edit-department">
								Department <span className="text-red-500">*</span>
							</Label>
							<Select
								value={formData.department}
								onValueChange={(value: 'Core Team' | 'Marketing Team') => handleInputChange('department', value)
								}
								disabled={isLoading}
							>
								<SelectTrigger>
									<SelectValue placeholder="Select department" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="Core Team">Core Team</SelectItem>
									<SelectItem value="Marketing Team">Marketing Team</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-2">
							<Label htmlFor="edit-position">Position</Label>
							<Input
								id="edit-position"
								value={formData.position}
								onChange={(e) => handleInputChange('position', e.target.value)}
								placeholder="e.g., Software Engineer, Designer"
								disabled={isLoading}
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="edit-joiningDate">
								Joining Date <span className="text-red-500">*</span>
							</Label>
							<Input
								id="edit-joiningDate"
								type="date"
								value={formData.joiningDate}
								onChange={(e) => handleInputChange('joiningDate', e.target.value)}
								disabled={isLoading}
							/>
						</div>
					</div>

					<ImageUpload
						value={formData.photo}
						onChange={(value) => handleInputChange('photo', value || '')}
						disabled={isLoading}
						label="Photo *"
					/>

					<div className="space-y-2">
						<Label htmlFor="edit-bio">Bio</Label>
						<Textarea
							id="edit-bio"
							value={formData.bio}
							onChange={(e) => handleInputChange('bio', e.target.value)}
							placeholder="Brief bio or description"
							rows={3}
							disabled={isLoading}
						/>
					</div>

					<div className="flex justify-end space-x-2 pt-4">
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
							disabled={isLoading}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={isLoading}>
							{isLoading ? (
								<>
									<Loader2 className="w-4 h-4 mr-2 animate-spin" />
									Updating...
								</>
							) : (
								'Update Member'
							)}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	)
}

export default EditTeamMemberDialog
