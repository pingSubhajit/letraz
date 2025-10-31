'use client'

import {Dialog, DialogContent, DialogHeader, DialogTitle} from '@/components/ui/dialog'
import {Badge} from '@/components/ui/badge'
import {Card, CardContent} from '@/components/ui/card'
import {format} from 'date-fns'
import {Briefcase, Calendar, Mail, Phone, User} from 'lucide-react'
import type {EnrichedTeamMember} from '@/types/teamMember'

interface ViewTeamMemberDialogProps {
  member: EnrichedTeamMember;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ViewTeamMemberDialog = ({
	member,
	open,
	onOpenChange
}: ViewTeamMemberDialogProps) => {
	const getDepartmentBadgeVariant = (department: string) => {
		return department === 'Core Team' ? 'default' : 'secondary'
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>Team Member Details</DialogTitle>
				</DialogHeader>

				<div className="space-y-6">
					{/* Profile Section */}
					<div className="flex items-center space-x-4">
						<div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
							{member.photoUrl ? (
								<img
									src={member.photoUrl}
									alt={member.name}
									className="w-16 h-16 rounded-full object-cover"
								/>
							) : (
								<span className="text-2xl font-medium text-primary">
									{member.name.charAt(0).toUpperCase()}
								</span>
							)}
						</div>
						<div className="flex-1">
							<h3 className="text-xl font-semibold">{member.name}</h3>
							<div className="flex items-center space-x-2 mt-1">
								<Badge variant={getDepartmentBadgeVariant(member.department)}>
									{member.department}
								</Badge>
								{member.position && (
									<span className="text-sm text-muted-foreground">
										{member.position}
									</span>
								)}
							</div>
						</div>
					</div>

					{/* Contact Information */}
					<Card>
						<CardContent className="pt-4">
							<h4 className="font-medium mb-3 flex items-center">
								<User className="w-4 h-4 mr-2" />
								Contact Information
							</h4>
							<div className="space-y-3">
								<div className="flex items-center space-x-3">
									<Mail className="w-4 h-4 text-muted-foreground" />
									<span className="text-sm">{member.email}</span>
								</div>
								{member.phone && (
									<div className="flex items-center space-x-3">
										<Phone className="w-4 h-4 text-muted-foreground" />
										<span className="text-sm">{member.phone}</span>
									</div>
								)}
							</div>
						</CardContent>
					</Card>

					{/* Work Information */}
					<Card>
						<CardContent className="pt-4">
							<h4 className="font-medium mb-3 flex items-center">
								<Briefcase className="w-4 h-4 mr-2" />
								Work Information
							</h4>
							<div className="space-y-3">
								<div className="flex items-center justify-between">
									<span className="text-sm text-muted-foreground">Department:</span>
									<Badge variant={getDepartmentBadgeVariant(member.department)}>
										{member.department}
									</Badge>
								</div>
								{member.position && (
									<div className="flex items-center justify-between">
										<span className="text-sm text-muted-foreground">Position:</span>
										<span className="text-sm font-medium">{member.position}</span>
									</div>
								)}
								<div className="flex items-center justify-between">
									<span className="text-sm text-muted-foreground">Joining Date:</span>
									<div className="flex items-center space-x-2">
										<Calendar className="w-4 h-4 text-muted-foreground" />
										<span className="text-sm font-medium">
											{format(new Date(member.joiningDate), 'MMMM d, yyyy')}
										</span>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Bio Section */}
					{member.bio && (
						<Card>
							<CardContent className="pt-4">
								<h4 className="font-medium mb-3">Bio</h4>
								<p className="text-sm text-muted-foreground leading-relaxed">
									{member.bio}
								</p>
							</CardContent>
						</Card>
					)}

					{/* Metadata */}
					<Card>
						<CardContent className="pt-4">
							<h4 className="font-medium mb-3">Record Information</h4>
							<div className="space-y-2 text-xs text-muted-foreground">
								<div className="flex items-center justify-between">
									<span>Created:</span>
									<span>{format(new Date(member.createdAt), 'MMM d, yyyy \'at\' h:mm a')}</span>
								</div>
								<div className="flex items-center justify-between">
									<span>Last Updated:</span>
									<span>{format(new Date(member.updatedAt), 'MMM d, yyyy \'at\' h:mm a')}</span>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</DialogContent>
		</Dialog>
	)
}

export default ViewTeamMemberDialog
