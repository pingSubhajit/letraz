'use client'

import {useEffect, useState} from 'react'
import {cn} from '@/lib/utils'
import {Button} from '@/components/ui/button'
import {Form} from '@/components/ui/form'
import {useForm} from 'react-hook-form'
import {zodResolver} from '@hookform/resolvers/zod'
import {months} from '@/constants'
import {Plus} from 'lucide-react'
import EducationEditorSkeleton from '@/components/skeletons/EducationEditorSkeleton'
import {useAutoAnimate} from '@formkit/auto-animate/react'
import {AnimatePresence, motion} from 'motion/react'
import {
	ANIMATE_PRESENCE_MODE,
	DEFAULT_FADE_ANIMATION,
	DEFAULT_FADE_CONTENT_ANIMATION,
	NO_ANIMATION
} from '@/components/animations/DefaultFade'
import {Education, EducationMutation, EducationMutationSchema} from '@/lib/education/types'
import {useQueryClient} from '@tanstack/react-query'
import {toast} from 'sonner'
import {educationOptions, useCurrentEducations} from '@/lib/education/queries'
import {baseResumeQueryOptions} from '@/lib/resume/queries'
import {
	useAddEducationMutation,
	useDeleteEducationMutation,
	useUpdateEducationMutation
} from '@/lib/education/mutations'
import EditorHeader from '@/components/resume/editors/shared/EditorHeader'
import DateRangeFields from '@/components/resume/editors/shared/DateRangeFields'
import CountrySelect from '@/components/resume/editors/shared/CountrySelect'
import TextFormField from '@/components/resume/editors/shared/TextFormField'
import RichTextFormField from '@/components/resume/editors/shared/RichTextFormField'
import FormButtons from '@/components/resume/editors/shared/FormButtons'
import ItemCard from '@/components/resume/editors/shared/ItemCard'


const DEFAULT_EDUCATION_VALUES: EducationMutation = {
	institution_name: '',
	field_of_study: '',
	degree: '',
	country: '',
	started_from_month: null,
	started_from_year: null,
	finished_at_month: null,
	finished_at_year: null,
	current: false,
	description: ''
}

type ViewState = 'list' | 'form'

interface EducationEditorProps {
  className?: string
  isTabSwitch?: boolean
}

const EducationEditor = ({className, isTabSwitch = false}: EducationEditorProps) => {
	const [isMounted, setIsMounted] = useState(false)
	const [view, setView] = useState<ViewState>('list')
	const [editingIndex, setEditingIndex] = useState<number | null>(null)
	const [deletingId, setDeletingId] = useState<string | null>(null)
	const [localEducations, setLocalEducations] = useState<Education[]>([])
	const [parent] = useAutoAnimate()

	const queryClient = useQueryClient()

	const revalidate = () => {
		queryClient.invalidateQueries({queryKey: educationOptions.queryKey})
		queryClient.invalidateQueries({queryKey: baseResumeQueryOptions.queryKey})
	}

	const form = useForm<EducationMutation>({
		resolver: zodResolver(EducationMutationSchema),
		defaultValues: DEFAULT_EDUCATION_VALUES,
		mode: 'onChange'
	})

	const {data: educations = [], isLoading, error} = useCurrentEducations()

	const {mutateAsync: addEducation, isPending: isAdding} = useAddEducationMutation({
		onSuccess: () => {
			revalidate()
			toast.success('Education added successfully!')
		},
		onError: (error) => {
			toast.error('Failed to add education. Please try again.')
		}
	})

	const {mutateAsync: updateEducation, isPending: isUpdating} = useUpdateEducationMutation({
		onSuccess: () => {
			revalidate()
			toast.success('Education updated successfully!')
		},
		onError: (error) => {
			toast.error('Failed to update education. Please try again.')
		}
	})

	const {mutateAsync: deleteEducation, isPending: isDeleting} = useDeleteEducationMutation({
		onSuccess: () => {
			revalidate()
			toast.success('Education deleted successfully!')
		},
		onError: (error) => {
			toast.error('Failed to delete education. Please try again.')
		}
	})

	const isSubmitting = isAdding || isUpdating

	useEffect(() => {
		setLocalEducations(educations)
	}, [educations])

	useEffect(() => {
		setIsMounted(true)
	}, [])


	const renderEducationItem = (education: Education, index: number) => (
		<ItemCard
			key={education.id}
			onEdit={() => handleEdit(index)}
			onDelete={() => handleDelete(education.id)}
			isDeleting={isDeleting}
			id={education.id}
			deletingId={deletingId}
		>
			<h3 className="font-medium">
				{education.degree} {education.degree && education.field_of_study && 'in'} {education.field_of_study}
			</h3>
			<p className="text-sm text-muted-foreground">
				{[
					education.institution_name,
					education.country?.name
				].filter(Boolean).join(', ')}
			</p>
			<p className="text-sm">
				{education.started_from_month && months.find(m => m.value === education.started_from_month?.toString())?.label} {education.started_from_year} - {' '}
				{education.current ? 'Present' : (
					<>
						{education.finished_at_month && months.find(m => m.value === education.finished_at_month?.toString())?.label} {education.finished_at_year}
					</>
				)}
			</p>
		</ItemCard>
	)

	const onSubmit = async (values: EducationMutation) => {
		try {
			if (editingIndex !== null) {
				const educationId = localEducations[editingIndex]?.id
				await updateEducation({id: educationId, data: values})
			} else {
				await addEducation(values)
			}

			form.reset(DEFAULT_EDUCATION_VALUES)
			setView('list')
			setEditingIndex(null)
		} catch (error) {
			// Error already handled by the mutation's onError callback
		}
	}

	const handleEdit = (index: number) => {
		const education = localEducations[index]
		form.reset({
			...education,
			country: education.country.code,
			started_from_month: education.started_from_month?.toString() || null,
			started_from_year: education.started_from_year?.toString() || null,
			finished_at_month: education.finished_at_month?.toString() || null,
			finished_at_year: education.finished_at_year?.toString() || null
		})
		setEditingIndex(index)
		setView('form')
	}

	const handleDelete = async (id: string) => {
		try {
			setDeletingId(id)
			await deleteEducation(id)
			if (editingIndex !== null && localEducations[editingIndex]?.id === id) {
				setEditingIndex(null)
				form.reset(DEFAULT_EDUCATION_VALUES)
				setView('list')
			}
		} catch (error) {
			// Error already handled by the mutation's onError callback
		} finally {
			setDeletingId(null)
		}
	}

	const handleAddNew = () => {
		form.reset(DEFAULT_EDUCATION_VALUES)
		setEditingIndex(null)
		setView('form')
	}

	const handleCancel = () => {
		form.reset(DEFAULT_EDUCATION_VALUES)
		setEditingIndex(null)
		setView('list')
	}

	if (view === 'form') {
		return (
			<div className={cn('space-y-6', className)}>
				<EditorHeader
					title={editingIndex !== null ? 'Update Education' : 'Add New Education'}
					description={editingIndex !== null
						? 'Ensure that the details are correct and reflect your educational background'
						: 'Having 2 or more educational details can increase the chance of your résumé getting selected upto 15%'
					}
					className="mb-10"
				/>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
						<div className="grid grid-cols-2 gap-4">
							<TextFormField
								form={form}
								name="institution_name"
								label="Institution Name"
								placeholder="e.g. Harvard University"
								disabled={isSubmitting}
							/>
							<CountrySelect
								form={form}
								name="country"
								disabled={isSubmitting}
							/>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<TextFormField
								form={form}
								name="degree"
								label="Degree"
								placeholder="e.g. Bachelor of Science"
								disabled={isSubmitting}
							/>
							<TextFormField
								form={form}
								name="field_of_study"
								label="Field of Study"
								placeholder="e.g. Computer Science"
								disabled={isSubmitting}
							/>
						</div>

						<DateRangeFields
							form={form}
							isSubmitting={isSubmitting}
							currentLabel="I currently study here"
						/>

						<RichTextFormField
							form={form}
							name="description"
							label="Description"
							placeholder="Describe your academic achievements, relevant coursework, thesis, or any notable projects completed during your studies..."
							disabled={isSubmitting}
						/>

						<FormButtons
							onCancel={handleCancel}
							isSubmitting={isSubmitting}
							isEditing={editingIndex !== null}
							editingSubmitLabel="Update Education"
							addingSubmitLabel="Add Education"
						/>
					</form>
				</Form>
			</div>
		)
	}

	return (
		<div className={cn('space-y-6', className)}>
			<EditorHeader
				title="Education"
				showAddButton={isMounted && !isLoading}
				onAddNew={handleAddNew}
				isDisabled={isDeleting}
				addButtonText="Add New Education"
			/>

			<AnimatePresence mode={ANIMATE_PRESENCE_MODE}>
				{isLoading && (
					<motion.div
						key="skeleton"
						{...DEFAULT_FADE_ANIMATION}
					>
						<EducationEditorSkeleton />
					</motion.div>
				)}

				{error && (
					<motion.div
						key="error"
						{...DEFAULT_FADE_ANIMATION}
						className="text-center py-10 text-red-500"
					>
						Error loading education details. Please try again later.
					</motion.div>
				)}

				{!isLoading && !error && (
					<motion.div
						key="content"
						{...(isTabSwitch ? NO_ANIMATION : DEFAULT_FADE_CONTENT_ANIMATION)}
					>
						{localEducations.length > 0 ? (
							<div className="space-y-4" ref={parent}>
								{localEducations.map((education, index) => renderEducationItem(education, index))}
							</div>
						) : (
							<Button
								onClick={handleAddNew}
								className="w-full"
								variant="outline"
							>
								<Plus className="h-4 w-4 mr-2" />
								Add New Education
							</Button>
						)}
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	)
}

export default EducationEditor

