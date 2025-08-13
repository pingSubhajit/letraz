'use client'

import {useEffect, useState} from 'react'
import {cn} from '@/lib/utils'
import {Button} from '@/components/ui/button'
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from '@/components/ui/form'
import {useForm} from 'react-hook-form'
import {zodResolver} from '@hookform/resolvers/zod'
import {months} from '@/constants'
import {Plus} from 'lucide-react'
import {useAutoAnimate} from '@formkit/auto-animate/react'
import {employmentTypes, Experience, ExperienceMutation, ExperienceMutationSchema} from '@/lib/experience/types'
import {useQueryClient} from '@tanstack/react-query'
import {toast} from 'sonner'
import {experienceQueryOptions, useCurrentExperiences} from '@/lib/experience/queries'
import {
	useAddUserExperienceMutation,
	useDeleteExperienceMutation,
	useUpdateExperienceMutation
} from '@/lib/experience/mutations'
import ExperienceEditorSkeleton from '@/components/skeletons/ExperienceEditorSkeleton'
import {AnimatePresence, motion} from 'motion/react'
import {
	ANIMATE_PRESENCE_MODE,
	DEFAULT_FADE_ANIMATION,
	DEFAULT_FADE_CONTENT_ANIMATION,
	NO_ANIMATION
} from '@/components/animations/DefaultFade'
import EditorHeader from '@/components/resume/editors/shared/EditorHeader'
import DateRangeFields from '@/components/resume/editors/shared/DateRangeFields'
import CountrySelect from '@/components/resume/editors/shared/CountrySelect'
import TextFormField from '@/components/resume/editors/shared/TextFormField'
import RichTextFormField from '@/components/resume/editors/shared/RichTextFormField'
import FormButtons from '@/components/resume/editors/shared/FormButtons'
import ItemCard from '@/components/resume/editors/shared/ItemCard'

import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select'
import {baseResumeQueryOptions} from '@/lib/resume/queries'
import {useAutoFocusField} from '@/components/resume/hooks/useAutoFocus'
import {useResumeHighlight} from '@/components/resume/contexts/ResumeHighlightContext'
import ScrollMask from '@/components/ui/scroll-mask'

type ViewState = 'list' | 'form'

const DEFAULT_EXPERIENCE_VALUES: ExperienceMutation = {
	company_name: '',
	job_title: '',
	employment_type: 'flt',
	city: '',
	country: '',
	started_from_month: null,
	started_from_year: null,
	finished_at_month: null,
	finished_at_year: null,
	current: false,
	description: ''
}

interface ExperienceEditorProps {
  className?: string
  isTabSwitch?: boolean
}

const ExperienceEditor = ({className, isTabSwitch = false}: ExperienceEditorProps) => {
	const [isMounted, setIsMounted] = useState(false)
	const [view, setView] = useState<ViewState>('list')
	const [editingIndex, setEditingIndex] = useState<number | null>(null)
	const [deletingId, setDeletingId] = useState<string | null>(null)
	const [localExperiences, setLocalExperiences] = useState<Experience[]>([])
	const [parent] = useAutoAnimate()

	const queryClient = useQueryClient()
	const {scrollToItem, clearHighlight} = useResumeHighlight()

	// Auto-focus the first field when form is opened
	useAutoFocusField(view === 'form', 'job_title')

	const {data: experiences = [], isLoading, error} = useCurrentExperiences()

	const revalidate = () => {
		queryClient.invalidateQueries({queryKey: experienceQueryOptions.queryKey})
		queryClient.invalidateQueries({queryKey: baseResumeQueryOptions.queryKey})
	}

	const {mutateAsync: addExperience, isPending: isAdding} = useAddUserExperienceMutation({
		onSuccess: () => {
			revalidate()
			toast.success('Experience added successfully!')
		},
		onError: (error) => {
			toast.error('Failed to add experience. Please try again.')
		}
	})

	const {mutateAsync: updateExperience, isPending: isUpdating} = useUpdateExperienceMutation({
		onSuccess: () => {
			revalidate()
			toast.success('Experience updated successfully!')
		},
		onError: (error) => {
			toast.error('Failed to update experience. Please try again.')
		}
	})

	const {mutateAsync: deleteExperience, isPending: isDeleting} = useDeleteExperienceMutation({
		onSuccess: () => {
			revalidate()
			toast.success('Experience deleted successfully!')
		},
		onError: (error) => {
			toast.error('Failed to delete experience. Please try again.')
		}
	})

	const isSubmitting = isAdding || isUpdating

	useEffect(() => {
		setLocalExperiences(experiences)
	}, [experiences])

	useEffect(() => {
		setIsMounted(true)
	}, [])

	const form = useForm<ExperienceMutation>({
		resolver: zodResolver(ExperienceMutationSchema),
		defaultValues: DEFAULT_EXPERIENCE_VALUES,
		mode: 'onChange'
	})


	const renderExperienceItem = (experience: Experience, index: number) => (
		<ItemCard
			key={experience.id}
			onEdit={() => handleEdit(index)}
			onDelete={() => handleDelete(experience.id)}
			isDeleting={isDeleting}
			id={experience.id}
			deletingId={deletingId}
		>
			<h3 className="font-medium">
				{experience.job_title} {experience.job_title && experience.company_name && 'at'} {experience.company_name}
			</h3>
			<p className="text-sm text-muted-foreground">
				{[
					employmentTypes.find(type => type.value === experience.employment_type)?.label,
					experience.city,
					experience.country?.name
				].filter(Boolean).join(', ')}
			</p>
			<p className="text-sm">
				{experience.started_from_month && months.find(m => m.value === experience.started_from_month?.toString())?.label} {experience.started_from_year} - {' '}
				{experience.current ? 'Present' : (
					<>
						{experience.finished_at_month && months.find(m => m.value === experience.finished_at_month?.toString())?.label} {experience.finished_at_year}
					</>
				)}
			</p>
		</ItemCard>
	)

	const onSubmit = async (values: ExperienceMutation) => {
		try {
			// If current is true, ensure end dates are null
			const submissionValues = {
				...values,
				finished_at_month: values.current ? null : values.finished_at_month,
				finished_at_year: values.current ? null : values.finished_at_year
			}

			if (editingIndex !== null) {
				const experienceId = localExperiences[editingIndex]?.id
				await updateExperience({id: experienceId, data: submissionValues})
			} else {
				await addExperience(submissionValues)
			}

			form.reset(DEFAULT_EXPERIENCE_VALUES)
			setView('list')
			setEditingIndex(null)
			clearHighlight()
		} catch (error) {
			// Error already handled by the mutation's onError callback
		}
	}

	const handleEdit = (index: number) => {
		const experience = localExperiences[index]

		// Find the employment type code that matches the label in the data
		const employmentTypeCode = employmentTypes.find(
			type => type.label === experience.employment_type
		)?.value || 'flt' // Default to full-time if not found

		form.reset({
			...experience,
			employment_type: employmentTypeCode,
			country: experience.country.code,
			started_from_month: experience.started_from_month?.toString() || null,
			started_from_year: experience.started_from_year?.toString() || null,
			finished_at_month: experience.finished_at_month?.toString() || null,
			finished_at_year: experience.finished_at_year?.toString() || null
		})
		setEditingIndex(index)
		setView('form')

		// Trigger highlight for this experience item
		scrollToItem({
			type: 'experience',
			id: experience.id
		})
	}

	const handleDelete = async (id: string) => {
		try {
			setDeletingId(id)
			await deleteExperience(id)
			if (editingIndex !== null && localExperiences[editingIndex]?.id === id) {
				setEditingIndex(null)
				form.reset(DEFAULT_EXPERIENCE_VALUES)
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
		form.reset(DEFAULT_EXPERIENCE_VALUES)
		setEditingIndex(null)
		setView('form')
	}

	const handleCancel = () => {
		form.reset(DEFAULT_EXPERIENCE_VALUES)
		setEditingIndex(null)
		setView('list')
		clearHighlight()
	}

	if (view === 'form') {
		return (
			<ScrollMask
				className={cn('space-y-6', className)}
				style={{height: 'calc(100vh - 162px)'}}
				data-lenis-prevent
			>
				<div className="space-y-6 px-1">
					<EditorHeader
						title={editingIndex !== null ? 'Update Experience' : 'Add New Experience'}
						description={editingIndex !== null
							? 'Ensure that the details are correct and reflect your professional background'
							: 'Adding detailed work experience helps employers understand your qualifications and achievements'
						}
						className="mb-10"
					/>

					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
							<div className="grid grid-cols-2 gap-4">
								<TextFormField
									form={form}
									name="job_title"
									label="Job Title"
									placeholder="e.g. Senior Software Engineer"
									disabled={isSubmitting}
								/>
								<TextFormField
									form={form}
									name="company_name"
									label="Company Name"
									placeholder="e.g. Google"
									disabled={isSubmitting}
								/>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<FormField
									control={form.control}
									name="employment_type"
									render={({field}) => (
										<FormItem>
											<FormLabel>Employment Type</FormLabel>
											<Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting}>
												<FormControl>
													<SelectTrigger>
														<SelectValue placeholder="Select employment type" />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													{employmentTypes.map(type => (
														<SelectItem key={type.value} value={type.value}>
															{type.label}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
											<FormMessage />
										</FormItem>
									)}
								/>
								<CountrySelect
									form={form}
									name="country"
									disabled={isSubmitting}
								/>
							</div>

							<TextFormField
								form={form}
								name="city"
								label="City"
								placeholder="e.g. New York"
								disabled={isSubmitting}
							/>

							<DateRangeFields
								form={form}
								isSubmitting={isSubmitting}
								currentLabel="I currently work here"
							/>

							<RichTextFormField
								form={form}
								name="description"
								label="Description"
								placeholder="Describe your key responsibilities, accomplishments, and the impact you made in this role..."
								disabled={isSubmitting}
							/>

							<FormButtons
								onCancel={handleCancel}
								isSubmitting={isSubmitting}
								isEditing={editingIndex !== null}
								editingSubmitLabel="Update Experience"
								addingSubmitLabel="Add Experience"
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
			style={{height: 'calc(100vh - 162px)'}}
			data-lenis-prevent
		>
			<div className="space-y-6 px-1">
				<EditorHeader
					title="Experience"
					showAddButton={isMounted && !isLoading}
					onAddNew={handleAddNew}
					isDisabled={isDeleting}
					addButtonText="Add New Experience"
					className="flex-shrink-0"
				/>

				<AnimatePresence mode={ANIMATE_PRESENCE_MODE}>
					{isLoading && (
						<motion.div
							key="skeleton"
							{...DEFAULT_FADE_ANIMATION}
						>
							<ExperienceEditorSkeleton />
						</motion.div>
					)}

					{error && (
						<motion.div
							key="error"
							{...DEFAULT_FADE_ANIMATION}
							className="text-center py-10 text-red-500"
						>
							Error loading experience details. Please try again later.
						</motion.div>
					)}

					{!isLoading && !error && (
						<motion.div
							key="content"
							{...(isTabSwitch ? NO_ANIMATION : DEFAULT_FADE_CONTENT_ANIMATION)}
						>
							{localExperiences.length > 0 ? (
								<div className="space-y-4" ref={parent}>
									{localExperiences.map((experience, index) => renderExperienceItem(experience, index))}
								</div>
							) : (
								<Button
									onClick={handleAddNew}
									className="w-full"
									variant="outline"
								>
									<Plus className="h-4 w-4 mr-2" />
									Add New Experience
								</Button>
							)}
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</ScrollMask>
	)
}

export default ExperienceEditor
