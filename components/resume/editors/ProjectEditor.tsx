'use client'

import {useEffect, useMemo, useState} from 'react'
import {useParams} from 'next/navigation'
import {cn} from '@/lib/utils'
import {Button} from '@/components/ui/button'
import {Form, FormField, FormItem, FormLabel, FormMessage} from '@/components/ui/form'
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select'
import {useForm} from 'react-hook-form'
import {zodResolver} from '@hookform/resolvers/zod'
import {z} from 'zod'
import {months} from '@/constants'
import {ExternalLink, Github, Plus, Trash2} from 'lucide-react'
import {useAutoAnimate} from '@formkit/auto-animate/react'
import {useQueryClient} from '@tanstack/react-query'
import {toast} from 'sonner'
import {ProjectMutation, ProjectMutationSchema} from '@/lib/project/types'
import {globalSkillsQueryOptions, projectQueryOptions, useCurrentProjects} from '@/lib/project/queries'
import {useCurrentResumeSkills, useGlobalSkills, useSkillCategories} from '@/lib/skill/queries'
import {useAddProjectMutation, useDeleteProjectMutation, useUpdateProjectMutation} from '@/lib/project/mutations'
import EditorHeader from '@/components/resume/editors/shared/EditorHeader'
import DateRangeFields from '@/components/resume/editors/shared/DateRangeFields'
import TextFormField from '@/components/resume/editors/shared/TextFormField'
import RichTextFormField from '@/components/resume/editors/shared/RichTextFormField'
import FormButtons from '@/components/resume/editors/shared/FormButtons'
import ItemCard from '@/components/resume/editors/shared/ItemCard'
import ProjectEditorSkeleton from '@/components/skeletons/ProjectEditorSkeleton'
import {AnimatePresence, motion} from 'motion/react'
import {
	ANIMATE_PRESENCE_MODE,
	DEFAULT_FADE_ANIMATION,
	DEFAULT_FADE_CONTENT_ANIMATION,
	NO_ANIMATION
} from '@/components/animations/DefaultFade'
import {baseResumeQueryOptions} from '@/lib/resume/queries'
import {Badge} from '@/components/ui/badge'
import SkillAutocomplete from '@/components/ui/skill-autocomplete'
import CategoryAutocomplete from '@/components/ui/category-autocomplete'
import ScrollMask from '@/components/ui/scroll-mask'
import DEFAULT_SLIDE_ANIMATION from '@/components/animations/DefaultSlide'
import {useResumeHighlight} from '@/components/resume/contexts/ResumeHighlightContext'
import {useAutoFocusField} from '@/components/resume/hooks/useAutoFocus'

type ViewState = 'list' | 'form';

interface ProjectEditorProps {
  className?: string
  isTabSwitch?: boolean
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

const newSkillSchema = z.object({
	skill_name: z.string().min(1, 'Skill name is required'),
	skill_category: z.string().optional()
})

const ProjectEditor = ({className, isTabSwitch = false}: ProjectEditorProps) => {
	const [view, setView] = useState<ViewState>('list')
    const params = useParams<{ resumeId?: string }>()
    const resumeId = (params?.resumeId as string) ?? 'base'
	const [projectListAnimationRef] = useAutoAnimate()
	const [skillListAnimationRef] = useAutoAnimate()
	const [editingIndex, setEditingIndex] = useState<number | null>(null)
	const queryClient = useQueryClient()
	const [isMounted, setIsMounted] = useState(false)
	const [deletingId, setDeletingId] = useState<string | null>(null)
	const [isAddingSkill, setIsAddingSkill] = useState(false)
	const {scrollToItem, clearHighlight} = useResumeHighlight()

	// Auto-focus the first field when form is opened
	useAutoFocusField(view === 'form', 'name')

	// Separate form for new skill input
	const newSkillForm = useForm({
		resolver: zodResolver(newSkillSchema),
		defaultValues: {
			skill_name: '',
			skill_category: ''
		},
		mode: 'onChange'
	})

	const {data: projects = [], isLoading, error} = useCurrentProjects()
	const {data: resumeSkills = [], isLoading: isLoadingResumeSkills} = useCurrentResumeSkills()
	const {data: globalSkills = [], isLoading: isLoadingGlobalSkills} =
    useGlobalSkills()
	const {data: skillCategories = [], isLoading: isLoadingCategories} =
    useSkillCategories()

	// Merge and prioritize skills - user's resume skills come first
	const mergedSkills = useMemo(() => {
		// Convert resume skills to global skill format and mark them as preferred
		const userSkills = resumeSkills.map(resumeSkill => ({
			...resumeSkill.skill,
			preferred: true // Mark user's existing skills as preferred
		}))

		// Get skill IDs that are already in user's resume
		const userSkillIds = new Set(userSkills.map(skill => skill.id))

		// Filter global skills to exclude those already in user's resume
		const additionalGlobalSkills = globalSkills.filter(skill => !userSkillIds.has(skill.id))

		// Return user skills first, then remaining global skills
		return [...userSkills, ...additionalGlobalSkills]
	}, [resumeSkills, globalSkills])

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
		defaultValues: DEFAULT_PROJECT_VALUES,
		mode: 'onChange'
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
                await addProject({data: formattedValues, resumeId})
			}

			form.reset(DEFAULT_PROJECT_VALUES)
			setView('list')
			setEditingIndex(null)
			setIsAddingSkill(false)
			newSkillForm.reset({skill_name: '', skill_category: ''})
			clearHighlight()
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

		// Trigger highlight for this project item
		scrollToItem({
			type: 'project',
			id: project.id
		})
	}

	const handleDelete = async (id: string) => {
		try {
			setDeletingId(id)
            await deleteProject({id, resumeId})
			if (editingIndex !== null && projects[editingIndex]?.id === id) {
				setEditingIndex(null)
				form.reset(DEFAULT_PROJECT_VALUES)
				setView('list')
				clearHighlight()
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
		newSkillForm.reset({skill_name: '', skill_category: ''})
	}

	const handleCancel = () => {
		form.reset(DEFAULT_PROJECT_VALUES)
		setEditingIndex(null)
		setView('list')
		setIsAddingSkill(false)
		newSkillForm.reset({skill_name: '', skill_category: ''})
		clearHighlight()
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
							<div className="mt-4">
								<h3 className="text-base font-medium">Skills Used</h3>
								<FormField
									control={form.control}
									name="skills_used"
									render={({field}) => {
										const validSkills = field.value.filter(skill => skill.name.trim() !== '')

										return (
											<FormItem>
												{/* Display existing skills as boxy cards */}
												<AnimatePresence>
													{validSkills.length > 0 && (
														<motion.div {...DEFAULT_SLIDE_ANIMATION} className="mt-4 flex flex-wrap gap-3 mb-4" ref={skillListAnimationRef}>
															{validSkills.map((skill, index) => (
																<div key={index} className="relative bg-neutral-50 rounded-lg px-4 py-3 border border-neutral-200 shadow-sm hover:shadow-md transition-shadow min-w-[140px]">
																	<div className="flex justify-between items-start gap-2">
																		<div className="flex-1 min-w-0">
																			<div className="font-medium text-base text-neutral-900 leading-tight mb-1">
																				{skill.name}
																			</div>
																			{skill.category && (
																				<div className="text-xs text-neutral-500 leading-tight">
																					{skill.category}
																				</div>
																			)}
																		</div>
																		<Button
																			type="button"
																			variant="ghost"
																			size="icon"
																			className="h-5 w-5 text-neutral-400 hover:text-red-600 hover:bg-red-50 flex-shrink-0 -mt-1 -mr-1"
																			onClick={() => {
																				const newSkills = field.value.filter((_, i) => i !== index)
																				field.onChange(newSkills)
																			}}
																			disabled={isSubmitting}
																		>
																			<Trash2 className="h-3.5 w-3.5" />
																		</Button>
																	</div>
																</div>
															))}
														</motion.div>
													)}
												</AnimatePresence>

												{/* Render fallback text if no skill is added */}
												<AnimatePresence>
													{validSkills.length === 0 && (
														<motion.div {...DEFAULT_SLIDE_ANIMATION} className="flex flex-wrap gap-3 mb-6 text-sm mt-2 opacity-80 italic">
															<p>Add skills that you have learnt or used in this project</p>
														</motion.div>
													)}
												</AnimatePresence>

												<motion.div layout>
													<AnimatePresence>
														{/* Add skill interface */}
														{isAddingSkill && <motion.div {...DEFAULT_SLIDE_ANIMATION} className="space-y-4">
															<Form {...newSkillForm}>
																<FormField
																	control={newSkillForm.control}
																	name="skill_name"
																	render={({field: skillNameField}) => (
																		<FormItem>
																			<FormLabel>Add New Skill</FormLabel>
																			<SkillAutocomplete
																				skills={mergedSkills}
																				excludeSkillIds={field.value
																					.filter(s => s.name.trim() !== '')
																					.map((s) => {
																						const matchingSkill = mergedSkills.find(
																							(gs) => gs.name.toLowerCase() === s.name.toLowerCase(),
																						)
																						return matchingSkill?.id || s.name
																					})}
																				name="skill_name"
																				placeholder="Type to search skills..."
																				disabled={isSubmitting || isLoadingGlobalSkills || isLoadingResumeSkills}
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
																				<span>skills include your existing skills and those recommended by ATS systems.</span>
																			</div>
																			<FormMessage className="text-xs" />
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

															<div className="flex items-center gap-2">
																<Button
																	type="button"
																	variant="default"
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
														</motion.div>}
													</AnimatePresence>

													<AnimatePresence>
														{!isAddingSkill && <motion.div {...DEFAULT_SLIDE_ANIMATION} className="flex items-end gap-3">
															<div className="flex-1">
																<FormLabel className="text-sm font-medium mb-2 block">Add Skills</FormLabel>
																{(() => {
																	const availableSkills = resumeSkills.filter(rs => {
																		// Exclude already selected skills
																		const isAlreadySelected = field.value.some(
																			(s) => s.name.toLowerCase() === rs.skill.name.toLowerCase()
																		)
																		return !isAlreadySelected
																	})

																	return (
																		<Select
																			value=""
																			onValueChange={(value) => {
																				if (value && value !== '' && value !== 'no-skills') {
																					// Find the selected skill from user's resume
																					const selectedSkill = resumeSkills.find(rs => rs.skill.id === value)
																					if (selectedSkill) {
																						field.onChange([...field.value, {
																							name: selectedSkill.skill.name,
																							category: selectedSkill.skill.category
																						}])
																					}
																				}
																			}}
																			disabled={isSubmitting || availableSkills.length === 0}
																		>
																			<SelectTrigger>
																				<SelectValue
																					placeholder={
																						availableSkills.length === 0
																							? 'All skills already added'
																							: validSkills.length === 0
																								? 'Choose from your existing skills'
																								: 'Add another skill'
																					}
																				/>
																			</SelectTrigger>
																			<SelectContent>
																				{availableSkills.length > 0 ? (
																					availableSkills.map((resumeSkill) => (
																						<SelectItem key={resumeSkill.skill.id} value={resumeSkill.skill.id}>
																							{resumeSkill.skill.name}
																							{resumeSkill.skill.category && (
																								<span className="text-muted-foreground ml-2">
																									({resumeSkill.skill.category})
																								</span>
																							)}
																						</SelectItem>
																					))
																				) : (
																					<SelectItem value="no-skills" disabled>
																						No more skills available
																					</SelectItem>
																				)}
																			</SelectContent>
																		</Select>
																	)
																})()}
															</div>
															<Button
																type="button"
																variant="outline"
																onClick={() => setIsAddingSkill(true)}
																disabled={isSubmitting}
																className="flex-shrink-0"
															>
																<Plus className="h-4 w-4 mr-2" />
																Add New Skill
															</Button>
														</motion.div>}
													</AnimatePresence>

													<FormMessage />
												</motion.div>
											</FormItem>
										)
									}}
								/>
							</div>

							<motion.div layout>
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
							</motion.div>
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

				<AnimatePresence mode={ANIMATE_PRESENCE_MODE}>
					{isLoading && (
						<motion.div
							key="skeleton"
							{...DEFAULT_FADE_ANIMATION}
						>
							<ProjectEditorSkeleton />
						</motion.div>
					)}

					{error && (
						<motion.div
							key="error"
							{...DEFAULT_FADE_ANIMATION}
							className="text-center py-10 text-red-500"
						>
							Error loading project details. Please try again later.
						</motion.div>
					)}

					{!isLoading && !error && (
						<motion.div
							key="content"
							{...(isTabSwitch ? NO_ANIMATION : DEFAULT_FADE_CONTENT_ANIMATION)}
							ref={projectListAnimationRef}
							className="space-y-4 pb-8"
						>
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
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</ScrollMask>
	)
}

export default ProjectEditor
