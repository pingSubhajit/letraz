'use client'

import {useEffect, useState} from 'react'
import {cn} from '@/lib/utils'
import {Button} from '@/components/ui/button'
import {Form} from '@/components/ui/form'
import {useForm} from 'react-hook-form'
import {zodResolver} from '@hookform/resolvers/zod'
import {months} from '@/constants'
import {Loader2, Plus} from 'lucide-react'
import {useAutoAnimate} from '@formkit/auto-animate/react'
import {EducationMutation, EducationMutationSchema} from '@/lib/education/types'
import {useQueryClient} from '@tanstack/react-query'
import {toast} from 'sonner'
import {educationOptions, useCurrentEducations} from '@/lib/education/queries'
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
import {countries} from '@/lib/constants'
import {baseResumeQueryOptions} from '@/lib/resume/queries'

type ViewState = 'list' | 'form'

const DEFAULT_EDUCATION_VALUES: EducationMutation = {
	institution_name: '',
	country: '',
	field_of_study: '',
	degree: '',
	started_from_month: null,
	started_from_year: null,
	finished_at_month: null,
	finished_at_year: null,
	current: false,
	description: ''
}

const EducationEditor = ({className}: {className?: string}) => {
	const [view, setView] = useState<ViewState>('list')
	const [parent] = useAutoAnimate()
	const [editingIndex, setEditingIndex] = useState<number | null>(null)
	const queryClient = useQueryClient()
	const [isMounted, setIsMounted] = useState(false)
	const [deletingId, setDeletingId] = useState<string | null>(null)

	const {data: educations = [], isLoading, error} = useCurrentEducations()

	const revalidate = () => {
		queryClient.invalidateQueries({queryKey: educationOptions.queryKey})
		queryClient.invalidateQueries({queryKey: baseResumeQueryOptions.queryKey})
	}

	const {mutateAsync: addEducation, isPending: isAddingPending} = useAddEducationMutation({
		onMutate: async (newEducation) => {
			await queryClient.cancelQueries({queryKey: educationOptions.queryKey})

			const prevAddEducations = queryClient.getQueryData(educationOptions.queryKey)

			queryClient.setQueryData(educationOptions.queryKey, (oldData: any) => {
				const data = oldData || []
				return [...data, {
					...newEducation,
					id: `temp-id-${Date.now()}`,
					country: {
						code: newEducation.country,
						name: countries.find(c => c.code === newEducation.country)?.name || ''
					},
					created_at: new Date().toISOString(),
					updated_at: new Date().toISOString()
				}]
			})

			return {prevEducations: prevAddEducations}
		},
		onError: (err, _newEducation, context: any) => {
			queryClient.setQueryData(educationOptions.queryKey, context?.prevEducations)
			toast.error(`Failed to save education details: ${err.message}`)
		},
		onSettled: () => {
			revalidate()
		},
		onSuccess: () => {
			toast.success('Education added successfully!')
		}
	})

	const {mutateAsync: updateEducation, isPending: isUpdatingPending} = useUpdateEducationMutation({
		onMutate: async ({id, data}) => {
			await queryClient.cancelQueries({queryKey: educationOptions.queryKey})

			const prevUpdateEducations = queryClient.getQueryData(educationOptions.queryKey)

			queryClient.setQueryData(educationOptions.queryKey, (oldData: any) => {
				const dataArr = oldData || []
				return dataArr.map((item: any) => item.id === id ? {
					...item,
					...data,
					country: {
						code: data.country || item.country.code,
						name: data.country ? countries.find(c => c.code === data.country)?.name || '' : item.country.name
					},
					updated_at: new Date().toISOString()
				} : item)
			})

			return {prevEducations: prevUpdateEducations}
		},
		onError: (err, _updateData, context: any) => {
			queryClient.setQueryData(educationOptions.queryKey, context?.prevEducations)
			toast.error(`Failed to update education details: ${err.message}`)
		},
		onSettled: () => {
			revalidate()
		},
		onSuccess: () => {
			toast.success('Education updated successfully!')
		}
	})

	const isSubmitting = isAddingPending || isUpdatingPending

	const {mutateAsync: deleteEducation, isPending: isDeleting} = useDeleteEducationMutation({
		onMutate: async (educationId) => {
			setDeletingId(educationId)

			await queryClient.cancelQueries({queryKey: educationOptions.queryKey})

			const prevDeleteEducations = queryClient.getQueryData(educationOptions.queryKey)

			queryClient.setQueryData(educationOptions.queryKey, (oldData: any) => {
				const data = oldData || []
				return data.filter((item: any) => item.id !== educationId)
			})

			return {prevEducations: prevDeleteEducations}
		},
		onError: (err, _educationId, context: any) => {
			queryClient.setQueryData(educationOptions.queryKey, context?.prevEducations)
			toast.error(`Failed to delete education: ${err.message}`)
		},
		onSettled: () => {
			revalidate()
			setDeletingId(null)
		},
		onSuccess: () => {
			toast.success('Education deleted successfully!')
		}
	})

	useEffect(() => {
		setIsMounted(true)
	}, [])

	const form = useForm<EducationMutation>({
		resolver: zodResolver(EducationMutationSchema),
		defaultValues: DEFAULT_EDUCATION_VALUES
	})

	const onSubmit = async (values: EducationMutation) => {
		try {
			if (editingIndex !== null) {
				const educationId = educations[editingIndex]?.id
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
		const education = educations[index]
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
			await deleteEducation(id)
			if (editingIndex !== null && educations[editingIndex]?.id === id) {
				setEditingIndex(null)
				form.reset(DEFAULT_EDUCATION_VALUES)
				setView('list')
			}
		} catch (error) {
			// Error already handled by the mutation's onError callback
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

				{baseResumeQueryOptions.queryKey} {typeof baseResumeQueryOptions.queryKey[0]}

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

			{isLoading ? (
				<div className="flex items-center justify-center py-10">
					<Loader2 className="h-8 w-8 animate-spin text-primary" />
					<span className="ml-2">Loading education details...</span>
				</div>
			) : error ? (
				<div className="text-center py-10 text-red-500">
					Error loading education details. Please try again later.
				</div>
			) : (
				<div ref={parent} className="space-y-4">
					{educations.length > 0 ? (
						educations.map((education, index) => (
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
						))
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
				</div>
			)}
		</div>
	)
}

export default EducationEditor

