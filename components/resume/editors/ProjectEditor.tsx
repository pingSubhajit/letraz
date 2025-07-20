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
import {Loader2, Plus, Trash2} from 'lucide-react'
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
	const [newSkill, setNewSkill] = useState({name: '', category: 'Other'})

	// Separate form for new skill input
	const newSkillForm = useForm({
		defaultValues: {
			skill_name: '',
			skill_category: 'Other'
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
					category: skill.category?.trim() || 'Other'
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

			// Format URLs if needed
			if (
				formattedValues.github_url &&
        !formattedValues.github_url.startsWith('http') &&
        formattedValues.github_url.length > 0
			) {
				formattedValues.github_url = `https://${formattedValues.github_url}`
			}

			if (
				formattedValues.live_url &&
        !formattedValues.live_url.startsWith('http') &&
        formattedValues.live_url.length > 0
			) {
				formattedValues.live_url = `https://${formattedValues.live_url}`
			}

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
			setNewSkill({name: '', category: 'Other'})
			newSkillForm.reset({skill_name: '', skill_category: 'Other'})
		} catch (error) {
			// Error already handled by the mutation's onError callback
		}
	}

	const handleEdit = (index: number) => {
		const project = projects[index]
		// Transform the skills to ensure they have the required format
		const formattedSkills = project.skills_used.map((skill) => ({
			name: skill.name,
			category: skill.category || 'Other' // Ensure category is never null
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
		setNewSkill({name: '', category: 'Other'})
		newSkillForm.reset({skill_name: '', skill_category: 'Other'})
	}

	const handleCancel = () => {
		form.reset(DEFAULT_PROJECT_VALUES)
		setEditingIndex(null)
		setView('list')
		setIsAddingSkill(false)
		setNewSkill({name: '', category: 'Other'})
		newSkillForm.reset({skill_name: '', skill_category: 'Other'})
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

							{/* Skills Section - Moved above description */}
							<div className="p-5 bg-white rounded-lg border shadow-sm">
								<h3 className="text-base font-medium mb-4">Skills Used</h3>
								<FormField
									control={form.control}
									name="skills_used"
									render={({field}) => {
										const validSkills = field.value.filter(skill => skill.name.trim() !== '')

										return (
											<FormItem>
												{/* Display existing skills as compact list */}
												{validSkills.length > 0 && (
													<div className="space-y-2 mb-4">
														{validSkills.map((skill, index) => (
															<div key={index} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg border">
																<div className="flex-1">
																	<div className="flex items-center gap-2">
																		<span className="font-medium text-sm">{skill.name}</span>
																		{skill.category && skill.category !== 'Other' && (
																			<Badge variant="outline" className="text-xs">
																				{skill.category}
																			</Badge>
																		)}
																	</div>
																</div>
																<Button
																	type="button"
																	variant="ghost"
																	size="icon"
																	className="h-6 w-6 text-neutral-500 hover:text-red-600 hover:bg-red-50"
																	onClick={() => {
																		const newSkills = [...field.value]
																		const actualIndex = field.value.findIndex(s => s.name === skill.name)
																		if (actualIndex !== -1) {
																			newSkills.splice(actualIndex, 1)
																			field.onChange(newSkills)
																		}
																	}}
																	disabled={isSubmitting}
																>
																	<Trash2 className="h-3 w-3" />
																</Button>
															</div>
														))}
													</div>
												)}

												{/* Add new skill input - only show when adding */}
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
																					// For custom skills, only update category if not already set
																					if (!newSkillForm.getValues('skill_category') || newSkillForm.getValues('skill_category') === 'Other') {
																						newSkillForm.setValue('skill_category', category || 'Other')
																					}
																				} else if (skillId) {
																					// For existing skills, always update category (like in SkillsEditor)
																					newSkillForm.setValue('skill_category', category || 'Other')
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
																			category: skillCategory || 'Other'
																		}])
																		newSkillForm.reset({skill_name: '', skill_category: 'Other'})
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
																	newSkillForm.reset({skill_name: '', skill_category: 'Other'})
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
									<h3 className="font-medium">{project.name}</h3>
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
													className="text-xs px-2 py-0.5 bg-blue-50/80 text-blue-700 border-blue-200/60 hover:bg-blue-100/80 transition-colors font-medium"
												>
													{skill.name}
												</Badge>
											))}
											{project.skills_used.length > 6 && (
												<Badge
													variant="outline"
													className="text-xs px-2 py-0.5 bg-neutral-50 text-neutral-600 border-neutral-200 font-medium"
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
