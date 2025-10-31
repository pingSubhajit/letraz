'use client'

import {useState} from 'react'
import {useQuery} from 'convex/react'
import {api} from '@/convex/_generated/api'
import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card'
import {Badge} from '@/components/ui/badge'
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table'
import {Briefcase, Plus, Search, UserCheck, Users} from 'lucide-react'
import AddTeamMemberDialog from '@/components/team-management/AddTeamMemberDialog'
import TeamMemberActions from '@/components/team-management/TeamMemberActions'
import {format} from 'date-fns'

const TeamManagementPage = () => {
	const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
	const [searchTerm, setSearchTerm] = useState('')

	const teamMembers = useQuery(api.teamMembers.getAllTeamMembers)
	const teamStats = useQuery(api.teamMembers.getTeamStats)

	// Filter team members based on search term
	const filteredMembers = teamMembers?.filter((member) => member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (member.position && member.position.toLowerCase().includes(searchTerm.toLowerCase()))) || []

	const getDepartmentBadgeVariant = (department: string) => {
		return department === 'Core Team' ? 'default' : 'secondary'
	}

	if (teamMembers === undefined) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<div className="text-muted-foreground">Loading team members...</div>
			</div>
		)
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold">Team Management</h1>
					<p className="text-muted-foreground">
						Manage your Letraz team members and their information
					</p>
				</div>
				<Button onClick={() => setIsAddDialogOpen(true)}>
					<Plus className="w-4 h-4 mr-2" />
					Add Team Member
				</Button>
			</div>

			{/* Stats Cards */}
			<div className="grid gap-4 md:grid-cols-3">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Members</CardTitle>
						<Users className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{teamStats?.total || 0}</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Core Team</CardTitle>
						<UserCheck className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{teamStats?.coreTeam || 0}</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Marketing Team</CardTitle>
						<Briefcase className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{teamStats?.marketingTeam || 0}</div>
					</CardContent>
				</Card>
			</div>

			{/* Search and Filter */}
			<Card>
				<CardHeader>
					<CardTitle>Team Members</CardTitle>
					<CardDescription>
						View and manage all team members in your organization
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex items-center space-x-2 mb-4">
						<div className="relative flex-1">
							<Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
							<Input
								placeholder="Search by name, email, or position..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="pl-8"
							/>
						</div>
					</div>

					{/* Team Members Table */}
					<div className="rounded-md border">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Member</TableHead>
									<TableHead>Department</TableHead>
									<TableHead>Position</TableHead>
									<TableHead>Contact</TableHead>
									<TableHead>Joining Date</TableHead>
									<TableHead className="text-right">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{filteredMembers.length === 0 ? (
									<TableRow>
										<TableCell colSpan={6} className="text-center py-8">
											<div className="text-muted-foreground">
												{searchTerm ? 'No team members found matching your search.' : 'No team members added yet.'}
											</div>
										</TableCell>
									</TableRow>
								) : (
									filteredMembers.map((member) => (
										<TableRow key={member._id}>
											<TableCell>
												<div className="flex items-center space-x-3">
													<div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
														{member.photoUrl ? (
															<img
																src={member.photoUrl}
																alt={member.name}
																className="w-8 h-8 rounded-full object-cover"
															/>
														) : (
															<span className="text-sm font-medium text-primary">
																{member.name.charAt(0).toUpperCase()}
															</span>
														)}
													</div>
													<div>
														<div className="font-medium">{member.name}</div>
														<div className="text-sm text-muted-foreground">
															{member.email}
														</div>
													</div>
												</div>
											</TableCell>
											<TableCell>
												<Badge variant={getDepartmentBadgeVariant(member.department)}>
													{member.department}
												</Badge>
											</TableCell>
											<TableCell>
												{member.position || (
													<span className="text-muted-foreground">Not specified</span>
												)}
											</TableCell>
											<TableCell>
												<div className="text-sm">
													<div>{member.email}</div>
													{member.phone && (
														<div className="text-muted-foreground">{member.phone}</div>
													)}
												</div>
											</TableCell>
											<TableCell>
												{format(new Date(member.joiningDate), 'MMM d, yyyy')}
											</TableCell>
											<TableCell className="text-right">
												<TeamMemberActions member={member} />
											</TableCell>
										</TableRow>
									))
								)}
							</TableBody>
						</Table>
					</div>
				</CardContent>
			</Card>

			{/* Add Team Member Dialog */}
			<AddTeamMemberDialog
				open={isAddDialogOpen}
				onOpenChange={setIsAddDialogOpen}
			/>
		</div>
	)
}

export default TeamManagementPage
