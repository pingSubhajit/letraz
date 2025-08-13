'use client'

import {useEffect, useMemo, useState} from 'react'
import {cn} from '@/lib/utils'
import {Button} from '@/components/ui/button'
import {Form, FormField, FormItem} from '@/components/ui/form'
import {useForm} from 'react-hook-form'
import {zodResolver} from '@hookform/resolvers/zod'
import {ChevronDown, Loader2, Pencil, Plus, Trash2} from 'lucide-react'
import {useAutoAnimate} from '@formkit/auto-animate/react'
import {useQueryClient} from '@tanstack/react-query'
import {toast} from 'sonner'
import {baseResumeQueryOptions} from '@/lib/resume/queries'
import {Badge} from '@/components/ui/badge'
import {Collapsible, CollapsibleContent, CollapsibleTrigger} from '@/components/ui/collapsible'
import {
    resumeSkillsQueryOptions,
    useCurrentResumeSkills,
    useGlobalSkills,
    useSkillCategories
} from '@/lib/skill/queries'
import {useParams} from 'next/navigation'
import {useAddSkillMutation, useRemoveSkillMutation, useUpdateSkillMutation} from '@/lib/skill/mutations'
import {ResumeSkill, skillLevels, SkillMutation, SkillMutationSchema} from '@/lib/skill/types'
import EditorHeader from '@/components/resume/editors/shared/EditorHeader'
import FormButtons from '@/components/resume/editors/shared/FormButtons'
import SkillAutocomplete from '@/components/ui/skill-autocomplete'
import CategoryAutocomplete from '@/components/ui/category-autocomplete'
import ProficiencySlider from '@/components/resume/editors/shared/ProficiencySlider'
import PopConfirm from '@/components/ui/pop-confirm'
import {useAutoFocus} from '@/components/resume/hooks/useAutoFocus'
import SkillsEditorSkeleton from '@/components/skeletons/SkillsEditorSkeleton'
import {AnimatePresence, motion} from 'motion/react'
import {
	ANIMATE_PRESENCE_MODE,
	DEFAULT_FADE_ANIMATION,
	DEFAULT_FADE_CONTENT_ANIMATION,
	NO_ANIMATION
} from '@/components/animations/DefaultFade'
import {useResumeHighlight} from '@/components/resume/contexts/ResumeHighlightContext'

type ViewState = 'list' | 'form'

interface SkillsEditorProps {
  className?: string;
  isTabSwitch?: boolean;
}

interface SkillsByCategory {
	[category: string]: Array<{
		id: string;
		name: string;
		level: string | null;
		skillId: string;
		index: number;
	}>;
}

const SkillsEditor = ({className, isTabSwitch = false}: SkillsEditorProps) => {
	const [view, setView] = useState<ViewState>('list')
	const [categoryAnimationContainer] = useAutoAnimate()
	const [skillAnimationContainer] = useAutoAnimate()
	const [editingIndex, setEditingIndex] = useState<number | null>(null)
	const [searchQuery, setSearchQuery] = useState('')
	const [openSkillSearch, setOpenSkillSearch] = useState(false)
	const [isMounted, setIsMounted] = useState(false)
	const [deletingId, setDeletingId] = useState<string | null>(null)
	const queryClient = useQueryClient()
	const {scrollToItem, clearHighlight} = useResumeHighlight()

	// Auto-focus when form is opened
	useAutoFocus(view === 'form')

	// Load skills data
    const params = useParams<{ resumeId?: string }>()
    const resumeId = (params?.resumeId as string) ?? 'base'
    const {data: resumeSkills = [], isLoading: isLoadingResumeSkills, error: resumeSkillsError} = useCurrentResumeSkills()
	const {data: globalSkills = [], isLoading: isLoadingGlobalSkills} = useGlobalSkills()
	const {data: skillCategories = [], isLoading: isLoadingCategories} = useSkillCategories()

	// Group skills by category
	const skillsByCategory = useMemo(() => {
		const categories: SkillsByCategory = {}
		const uncategorized = 'Other Skills'

		resumeSkills.forEach((skill, index) => {
			const category = skill.skill.category || uncategorized
			if (!categories[category]) {
				categories[category] = []
			}

			categories[category].push({
				id: skill.id,
				name: skill.skill.name,
				level: skill.level,
				skillId: skill.skill.id,
				index
			})
		})

		// Sort each category's skills alphabetically
		Object.keys(categories).forEach(category => {
			categories[category].sort((a, b) => a.name.localeCompare(b.name))
		})

		// Sort categories with "Other Skills" at the end
		const sortedCategories: SkillsByCategory = {}
		Object.keys(categories)
			.filter(category => category !== uncategorized)
			.sort()
			.forEach(category => {
				sortedCategories[category] = categories[category]
			})

		// Add uncategorized at the end if it exists
		if (categories[uncategorized]) {
			sortedCategories[uncategorized] = categories[uncategorized]
		}

		return sortedCategories
	}, [resumeSkills])

	const {mutateAsync: addSkill, isPending: isAddingPending} = useAddSkillMutation({
		onMutate: async (newSkill) => {
            await queryClient.cancelQueries({queryKey: resumeSkillsQueryOptions(resumeId).queryKey})

            const prevSkills = queryClient.getQueryData(resumeSkillsQueryOptions(resumeId).queryKey)

			// Find the skill details from global skills
			const skillDetails = globalSkills.find(gs => gs.id === newSkill.skill_id)

			if (skillDetails) {
                queryClient.setQueryData(resumeSkillsQueryOptions(resumeId).queryKey, (oldData: ResumeSkill[] | undefined) => {
					const data = oldData || []
					return [...data, {
						id: `temp-id-${Date.now()}`,
						skill: skillDetails,
						resume_section: 'temp-section',
						level: newSkill.level
					}]
				})
			}

			return {prevSkills}
		},
		onError: (err, _newSkill, context: any) => {
            queryClient.setQueryData(resumeSkillsQueryOptions(resumeId).queryKey, context?.prevSkills)
			toast.error(`Failed to add skill: ${err.message}`)
		},
		onSettled: () => {
			queryClient.invalidateQueries({queryKey: resumeSkillsQueryOptions(resumeId).queryKey})
			queryClient.invalidateQueries({queryKey: baseResumeQueryOptions.queryKey})
			queryClient.invalidateQueries({queryKey: ['resume', resumeId]})
		},
		onSuccess: () => {
			toast.success('Skill added successfully!')
		}
	})

	const {mutateAsync: updateSkill, isPending: isUpdatingPending} = useUpdateSkillMutation({
		onMutate: async ({id, data}) => {
            await queryClient.cancelQueries({queryKey: resumeSkillsQueryOptions(resumeId).queryKey})

            const prevSkills = queryClient.getQueryData(resumeSkillsQueryOptions(resumeId).queryKey)

            queryClient.setQueryData(resumeSkillsQueryOptions(resumeId).queryKey, (oldData: ResumeSkill[] | undefined) => {
				const dataArr = oldData || []
				return dataArr.map((item: ResumeSkill) => item.id === id ? {
					...item,
					level: data.level ?? null
				} : item)
			})

			return {prevSkills}
		},
		onError: (err, _updateData, context: unknown) => {
			const contextData = context as { prevSkills: ResumeSkill[] | undefined } | undefined
            queryClient.setQueryData(resumeSkillsQueryOptions(resumeId).queryKey, contextData?.prevSkills)
			toast.error(`Failed to update skill: ${err.message}`)
		},
		onSettled: () => {
			queryClient.invalidateQueries({queryKey: resumeSkillsQueryOptions(resumeId).queryKey})
			queryClient.invalidateQueries({queryKey: baseResumeQueryOptions.queryKey})
			queryClient.invalidateQueries({queryKey: ['resume', resumeId]})
		},
		onSuccess: () => {
			toast.success('Skill updated successfully!')
		}
	})

	const isSubmitting = isAddingPending || isUpdatingPending

	const {mutateAsync: removeSkill, isPending: isDeleting} = useRemoveSkillMutation({
		onMutate: async (skillId) => {
			setDeletingId(skillId)

            await queryClient.cancelQueries({queryKey: resumeSkillsQueryOptions(resumeId).queryKey})

            const prevSkills = queryClient.getQueryData(resumeSkillsQueryOptions(resumeId).queryKey)

            queryClient.setQueryData(resumeSkillsQueryOptions(resumeId).queryKey, (oldData: ResumeSkill[] | undefined) => {
				const data = oldData || []
				return data.filter((item: ResumeSkill) => item.id !== skillId)
			})

			return {prevSkills}
		},
		onError: (err, _skillId, context: unknown) => {
            const contextData = context as { prevSkills: ResumeSkill[] | undefined } | undefined
            queryClient.setQueryData(resumeSkillsQueryOptions(resumeId).queryKey, contextData?.prevSkills)
			toast.error(`Failed to remove skill: ${err.message}`)
		},
		onSettled: () => {
			queryClient.invalidateQueries({queryKey: resumeSkillsQueryOptions(resumeId).queryKey})
			queryClient.invalidateQueries({queryKey: baseResumeQueryOptions.queryKey})
			queryClient.invalidateQueries({queryKey: ['resume', resumeId]})
			setDeletingId(null)
		},
		onSuccess: () => {
			toast.success('Skill removed successfully!')
		}
	})

	const form = useForm<SkillMutation>({
		resolver: zodResolver(SkillMutationSchema),
		defaultValues: {
			skill_id: '',
			level: 'INT',
			category: ''
		}
	})

	useEffect(() => {
		setIsMounted(true)
	}, [])

	// Filter global skills based on search query and exclude already added skills
	const filteredSkills = globalSkills
		.filter(skill => (skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
             skill.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
             skill.alias.some(alias => alias.name.toLowerCase().includes(searchQuery.toLowerCase()))) &&
            !resumeSkills.some(rs => rs.skill.id === skill.id))
		.sort((a, b) => {
			// Sort by exact match first, then by preferred status
			const aNameMatch = a.name.toLowerCase() === searchQuery.toLowerCase()
			const bNameMatch = b.name.toLowerCase() === searchQuery.toLowerCase()

			if (aNameMatch && !bNameMatch) return -1
			if (!aNameMatch && bNameMatch) return 1

			if (a.preferred && !b.preferred) return -1
			if (!a.preferred && b.preferred) return 1

			return a.name.localeCompare(b.name)
		})

	const onSubmit = async (values: SkillMutation) => {
		// Check if we're adding a new skill (not editing)
		if (editingIndex === null) {
			// Check if the skill is already added to the resume
			let isDuplicate = false
			let skillName = ''

			if (values.skill_id.startsWith('custom:')) {
				// For custom skills, extract the name from the ID
				skillName = values.skill_id.substring(7)
				isDuplicate = resumeSkills.some(
					rs => rs.skill.name.toLowerCase() === skillName.toLowerCase()
				)
			} else {
				// For existing skills, check by ID
				isDuplicate = resumeSkills.some(rs => rs.skill.id === values.skill_id)

				// Get the skill name for the message
				const globalSkill = globalSkills.find(gs => gs.id === values.skill_id)
				if (globalSkill) {
					skillName = globalSkill.name
				}
			}

			// If duplicate, show a warning and don't proceed
			if (isDuplicate) {
				toast.warning(`"${skillName}" is already added to your resume.`)
				return
			}

			await addSkill({data: values, resumeId})
		} else {
			const skillId = resumeSkills[editingIndex]?.id
			await updateSkill({id: skillId, data: values, resumeId})
		}

		form.reset({skill_id: '', level: 'INT', category: ''})
		setView('list')
		setEditingIndex(null)
		setSearchQuery('')
		clearHighlight()
	}

	const handleSkillSelect = (skillId: string) => {
		form.setValue('skill_id', skillId)
		setOpenSkillSearch(false)
	}

	const handleEdit = (index: number) => {
		const resumeSkill = resumeSkills[index]

		/*
		 * For existing skills, use the ID
		 * For custom skills that may have been added previously, construct a custom ID
		 */
		const skillIdValue = resumeSkill.skill.id || `custom:${resumeSkill.skill.name}`

		form.reset({
			skill_id: skillIdValue,
			level: resumeSkill.level,
			category: resumeSkill.skill.category || ''
		})

		// Store the index for reference
		setEditingIndex(index)
		setView('form')

		// Trigger highlight for the skills section
		scrollToItem({
			type: 'skill'
		})
	}

	const handleDelete = async (id: string) => {
		await removeSkill({id, resumeId})
		if (editingIndex !== null && resumeSkills[editingIndex]?.id === id) {
			setEditingIndex(null)
			form.reset({
				skill_id: '',
				level: 'INT',
				category: ''
			})
			setView('list')
			clearHighlight()
		}
	}

	const handleAddNew = () => {
		form.reset({
			skill_id: '',
			level: 'INT',
			category: ''
		})
		setEditingIndex(null)
		setView('form')
	}

	const handleCancel = () => {
		form.reset({
			skill_id: '',
			level: 'INT',
			category: ''
		})
		setEditingIndex(null)
		setView('list')
		setSearchQuery('')
		clearHighlight()
	}

	const getSkillLevelLabel = (level: string | null) => {
		if (!level) return null
		return skillLevels.find(l => l.value === level)?.label || null
	}

	if (view === 'form') {
		return (
			<div className={cn('space-y-6', className)}>
				<EditorHeader
					title={editingIndex !== null ? 'Update Skill' : 'Add New Skill'}
					description={editingIndex !== null
						? 'Update your skill proficiency level'
						: 'Skills are critical for getting through ATS filters. Add skills relevant to your target job.'}
					className="mb-10"
				/>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
						<div className="p-5 bg-white rounded-lg border shadow-sm">
							<h3 className="text-base font-medium mb-4">{editingIndex !== null ? 'Edit skill' : 'Select a skill'}</h3>
							<div className="flex flex-col gap-4">
								<FormField
									control={form.control}
									name="skill_id"
									render={({field}) => (
										<FormItem>
											<SkillAutocomplete
												skills={globalSkills}
												name="skill_id"
												placeholder="Type to search skills..."
												disabled={isSubmitting || isLoadingGlobalSkills}
												defaultValue={editingIndex !== null ? resumeSkills[editingIndex]?.skill.name : ''}
												onSkillSelect={(skillId, skillName, category) => {
												// For custom skills, set a custom ID format
													if (skillId === 'custom') {
														form.setValue('skill_id', `custom:${skillName}`)
														// Only clear category for custom skills if we're adding a new skill (not editing)
														if (editingIndex === null) {
															form.setValue('category', '')
														}
													// When editing, preserve the existing category
													} else if (skillId) {
													// For existing skills, populate the category
														form.setValue('category', category || '')
													}
												/*
												 * Don't update category when skillId is empty (user is typing/clearing)
												 * This preserves the existing category when editing
												 */
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
									control={form.control}
									name="category"
									render={({field}) => (
										<CategoryAutocomplete
											categories={skillCategories}
											name="category"
											label="Category (optional)"
											placeholder="E.g., Programming Languages, Tools, etc."
											disabled={isSubmitting || isLoadingCategories}
											showLabel
											defaultValue={field.value || ''}
											onCategorySelect={(category) => {
												/*
												 * CategoryAutocomplete already updates the form value
												 * This callback can be used for additional logic if needed
												 */
											}}
										/>
									)}
								/>

								<p className="text-xs text-muted-foreground">
									Skills with detailed proficiency levels stand out to both recruiters and ATS systems.
								</p>
							</div>
						</div>

						<div className="p-5 bg-white rounded-lg border shadow-sm">
							<h3 className="text-base font-medium mb-4">Skill proficiency</h3>
							<FormField
								control={form.control}
								name="level"
								render={() => (
									<ProficiencySlider
										name="level"
										levels={skillLevels}
										description="Rate your proficiency level to help employers understand your expertise"
										disabled={isSubmitting}
									/>
								)}
							/>
						</div>

						<FormButtons
							onCancel={handleCancel}
							isSubmitting={isSubmitting}
							isEditing={editingIndex !== null}
							editingSubmitLabel="Update Skill"
							addingSubmitLabel="Add Skill"
							className="mt-2"
							disabled={!form.watch('skill_id')}
						/>
					</form>
				</Form>
			</div>
		)
	}

	return (
		<div className={cn('space-y-6', className)}>
			<EditorHeader
				title="Skills"
				showAddButton={isMounted && !isLoadingResumeSkills}
				onAddNew={handleAddNew}
				isDisabled={isDeleting}
				addButtonText="Add New Skill"
			/>

			<AnimatePresence mode={ANIMATE_PRESENCE_MODE}>
				{(isLoadingResumeSkills || isLoadingGlobalSkills) && (
					<motion.div
						key="skeleton"
						{...DEFAULT_FADE_ANIMATION}
					>
						<SkillsEditorSkeleton />
					</motion.div>
				)}

				{resumeSkillsError && (
					<motion.div
						key="error"
						{...DEFAULT_FADE_ANIMATION}
						className="text-center py-10 text-red-500"
					>
						Error loading skills. Please try again later.
					</motion.div>
				)}

				{!isLoadingResumeSkills && !isLoadingGlobalSkills && !resumeSkillsError && (
					<motion.div
						key="content"
						{...(isTabSwitch ? NO_ANIMATION : DEFAULT_FADE_CONTENT_ANIMATION)}
						className="space-y-6 overflow-y-auto"
					>
						{Object.keys(skillsByCategory).length > 0 ? (
							<div className="space-y-4" ref={categoryAnimationContainer}>
								{Object.entries(skillsByCategory).map(([category, skills]) => (
									<Collapsible key={category} defaultOpen={true} className="rounded-lg border bg-card overflow-hidden">
										<CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-3 bg-neutral-100 hover:bg-neutral-100 focus:outline-none border-b">
											<h3 className="font-medium text-foreground">{category}</h3>
											<ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 data-[state=open]:rotate-180" />
										</CollapsibleTrigger>
										<CollapsibleContent>
											<div className="divide-y divide-neutral-100" ref={skillAnimationContainer}>
												{skills.map((skill) => (
													<div
														key={skill.id}
														className="group relative flex items-center py-3 px-4 hover:bg-neutral-50 transition-all"
													>
														<div className="flex-1">
															<span className="font-medium text-sm">{skill.name}</span>
															{skill.level && (
																<span className="ml-2 text-xs text-muted-foreground">
																	{getSkillLevelLabel(skill.level)}
																</span>
															)}
														</div>

														<div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
															<Button
																variant="ghost"
																size="icon"
																className="h-8 w-8 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100"
																onClick={() => handleEdit(skill.index)}
																disabled={isDeleting}
															>
																<Pencil className="h-4 w-4" />
																<span className="sr-only">Edit</span>
															</Button>
															{skill.id === deletingId ? (
																<Button
																	variant="ghost"
																	size="icon"
																	className="h-8 w-8"
																	disabled
																>
																	<Loader2 className="h-4 w-4 animate-spin" />
																	<span className="sr-only">Deleting</span>
																</Button>
															) : (
																<PopConfirm
																	triggerElement={
																		<Button
																			variant="ghost"
																			size="icon"
																			className="h-8 w-8 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100"
																			disabled={isDeleting}
																		>
																			<Trash2 className="h-4 w-4" />
																			<span className="sr-only">Delete</span>
																		</Button>
																	}
																	message={`Are you sure you want to remove "${skill.name}" from your resume?`}
																	onYes={() => handleDelete(skill.id)}
																/>
															)}
														</div>
													</div>
												))}
											</div>
										</CollapsibleContent>
									</Collapsible>
								))}
							</div>
						) : (
							<div className="text-center py-8 px-4 border border-dashed rounded-lg bg-neutral-50">
								<div className="mb-3 text-muted-foreground">No skills added yet</div>
								<Button
									onClick={handleAddNew}
									className="bg-flame-500 hover:bg-flame-600 text-white"
								>
									<Plus className="h-4 w-4 mr-2" />
									Add Your First Skill
								</Button>
							</div>
						)}
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	)
}

export default SkillsEditor
