'use client'

import {useState, useEffect} from 'react'
import {cn} from '@/lib/utils'
import {Button} from '@/components/ui/button'
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from '@/components/ui/form'
import {useForm} from 'react-hook-form'
import {zodResolver} from '@hookform/resolvers/zod'
import {months, years} from '@/constants'
import {Loader2, Plus} from 'lucide-react'
import {useAutoAnimate} from '@formkit/auto-animate/react'
import {employmentTypes, ExperienceMutation, ExperienceMutationSchema} from '@/lib/experience/types'
import {useQueryClient} from '@tanstack/react-query'
import {toast} from 'sonner'
import {experienceQueryOptions, useCurrentExperiences} from '@/lib/experience/queries'
import {useAddUserExperienceMutation, useDeleteExperienceMutation, useUpdateExperienceMutation} from '@/lib/experience/mutations'
import {countries} from '@/lib/constants'
import EditorHeader from '@/components/resume/editors/shared/EditorHeader'
import DateRangeFields from '@/components/resume/editors/shared/DateRangeFields'
import CountrySelect from '@/components/resume/editors/shared/CountrySelect'
import TextFormField from '@/components/resume/editors/shared/TextFormField'
import RichTextFormField from '@/components/resume/editors/shared/RichTextFormField'
import FormButtons from '@/components/resume/editors/shared/FormButtons'
import ItemCard from '@/components/resume/editors/shared/ItemCard'
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select'

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

const ExperienceEditor = ({className}: {className?: string}) => {
	const [view, setView] = useState<ViewState>('list')
	const [parent] = useAutoAnimate()
	const [editingIndex, setEditingIndex] = useState<number | null>(null)
	const queryClient = useQueryClient()
	const [isMounted, setIsMounted] = useState(false)
	const [deletingId, setDeletingId] = useState<string | null>(null)

	const {data: experiences = [], isLoading, error} = useCurrentExperiences()

	const {mutateAsync: addExperience, isPending: isAddingPending} = useAddUserExperienceMutation({
		onMutate: async (newExperience) => {
			await queryClient.cancelQueries({queryKey: experienceQueryOptions.queryKey})

			const prevAddExperiences = queryClient.getQueryData(experienceQueryOptions.queryKey)

			queryClient.setQueryData(experienceQueryOptions.queryKey, (oldData: any) => {
				const data = oldData || []
				return [...data, {
					...newExperience,
					id: `temp-id-${Date.now()}`,
					country: {
						code: newExperience.country,
						name: countries.find(c => c.code === newExperience.country)?.name || ''
					},
					created_at: new Date().toISOString(),
					updated_at: new Date().toISOString()
				}]
			})

			return {prevExperiences: prevAddExperiences}
		},
		onError: (err, _newExperience, context: any) => {
			queryClient.setQueryData(experienceQueryOptions.queryKey, context?.prevExperiences)
			toast.error(`Failed to save experience details: ${err.message}`)
		},
		onSettled: () => {
			queryClient.invalidateQueries({queryKey: experienceQueryOptions.queryKey})
		},
		onSuccess: () => {
			toast.success('Experience added successfully!')
		}
	})

	const {mutateAsync: updateExperience, isPending: isUpdatingPending} = useUpdateExperienceMutation({
		onMutate: async ({id, data}) => {
			await queryClient.cancelQueries({queryKey: experienceQueryOptions.queryKey})

			const prevUpdateExperiences = queryClient.getQueryData(experienceQueryOptions.queryKey)

			queryClient.setQueryData(experienceQueryOptions.queryKey, (oldData: any) => {
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

			return {prevExperiences: prevUpdateExperiences}
		},
		onError: (err, _updateData, context: any) => {
			queryClient.setQueryData(experienceQueryOptions.queryKey, context?.prevExperiences)
			toast.error(`Failed to update experience details: ${err.message}`)
		},
		onSettled: () => {
			queryClient.invalidateQueries({queryKey: experienceQueryOptions.queryKey})
		},
		onSuccess: () => {
			toast.success('Experience updated successfully!')
		}
	})

	const isSubmitting = isAddingPending || isUpdatingPending

	const {mutateAsync: deleteExperience, isPending: isDeleting} = useDeleteExperienceMutation({
		onMutate: async (experienceId) => {
			setDeletingId(experienceId)

			await queryClient.cancelQueries({queryKey: experienceQueryOptions.queryKey})

			const prevDeleteExperiences = queryClient.getQueryData(experienceQueryOptions.queryKey)

			queryClient.setQueryData(experienceQueryOptions.queryKey, (oldData: any) => {
				const data = oldData || []
				return data.filter((item: any) => item.id !== experienceId)
			})

			return {prevExperiences: prevDeleteExperiences}
		},
		onError: (err, _experienceId, context: any) => {
			queryClient.setQueryData(experienceQueryOptions.queryKey, context?.prevExperiences)
			toast.error(`Failed to delete experience: ${err.message}`)
		},
		onSettled: () => {
			queryClient.invalidateQueries({queryKey: experienceQueryOptions.queryKey})
			setDeletingId(null)
		},
		onSuccess: () => {
			toast.success('Experience deleted successfully!')
		}
	})

	useEffect(() => {
		setIsMounted(true)
	}, [])

	const form = useForm<ExperienceMutation>({
		resolver: zodResolver(ExperienceMutationSchema),
		defaultValues: DEFAULT_EXPERIENCE_VALUES
	})

	const onSubmit = async (values: ExperienceMutation) => {
		try {
			// If current is true, ensure end dates are null
			const submissionValues = {
				...values,
				finished_at_month: values.current ? null : values.finished_at_month,
				finished_at_year: values.current ? null : values.finished_at_year
			}

			if (editingIndex !== null) {
				const experienceId = experiences[editingIndex]?.id
				await updateExperience({id: experienceId, data: submissionValues})
			} else {
				await addExperience(submissionValues)
			}

			form.reset(DEFAULT_EXPERIENCE_VALUES)
			setView('list')
			setEditingIndex(null)
		} catch (error) {
			// Error already handled by the mutation's onError callback
		}
	}

	const handleEdit = (index: number) => {
		const experience = experiences[index]

		// Find the employment type code that matches the label in the data
		const employmentTypeCode = employmentTypes.find(
			type => type.label === experience.employment_type
		)?.value || 'flt' // Default to full-time if not found

		form.reset({
			...experience,
			country: experience.country.code,
			employment_type: employmentTypeCode as 'flt' | 'prt' | 'con' | 'int' | 'fre' | 'sel' | 'vol' | 'tra',
			started_from_month: experience.started_from_month?.toString() || null,
			started_from_year: experience.started_from_year?.toString() || null,
			finished_at_month: experience.finished_at_month?.toString() || null,
			finished_at_year: experience.finished_at_year?.toString() || null,
			current: experience.current
		})
		setEditingIndex(index)
		setView('form')
	}

	const handleDelete = async (id: string) => {
		try {
			await deleteExperience(id)
			if (editingIndex !== null && experiences[editingIndex]?.id === id) {
				setEditingIndex(null)
				form.reset(DEFAULT_EXPERIENCE_VALUES)
				setView('list')
			}
		} catch (error) {
			// Error already handled by the mutation's onError callback
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
	}

	if (view === 'form') {
		return (
			<div className={cn('space-y-6', className)}>
				<EditorHeader
					title={editingIndex !== null ? 'Update Experience' : 'Add New Experience'}
					description={editingIndex !== null
						? 'Ensure that the details are correct and reflect your previous experience'
						: 'Mentioning your past employment details can increase the chance of your résumé getting selected upto 75%'
					}
					className="mb-10"
				/>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
						<div className="grid grid-cols-2 gap-4">
							<TextFormField
								form={form}
								name="company_name"
								label="Company Name"
								placeholder="e.g. Google"
								disabled={isSubmitting}
							/>
							<TextFormField
								form={form}
								name="job_title"
								label="Job Title"
								placeholder="e.g. Software Engineer"
								disabled={isSubmitting}
							/>
						</div>

						<div className="grid grid-cols-3 gap-4">
							<FormField
								control={form.control}
								name="employment_type"
								render={({field}) => (
									<FormItem>
										<FormLabel className="text-foreground">Employment Type</FormLabel>
										<Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting}>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Select type" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{employmentTypes.map(type => (
													<SelectItem key={type.value} value={type.value || ''}>
														{type.label}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<FormMessage className="text-xs" />
									</FormItem>
								)}
							/>
							<TextFormField
								form={form}
								name="city"
								label="City"
								placeholder="e.g. San Francisco"
								disabled={isSubmitting}
							/>
							<CountrySelect
								form={form}
								name="country"
								disabled={isSubmitting}
							/>
						</div>

						<DateRangeFields
							form={form}
							isSubmitting={isSubmitting}
							currentLabel="I currently work here"
						/>

						<RichTextFormField
							form={form}
							name="description"
							label="Description"
							placeholder="Describe your role, responsibilities, and key achievements..."
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
		)
	}

	return (
		<div className={cn('space-y-6', className)}>
			<EditorHeader
				title="Experience"
				showAddButton={isMounted && !isLoading && experiences.length > 0}
				onAddNew={handleAddNew}
				isDisabled={isDeleting}
				addButtonText="Add New Experience"
			/>

			{isLoading ? (
				<div className="flex items-center justify-center py-10">
					<Loader2 className="h-8 w-8 animate-spin text-primary" />
					<span className="ml-2">Loading experience details...</span>
				</div>
			) : error ? (
				<div className="text-center py-10 text-red-500">
					Error loading experience details. Please try again later.
				</div>
			) : (
				<div ref={parent} className="space-y-4">
					{experiences.length > 0 ? (
						experiences.map((experience, index) => (
							<ItemCard
								key={experience.id}
								onEdit={() => handleEdit(index)}
								onDelete={() => handleDelete(experience.id)}
								isDeleting={isDeleting}
								id={experience.id}
								deletingId={deletingId}
							>
								<h3 className="font-medium">{experience.job_title} at {experience.company_name}</h3>
								<p className="text-sm text-muted-foreground">
									{experience.employment_type} | {[
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
						))
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
				</div>
			)}
		</div>
	)
}

export default ExperienceEditor
