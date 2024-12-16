'use client'

import {Resume} from '@/db/resumes.schema'
import {cn} from '@/lib/utils'
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card'
import {Input} from '@/components/ui/input'
import {Button} from '@/components/ui/button'
import {Textarea} from '@/components/ui/textarea'
import {Badge} from '@/components/ui/badge'
import {Trash2} from 'lucide-react'
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from '@/components/ui/form'
import {useForm} from 'react-hook-form'
import {z} from 'zod'
import {zodResolver} from '@hookform/resolvers/zod'
import {useState, useEffect} from 'react'
import {createProject, deleteProject, getProjects} from '@/lib/projects.methods'

const formSchema = z.object({
	name: z.string().min(1, 'Project name is required'),
	role: z.string().min(1, 'Role is required'),
	description: z.string().optional(),
	technologies: z.string().optional(),
	accomplishments: z.string().optional(),
	links: z.string().optional()
})

type Project = {
	id: string
	userId: string
	name: string
	role: string
	description: string | null
	technologies: string | null
	accomplishments: string | null
	links: string | null
	createdAt: Date | null
	updatedAt: Date | null
}

const ResumeEditor = ({resume, className}: {resume: Resume, className?: string}) => {
	const [projects, setProjects] = useState<Project[]>([])

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: '',
			role: '',
			description: '',
			technologies: '',
			accomplishments: '',
			links: ''
		}
	})

	useEffect(() => {
		loadProjects()
	}, [resume.userId])

	const loadProjects = async () => {
		try {
			const fetchedProjects = await getProjects(resume.userId)
			setProjects(fetchedProjects)
		} catch (error) {
			// console.error('Failed to load projects:', error)
		}
	}

	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		try {
			const projectData = {
				userId: resume.userId,
				name: values.name,
				role: values.role,
				description: values.description || null,
				technologies: values.technologies || null,
				accomplishments: values.accomplishments || null,
				links: values.links || null
			}
			await createProject(resume.userId, projectData)
			form.reset()
			await loadProjects()
		} catch (error) {
			// console.error('Failed to create project:', error)
		}
	}

	const handleDelete = async (projectId: string) => {
		try {
			if (!confirm('Are you sure you want to delete this project?')) {
				return
			}

			await deleteProject(projectId, resume.userId)
			await loadProjects()
		} catch (error) {
			// console.error('Failed to delete project:', error)
		}
	}

	return (
		<div className={cn('flex flex-col items-center p-8', className)}>
			<div className="w-full max-w-2xl">
				<h1 className="text-2xl font-bold mb-8 text-center">Resume Editor</h1>

				<Card>
					<CardHeader>
						<CardTitle>Projects</CardTitle>
					</CardHeader>
					<CardContent className="space-y-6">
						<Form {...form}>
							<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
								<FormField
									control={form.control}
									name="name"
									render={({field}) => (
										<FormItem>
											<FormLabel>Project Name</FormLabel>
											<FormControl>
												<Input placeholder="Project Name" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="role"
									render={({field}) => (
										<FormItem>
											<FormLabel>Role</FormLabel>
											<FormControl>
												<Input placeholder="Role" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="description"
									render={({field}) => (
										<FormItem>
											<FormLabel>Description</FormLabel>
											<FormControl>
												<Textarea placeholder="Description" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="technologies"
									render={({field}) => (
										<FormItem>
											<FormLabel>Technologies</FormLabel>
											<FormControl>
												<Input placeholder="Technologies (comma-separated)" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="accomplishments"
									render={({field}) => (
										<FormItem>
											<FormLabel>Accomplishments</FormLabel>
											<FormControl>
												<Input placeholder="Accomplishments (comma-separated)" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="links"
									render={({field}) => (
										<FormItem>
											<FormLabel>Links</FormLabel>
											<FormControl>
												<Input placeholder="Links (comma-separated)" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<Button type="submit" className="w-full">Add Project</Button>
							</form>
						</Form>

						<div className="space-y-4">
							<h3 className="font-medium">Your Projects</h3>
							<div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
								{projects.map(project => (
									<Card key={project.id}>
										<CardContent className="pt-6">
											<div className="flex justify-between items-start">
												<div>
													<h4 className="font-medium">{project.name}</h4>
													<p className="text-sm text-muted-foreground">{project.role}</p>
												</div>
												<Button
													variant="destructive"
													size="icon"
													onClick={() => handleDelete(project.id)}
												>
													<Trash2 className="h-4 w-4" />
												</Button>
											</div>

											{project.description && (
												<p className="mt-2 text-sm">{project.description}</p>
											)}

											{project.technologies && typeof project.technologies === 'string' && project.technologies.trim() && (
												<div className="mt-4">
													<p className="text-sm font-medium mb-2">Technologies:</p>
													<div className="flex flex-wrap gap-1">
														{project.technologies.split(',').filter(Boolean).map((tech, i) => (
															<Badge key={i} variant="secondary">{tech.trim()}</Badge>
														))}
													</div>
												</div>
											)}

											{project.accomplishments && typeof project.accomplishments === 'string' && project.accomplishments.trim() && (
												<div className="mt-4">
													<p className="text-sm font-medium mb-2">Accomplishments:</p>
													<ul className="list-disc list-inside text-sm space-y-1">
														{project.accomplishments.split(',').filter(Boolean).map((accomplishment, i) => (
															<li key={i}>{accomplishment.trim()}</li>
														))}
													</ul>
												</div>
											)}

											{project.links && typeof project.links === 'string' && project.links.trim() && (
												<div className="mt-4">
													<p className="text-sm font-medium mb-2">Links:</p>
													<div className="space-y-1">
														{project.links.split(',').filter(Boolean).map((link, i) => (
															<a
																key={i}
																href={link.trim()}
																target="_blank"
																rel="noopener noreferrer"
																className="text-sm text-blue-500 hover:underline block"
															>
																{link.trim()}
															</a>
														))}
													</div>
												</div>
											)}
										</CardContent>
									</Card>
								))}
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	)
}

export default ResumeEditor
