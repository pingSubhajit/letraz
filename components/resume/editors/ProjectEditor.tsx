'use client'

import {useEffect, useState} from 'react'
import {cn} from '@/lib/utils'
import {Button} from '@/components/ui/button'
import {
	Form,
	FormField,
	FormItem,
	FormMessage
} from '@/components/ui/form'
import {useForm} from 'react-hook-form'
import {zodResolver} from '@hookform/resolvers/zod'
import {months} from '@/constants'
import {Loader2, Plus, Trash2, Github, ExternalLink} from 'lucide-react'
import {useAutoAnimate} from '@formkit/auto-animate/react'
import {useQueryClient} from '@tanstack/react-query'
import {toast} from 'sonner'
import {ProjectMutation, ProjectMutationSchema} from '@/lib/project/types'
import {
	globalSkillsQueryOptions,
	projectQueryOptions,
	useCurrentProjects
} from '@/lib/project/queries'
import {useGlobalSkills, useSkillCategories} from '@/lib/skill/queries'
import {
	useAddProjectMutation,
	useDeleteProjectMutation,
	useUpdateProjectMutation
} from '@/lib/project/mutations'
import EditorHeader from '@/components/resume/editors/shared/EditorHeader'
import DateRangeFields from '@/components/resume/editors/shared/DateRangeFields'
import TextFormField from '@/components/resume/editors/shared/TextFormField'
import RichTextFormField from '@/components/resume/editors/shared/RichTextFormField'
import FormButtons from '@/components/resume/editors/shared/FormButtons'
import ItemCard from '@/components/resume/editors/shared/ItemCard'
import {baseResumeQueryOptions} from '@/lib/resume/queries'
import {Badge} from '@/components/ui/badge'
import SkillAutocomplete from '@/components/ui/skill-autocomplete'
import CategoryAutocomplete from '@/components/ui/category-autocomplete'
import ScrollMask from '@/components/ui/scroll-mask'

type ViewState = 'list' | 'form';

interface ProjectEditorProps {
	className?: string
}

const DEFAULT_PROJECT_VALUES: ProjectMutation = {
	name: '',
	category: '',
	role: '',
	description: '',
	github_url: '',
	live_url: '',
	started_from_month: null,
	started_from_year: null,
	finished_at_month: null,
	finished_at_year: null,
	current: false,
	skills_used: []
}

const ProjectEditor = ({className}: ProjectEditorProps) => {
	const [view, setView] = useState<ViewState>('list')
	const [parent] = useAutoAnimate()
	const [editingIndex, setEditingIndex] = useState<number | null>(null)
	const queryClient = useQueryClient()
	const [isMounted, setIsMounted] = useState(false)
	const [deletingId, setDeletingId] = useState<string | null>(null)
	const [isAddingSkill, setIsAddingSkill] = useState(false)
	const [newSkill, setNewSkill] = useState({name: '', category: null as string | null})

	// Separate form for new skill input
	const newSkillForm = useForm({
		defaultValues: {
			skill_name: '',
			skill_category: ''
		}
	})

	const {data: projects = [], isLoading, error} = useCurrentProjects()
	const {data: globalSkills = [], isLoading: isLoadingGlobalSkills} =
    useGlobalSkills()
	const {data: skillCategories = [], isLoading: isLoadingCategories} =
    useSkillCategories()

	const revalidate = () => {
		queryClient.invalidateQueries({queryKey: projectQueryOptions.queryKey})
		queryClient.invalidateQueries({
			queryKey: baseResumeQueryOptions.queryKey
		})
		queryClient.invalidateQueries({
			queryKey: globalSkillsQueryOptions.queryKey
		})
	}

	const {mutateAsync: addProject, isPending: isAddingPending} = useAddProjectMutation({
		onSuccess: () => {
			revalidate()
			toast.success('Project added successfully!')
		},
		onError: () => {
			toast.error('Failed to add project. Please try again.')
		}
	})

	const {mutateAsync: updateProject, isPending: isUpdatingPending} = useUpdateProjectMutation({
		onSuccess: () => {
			revalidate()
			toast.success('Project updated successfully!')
		},
		onError: () => {
			toast.error('Failed to update project. Please try again.')
		}
	})

	const isSubmitting = isAddingPending || isUpdatingPending

	const {mutateAsync: deleteProject, isPending: isDeleting} = useDeleteProjectMutation({
		onSuccess: () => {
			revalidate()
			toast.success('Project deleted successfully!')
		},
		onError: () => {
			toast.error('Failed to delete project. Please try again.')
		}
	})

	useEffect(() => {
		setIsMounted(true)
	}, [])

	const form = useForm<ProjectMutation>({
		resolver: zodResolver(ProjectMutationSchema),
		defaultValues: DEFAULT_PROJECT_VALUES
	})

	const onSubmit = async (values: ProjectMutation) => {
		try {
			// Filter out skills with empty names, but ensure categories are always populated
			const validSkills = values.skills_used
				.filter((skill) => skill.name.trim() !== '')
				.map((skill) => ({
					name: skill.name.trim(),
					category: skill.category?.trim() || null
				}))

			// If no valid skills, show error
			if (validSkills.length === 0) {
				toast.error('At least one skill with a name is required')
				return
			}

			// Create a copy of values to avoid mutating the original
			const formattedValues = {
				...values,
				name: values.name.trim(),
				category: values.category?.trim() || null,
				role: values.role?.trim() || null,
				description: values.description,
				github_url: values.github_url?.trim() || null,
				live_url: values.live_url?.trim() || null,
				started_from_month: values.started_from_month || null,
				started_from_year: values.started_from_year || null,
				finished_at_month: values.current
					? null
					: values.finished_at_month || null,
				finished_at_year: values.current
					? null
					: values.finished_at_year || null,
				current: values.current,
				skills_used: validSkills
			}

			// Format URLs with proper validation
			const formatUrl = (url: string | null): string | null => {
				if (!url || url.trim() === '') return null

				const trimmedUrl = url.trim()

				// Check if URL already has a valid protocol
				if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmedUrl)) {
					return trimmedUrl
				}

				// Only prepend https:// if it looks like a domain/path
				if (/^[a-zA-Z0-9][a-zA-Z0-9.-]*[a-zA-Z0-9]/.test(trimmedUrl)) {
					return `https://${trimmedUrl}`
				}

				return trimmedUrl
			}

			formattedValues.github_url = formatUrl(formattedValues.github_url)
			formattedValues.live_url = formatUrl(formattedValues.live_url)

			if (editingIndex !== null) {
				const projectId = projects[editingIndex]?.id
				await updateProject({id: projectId, data: formattedValues})
			} else {
				await addProject(formattedValues)
			}

			form.reset(DEFAULT_PROJECT_VALUES)
			setView('list')
			setEditingIndex(null)
			setIsAddingSkill(false)
			setNewSkill({name: '', category: null})
			newSkillForm.reset({skill_name: '', skill_category: ''})
		} catch (error) {
			// Error already handled by the mutation's onError callback
		}
	}

	const handleEdit = (index: number) => {
		const project = projects[index]
		// Transform the skills to ensure they have the required format
		const formattedSkills = project.skills_used.map((skill) => ({
			name: skill.name,
			category: skill.category // Keep original category, can be null
		}))

		form.reset({
			...project,
			started_from_month: project.started_from_month?.toString() || null,
			started_from_year: project.started_from_year?.toString() || null,
			finished_at_month: project.finished_at_month?.toString() || null,
			finished_at_year: project.finished_at_year?.toString() || null,
			current: project.current,
			skills_used: formattedSkills
		})
		setEditingIndex(index)
		setView('form')
	}

	const handleDelete = async (id: string) => {
		try {
			setDeletingId(id)
			await deleteProject(id)
			if (editingIndex !== null && projects[editingIndex]?.id === id) {
				setEditingIndex(null)
				form.reset(DEFAULT_PROJECT_VALUES)
				setView('list')
			}
		} catch (error) {
			// Error already handled by the mutation's onError callback
		} finally {
			setDeletingId(null)
		}
	}

	const handleAddNew = () => {
		form.reset(DEFAULT_PROJECT_VALUES)
		setEditingIndex(null)
		setView('form')
		setIsAddingSkill(false)
		setNewSkill({name: '', category: null})
		newSkillForm.reset({skill_name: '', skill_category: ''})
	}

	const handleCancel = () => {
		form.reset(DEFAULT_PROJECT_VALUES)
		setEditingIndex(null)
		setView('list')
		setIsAddingSkill(false)
		setNewSkill({name: '', category: null})
		newSkillForm.reset({skill_name: '', skill_category: ''})
	}

	if (view === 'form') {
		return (
			<ScrollMask
				className={cn('space-y-6', className)}
				style={{
					height: 'calc(100vh - 162px)'
				}}
				data-lenis-prevent
			>
				<div className="space-y-6 px-1">
					<EditorHeader
						title={editingIndex !== null ? 'Update Project' : 'Add New Project'}
						description={
							editingIndex !== null
								? 'Ensure that the details are correct and reflect your project experience'
								: 'Adding projects to your résumé can demonstrate your skills and experience in a practical way'
						}
					/>
					<Form {...form}>
						<form
							onSubmit={form.handleSubmit(onSubmit)}
							className="flex flex-col gap-4"
						>
							<div className="grid grid-cols-2 gap-4">
								<TextFormField
									form={form}
									name="name"
									label="Project Name"
									placeholder="e.g. E-commerce Website"
									disabled={isSubmitting}
								/>
								<TextFormField
									form={form}
									name="category"
									label="Category"
									placeholder="e.g. Web Development"
									disabled={isSubmitting}
								/>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<TextFormField
									form={form}
									name="role"
									label="Your Role"
									placeholder="e.g. Frontend Developer"
									disabled={isSubmitting}
								/>
								<div className="grid grid-cols-2 gap-4">
									<TextFormField
										form={form}
										name="github_url"
										label="GitHub URL"
										placeholder="e.g. github.com/user/project"
										disabled={isSubmitting}
									/>
									<TextFormField
										form={form}
										name="live_url"
										label="Live URL"
										placeholder="e.g. myproject.com"
										disabled={isSubmitting}
									/>
								</div>
							</div>

							<DateRangeFields
								form={form}
								isSubmitting={isSubmitting}
								currentLabel="This is an ongoing project"
							/>

							{/* Skills Section */}
							<div className="p-5 bg-white rounded-lg border shadow-sm">
								<h3 className="text-base font-medium mb-4">Skills Used</h3>
								<FormField
									control={form.control}
									name="skills_used"
									render={({field}) => {
										const validSkills = field.value.filter(skill => skill.name.trim() !== '')
										// Group skills by category
										const skillsByCategory = validSkills.reduce((acc, skill, originalIndex) => {
											const category = skill.category || 'Other'
											if (!acc[category]) {
												acc[category] = []
											}
											acc[category].push({...skill, category, originalIndex})
											return acc
										}, {} as Record<string, Array<{name: string, category: string | null, originalIndex: number}>>)

										return (
											<FormItem>
												{/* Display existing skills grouped by category */}
												{validSkills.length > 0 && (
													<div className="space-y-2 mb-4">
														{Object.entries(skillsByCategory).map(([category, categorySkills]) => (
															<div key={category} className="p-3 bg-neutral-50 rounded-lg border">
																<div className="flex items-center justify-between mb-2">
																	<div className="flex items-center gap-2">
																		{category !== 'Other' && (
																			<Badge
																				variant="outline"
																				className="text-xs px-2 py-0.5 bg-orange-50/80 text-orange-700 border-orange-200/60 font-medium"
																			>
																				{category}
																			</Badge>
																		)}
																		{category === 'Other' && categorySkills.length > 1 && (
																			<span className="text-xs text-muted-foreground font-medium">Other Skills</span>
																		)}
																	</div>
																</div>
																<div className="flex flex-wrap gap-2">
																	{categorySkills.map((skill) => (
																		<div key={skill.originalIndex} className="flex items-center gap-1 bg-white rounded-md px-2 py-1 border">
																			<span className="font-medium text-sm">{skill.name}</span>
																			<Button
																				type="button"
																				variant="ghost"
																				size="icon"
																				className="h-4 w-4 text-neutral-400 hover:text-red-600 hover:bg-red-50 ml-1"
																				onClick={() => {
																					/*
																					 * Filter out this specific skill instance by both name and category
																					 * to handle potential duplicates correctly
																					 */
																					const newSkills = field.value.filter((s, index) => !(s.name === skill.name && s.category === skill.category && index === skill.originalIndex))
																					field.onChange(newSkills)
																				}}
																				disabled={isSubmitting}
																			>
																				<Trash2 className="h-3 w-3" />
																			</Button>
																		</div>
																	))}
																</div>
															</div>
														))}
													</div>
												)}

												{/* Add new skill input */}
												{isAddingSkill && (
													<div className="flex flex-col gap-4 mb-4">
														<Form {...newSkillForm}>
															<FormField
																control={newSkillForm.control}
																name="skill_name"
																render={({field: skillNameField}) => (
																	<FormItem>
																		<SkillAutocomplete
																			skills={globalSkills}
																			excludeSkillIds={field.value
																				.filter(s => s.name.trim() !== '')
																				.map((s) => {
																					const globalSkill = globalSkills.find(
																						(gs) => gs.name.toLowerCase() === s.name.toLowerCase(),
																					)
																					return globalSkill?.id || s.name
																				})}
																			name="skill_name"
																			placeholder="Type to search skills..."
																			disabled={isSubmitting || isLoadingGlobalSkills}
																			defaultValue=""
																			onSkillSelect={(skillId, skillName, category) => {
																				skillNameField.onChange(skillName)
																				if (skillId === 'custom') {
																					// For custom skills
																					if (!newSkillForm.getValues('skill_category')) {
																						newSkillForm.setValue('skill_category', category || '')
																					}
																				} else if (skillId) {
																					// For existing skills
																					newSkillForm.setValue('skill_category', category || '')
																				}
																			}}
																		/>
																		<div className="mt-2 text-xs text-muted-foreground flex items-center gap-1.5">
																			<Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50 px-1.5 py-0">Preferred</Badge>
																			<span>skills are recommended by ATS systems and frequently searched by recruiters.</span>
																		</div>
																	</FormItem>
																)}
															/>

															<FormField
																control={newSkillForm.control}
																name="skill_category"
																render={({field: categoryField}) => (
																	<CategoryAutocomplete
																		categories={skillCategories}
																		name="skill_category"
																		label="Category (optional)"
																		placeholder="E.g., Programming Languages, Tools, etc."
																		disabled={isSubmitting || isLoadingCategories}
																		showLabel
																		defaultValue={categoryField.value || ''}
																		onCategorySelect={(category) => {
																			categoryField.onChange(category)
																		}}
																	/>
																)}
															/>
														</Form>

														<p className="text-xs text-muted-foreground">
															Skills with detailed categories stand out to both recruiters and ATS systems.
														</p>

														<div className="flex items-center gap-2 justify-center">
															<Button
																type="button"
																variant="outline"
																size="sm"
																onClick={() => {
																	const skillName = newSkillForm.getValues('skill_name')
																	const skillCategory = newSkillForm.getValues('skill_category')
																	if (skillName.trim()) {
																		field.onChange([...field.value, {
																			name: skillName,
																			category: skillCategory || null
																		}])
																		newSkillForm.reset({skill_name: '', skill_category: ''})
																		setIsAddingSkill(false)
																	}
																}}
																disabled={!newSkillForm.watch('skill_name')?.trim() || isSubmitting}
															>
																<Plus className="h-4 w-4 mr-2" />
																Add Skill
															</Button>
															<Button
																type="button"
																variant="ghost"
																size="sm"
																onClick={() => {
																	setIsAddingSkill(false)
																	newSkillForm.reset({skill_name: '', skill_category: ''})
																}}
															>
																Cancel
															</Button>
														</div>
													</div>
												)}

												{/* Add skill button */}
												{!isAddingSkill && (
													<div className="flex justify-center">
														<Button
															type="button"
															variant="outline"
															size="sm"
															onClick={() => setIsAddingSkill(true)}
															disabled={isSubmitting}
															className="px-4 py-2"
														>
															<Plus className="h-4 w-4 mr-2" />
															{validSkills.length === 0 ? 'Add Skill' : 'Add Another Skill'}
														</Button>
													</div>
												)}

												<FormMessage />
											</FormItem>
										)
									}}
								/>
							</div>

							<RichTextFormField
								form={form}
								name="description"
								label="Description"
								placeholder="Describe your project, its objectives, technologies used, and your contributions..."
								disabled={isSubmitting}
							/>

							<FormButtons
								onCancel={handleCancel}
								isSubmitting={isSubmitting}
								isEditing={editingIndex !== null}
								editingSubmitLabel="Update Project"
								addingSubmitLabel="Add Project"
							/>
						</form>
					</Form>
				</div>
			</ScrollMask>
		)
	}

	return (
		<ScrollMask
			className={cn('flex flex-col', className)}
			style={{
				height: 'calc(100vh - 162px)'
			}}
			data-lenis-prevent
		>
			<div className="space-y-6 px-1">
				<EditorHeader
					title="Projects"
					showAddButton={isMounted && !isLoading}
					onAddNew={handleAddNew}
					isDisabled={isDeleting}
					addButtonText="Add New Project"
					className="flex-shrink-0"
				/>

				{isLoading ? (
					<div className="flex items-center justify-center py-10">
						<Loader2 className="h-8 w-8 animate-spin text-primary" />
						<span className="ml-2">Loading project details...</span>
					</div>
				) : error ? (
					<div className="text-center py-10 text-red-500">
						Error loading project details. Please try again later.
					</div>
				) : (
					<div ref={parent} className="space-y-4 pb-8">
						{projects.length > 0 ? (
							projects.map((project, index) => (
								<ItemCard
									key={project.id}
									onEdit={() => handleEdit(index)}
									onDelete={() => handleDelete(project.id)}
									isDeleting={isDeleting}
									id={project.id}
									deletingId={deletingId}
								>
									<div className="flex items-center gap-2">
										<h3 className="font-medium">{project.name}</h3>
										<div className="flex items-center gap-1.5">
											{project.github_url && (
												<button
													onClick={(e) => {
														e.stopPropagation()
														window.open(project.github_url!, '_blank', 'noopener,noreferrer')
													}}
													className="p-1 rounded-md hover:bg-neutral-100 transition-colors"
													title="View on GitHub"
												>
													<Github className="h-4 w-4 text-neutral-700 hover:text-black transition-colors" />
												</button>
											)}
											{project.live_url && (
												<button
													onClick={(e) => {
														e.stopPropagation()
														window.open(project.live_url!, '_blank', 'noopener,noreferrer')
													}}
													className="p-1 rounded-md hover:bg-neutral-100 transition-colors"
													title="View Live Project"
												>
													<ExternalLink className="h-4 w-4 text-flame-600 hover:text-flame-700 transition-colors" />
												</button>
											)}
										</div>
									</div>
									<p className="text-sm text-muted-foreground">
										{project.role}
										{project.category && ` | ${project.category}`}
									</p>
									<p className="text-sm">
										{project.started_from_month &&
                                            months.find(
                                            	(m) => m.value === project.started_from_month?.toString(),
                                            )?.label}{' '}
										{project.started_from_year} -{' '}
										{project.current ? (
											'Present'
										) : (
											<>
												{project.finished_at_month &&
                                                    months.find(
                                                    	(m) => m.value === project.finished_at_month?.toString(),
                                                    )?.label}{' '}
												{project.finished_at_year}
											</>
										)}
									</p>
									{project.skills_used && project.skills_used.length > 0 && (
										<div className="flex flex-wrap gap-1.5 mt-3">
											{project.skills_used.slice(0, 6).map((skill, i) => (
												<Badge
													key={i}
													variant="outline"
													className="text-xs px-2 py-0.5 bg-flame-40/80 text-flame-600 border-flame-200/60 hover:bg-flame-50/80 transition-colors font-medium"
												>
													{skill.name}
												</Badge>
											))}
											{project.skills_used.length > 6 && (
												<Badge
													variant="outline"
													className="text-xs px-2 py-0.5 bg-flame-40/80 text-flame-600 border-flame-200/60 hover:bg-flame-50/80 transition-colors font-medium"
												>
													+{project.skills_used.length - 6} more
												</Badge>
											)}
										</div>
									)}
								</ItemCard>
							))
						) : (
							<Button
								onClick={handleAddNew}
								className="w-full"
								variant="outline"
							>
								<Plus className="h-4 w-4 mr-2" />
								Add New Project
							</Button>
						)}
					</div>
				)}
			</div>
		</ScrollMask>
	)
}

export default ProjectEditor
