'use client'

import {useState, useEffect} from 'react'
import {cn} from '@/lib/utils'
import {Button} from '@/components/ui/button'
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from '@/components/ui/form'
import {useForm} from 'react-hook-form'
import {zodResolver} from '@hookform/resolvers/zod'
import {months, years} from '@/constants'
import {countries} from '@/lib/constants'
import {Pencil, Plus, X, Loader2} from 'lucide-react'
import {BrandedInput as Input} from '@/components/ui/input'
import {
	BrandedSelectTrigger as SelectTrigger,
	Select,
	SelectContent,
	SelectItem,
	SelectValue
} from '@/components/ui/select'
import RichTextEditor from '@/components/richTextEditor'
import PopConfirm from '@/components/ui/pop-confirm'
import {useAutoAnimate} from '@formkit/auto-animate/react'
import {Checkbox} from '@/components/ui/checkbox'
import {EducationMutation, EducationMutationSchema} from '@/lib/education/types'
import {useQueryClient} from '@tanstack/react-query'
import {toast} from 'sonner'
import {educationOptions, useCurrentEducations} from '@/lib/education/queries'
import {useAddEducationMutation, useDeleteEducationMutation} from '@/lib/education/mutations'
import Image from 'next/image'
import ButtonGroup from '@/components/ui/button-group'
import {AnimatePresence, motion} from 'framer-motion'

type ViewState = 'list' | 'form'

const EducationEditor = ({className}: {className?: string}) => {
	const [view, setView] = useState<ViewState>('list')
	const [parent] = useAutoAnimate()
	const [editingIndex, setEditingIndex] = useState<number | null>(null)
	const [headerParent] = useAutoAnimate()
	const queryClient = useQueryClient()
	const [isMounted, setIsMounted] = useState(false)
	const [deletingId, setDeletingId] = useState<string | null>(null)

	const {data: educations = [], isLoading, error} = useCurrentEducations()

	const {mutateAsync: addOrUpdateEducation, isPending: isSubmitting} = useAddEducationMutation({
		onMutate: async (newEducation) => {
			await queryClient.cancelQueries(educationOptions)

			const prevEducations = queryClient.getQueryData(educationOptions.queryKey)

			if (editingIndex !== null) {
				const currentId = educations[editingIndex]?.id
				queryClient.setQueryData(educationOptions.queryKey, (oldData: any) => {
					const data = oldData || []
					return data.map((item: any) => item.id === currentId ? {...item, ...newEducation} : item)
				})
			} else {
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
			}

			return {prevEducations}
		},
		onError: (err, _newEducation, context: any) => {
			queryClient.setQueryData(educationOptions.queryKey, context?.prevEducations)
			toast.error(`Failed to save education details: ${err.message}`)
		},
		onSettled: () => {
			queryClient.invalidateQueries(educationOptions)
		},
		onSuccess: () => {
			toast.success(editingIndex !== null ? 'Education updated successfully!' : 'Education added successfully!')
		}
	})

	const {mutateAsync: deleteEducation, isPending: isDeleting} = useDeleteEducationMutation({
		onMutate: async (educationId) => {
			setDeletingId(educationId)

			await queryClient.cancelQueries(educationOptions)

			const prevEducations = queryClient.getQueryData(educationOptions.queryKey)

			queryClient.setQueryData(educationOptions.queryKey, (oldData: any) => {
				const data = oldData || []
				return data.filter((item: any) => item.id !== educationId)
			})

			return {prevEducations}
		},
		onError: (err, _educationId, context: any) => {
			queryClient.setQueryData(educationOptions.queryKey, context?.prevEducations)
			toast.error(`Failed to delete education: ${err.message}`)
		},
		onSettled: () => {
			queryClient.invalidateQueries(educationOptions)
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
		defaultValues: {
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
	})

	const onSubmit = async (values: EducationMutation) => {
		try {
			await addOrUpdateEducation(values)
			form.reset()
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
				form.reset()
				setView('list')
			}
		} catch (error) {
			// Error already handled by the mutation's onError callback
		}
	}

	const handleAddNew = () => {
		form.reset()
		setEditingIndex(null)
		setView('form')
	}

	const handleCancel = () => {
		form.reset()
		setEditingIndex(null)
		setView('list')
	}

	const isCurrentEducation = form.watch('current')

	if (view === 'form') {
		return (
			<div className={cn('space-y-6', className)}>
				<div ref={headerParent} className="mb-10 flex flex-col gap-1">
					<h2 className="text-lg font-medium min-w-[16rem]">
						{editingIndex !== null ? 'Update Education' : 'Add New Education'}
					</h2>

					<p className="text-sm max-w-lg opacity-80">
						{editingIndex !== null
							? 'Ensure that the details are correct and reflect your educational background'
							: 'Having 2 or more educational details can increase the chance of your résumé getting selected upto 15%'
						}
					</p>
				</div>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
						<div className="grid grid-cols-2 gap-4">
							<FormField
								control={form.control}
								name="institution_name"
								render={({field}) => (
									<FormItem>
										<FormLabel className="text-foreground">Institution Name</FormLabel>
										<FormControl>
											<Input
												{...field}
												placeholder="e.g. Harvard University"
												className="focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0"
												disabled={isSubmitting}
											/>
										</FormControl>
										<FormMessage className="text-xs" />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="country"
								render={({field}) => (
									<FormItem>
										<FormLabel className="text-foreground">Country</FormLabel>
										<Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting}>
											<FormControl>
												<SelectTrigger className="focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0">
													<SelectValue placeholder="Select country">
														{field.value && (
															<span className="flex items-center">
																<Image
																	src={countries.find(c => c.code === field.value)?.flag || ''}
																	width={64}
																	height={64}
																	alt={`The flag of ${countries.find(c => c.code === field.value)?.name}`}
																	className="mr-2 w-6"
																/>
																{countries.find(c => c.code === field.value)?.name || field.value}
															</span>
														)}
													</SelectValue>
												</SelectTrigger>
											</FormControl>
											<SelectContent className="max-h-[300px]">
												{countries.map(country => (
													<SelectItem
														key={country.code}
														value={country.code}
														className="flex items-center"
													>
														<Image
															src={country.flag}
															width={64}
															height={64}
															alt={`The flag of ${country.name}`}
															className="mr-2 w-6"
														/>
														{country.name}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<FormMessage className="text-xs" />
									</FormItem>
								)}
							/>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<FormField
								control={form.control}
								name="degree"
								render={({field}) => (
									<FormItem>
										<FormLabel className="text-foreground">Degree</FormLabel>
										<FormControl>
											<Input
												{...field}
												value={field.value || ''}
												placeholder="e.g. Bachelor of Science"
												className="focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0"
												disabled={isSubmitting}
											/>
										</FormControl>
										<FormMessage className="text-xs" />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="field_of_study"
								render={({field}) => (
									<FormItem>
										<FormLabel className="text-foreground">Field of Study</FormLabel>
										<FormControl>
											<Input
												{...field}
												placeholder="e.g. Computer Science"
												className="focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0"
												disabled={isSubmitting}
											/>
										</FormControl>
										<FormMessage className="text-xs" />
									</FormItem>
								)}
							/>
						</div>

						<div className="grid grid-cols-4 gap-4">
							<FormField
								control={form.control}
								name="started_from_month"
								render={({field}) => (
									<FormItem>
										<FormLabel className="text-foreground">Start Month</FormLabel>
										<Select onValueChange={field.onChange} value={field.value || ''} disabled={isSubmitting}>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Choose start month" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{months.map(month => (
													<SelectItem key={month.value} value={month.value}>
														{month.label}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<FormMessage className="text-xs" />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="started_from_year"
								render={({field}) => (
									<FormItem>
										<FormLabel className="text-foreground">Start Year</FormLabel>
										<Select onValueChange={field.onChange} value={field.value || ''} disabled={isSubmitting}>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Choose start year" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{years.map(year => (
													<SelectItem key={year.value} value={year.value}>
														{year.label}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<FormMessage className="text-xs" />
									</FormItem>
								)}
							/>

							<div className="col-span-2 grid grid-cols-2 gap-4">
								<AnimatePresence>
									{!isCurrentEducation && (
										<>
											<motion.div
												initial={{opacity: 0, height: 0}}
												animate={{opacity: 1, height: 'auto'}}
												exit={{opacity: 0, height: 0}}
												transition={{duration: 0.3, ease: 'easeInOut'}}
											>
												<FormField
													control={form.control}
													name="finished_at_month"
													render={({field}) => (
														<FormItem>
															<FormLabel className="text-foreground">End Month</FormLabel>
															<Select onValueChange={field.onChange} value={field.value || ''} disabled={isSubmitting}>
																<FormControl>
																	<SelectTrigger>
																		<SelectValue placeholder="Choose end month" />
																	</SelectTrigger>
																</FormControl>
																<SelectContent>
																	{months.map(month => (
																		<SelectItem key={month.value} value={month.value}>
																			{month.label}
																		</SelectItem>
																	))}
																</SelectContent>
															</Select>
															<FormMessage className="text-xs" />
														</FormItem>
													)}
												/>
											</motion.div>
											<motion.div
												initial={{opacity: 0, height: 0}}
												animate={{opacity: 1, height: 'auto'}}
												exit={{opacity: 0, height: 0}}
												transition={{duration: 0.3, ease: 'easeInOut'}}
											>
												<FormField
													control={form.control}
													name="finished_at_year"
													render={({field}) => (
														<FormItem>
															<FormLabel className="text-foreground">End Year</FormLabel>
															<Select onValueChange={field.onChange} value={field.value || ''} disabled={isSubmitting}>
																<FormControl>
																	<SelectTrigger>
																		<SelectValue placeholder="Choose end year" />
																	</SelectTrigger>
																</FormControl>
																<SelectContent>
																	{years.map(year => (
																		<SelectItem key={year.value} value={year.value}>
																			{year.label}
																		</SelectItem>
																	))}
																</SelectContent>
															</Select>
															<FormMessage className="text-xs" />
														</FormItem>
													)}
												/>
											</motion.div>
										</>
									)}
								</AnimatePresence>
							</div>
						</div>

						<FormField
							control={form.control}
							name="current"
							render={({field}) => (
								<FormItem className="flex flex-row items-start space-x-3 space-y-0">
									<FormControl>
										<Checkbox
											checked={field.value}
											onCheckedChange={(checked) => {
												field.onChange(checked)
												// Clear end date fields when "currently study here" is checked
												if (checked) {
													form.setValue('finished_at_month', null)
													form.setValue('finished_at_year', null)
												}
											}}
											disabled={isSubmitting}
										/>
									</FormControl>
									<div className="space-y-1 leading-none">
										<FormLabel>
											I currently study here
										</FormLabel>
									</div>
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="description"
							render={({field}) => (
								<FormItem className="mt-4 flex-1">
									<FormLabel className="text-foreground ">Description</FormLabel>
									<FormControl>
										<RichTextEditor
											value={field.value || ''}
											onChange={field.onChange}
											className={isSubmitting ? 'h-60 mt-3 opacity-60 pointer-events-none' : 'h-60 mt-3'}
											placeholder="Describe your academic achievements, relevant coursework, thesis, or any notable projects completed during your studies..."
											editorContentClassName="flex-1 h-[200px] overflow-y-auto"
										/>
									</FormControl>
									<FormMessage className="text-xs" />
								</FormItem>
							)}
						/>

						<ButtonGroup className="justify-end mt-4">
							<Button type="button" variant="outline" onClick={handleCancel} disabled={isSubmitting}>
								Cancel
							</Button>
							<Button type="submit" disabled={isSubmitting}>
								{isSubmitting ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										{editingIndex !== null ? 'Updating...' : 'Adding...'}
									</>
								) : (
									<>{editingIndex !== null ? 'Update Education' : 'Add Education'}</>
								)}
							</Button>
						</ButtonGroup>
					</form>
				</Form>
			</div>
		)
	}

	return (
		<div className={cn('space-y-6', className)}>
			<div ref={headerParent} className="mb-6 flex items-center justify-between">
				<h2 className="text-lg font-medium">Education</h2>
				{isMounted && !isLoading && educations.length > 0 && (
					<Button
						onClick={handleAddNew}
						variant="outline"
						size="sm"
						disabled={isDeleting}
					>
						<Plus className="h-4 w-4 mr-2" />
						Add New Education
					</Button>
				)}
			</div>

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
							<div key={education.id} className="flex items-start justify-between p-4 rounded-lg border bg-card">
								<div className="space-y-1">
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
								</div>
								<div className="flex gap-2">
									<Button
										variant="ghost"
										size="icon"
										onClick={() => handleEdit(index)}
										disabled={isDeleting}
									>
										<span className="sr-only">Edit education</span>
										<Pencil className="h-4 w-4" />
									</Button>
									<PopConfirm
										triggerElement={
											<Button variant="ghost" size="icon" disabled={isDeleting}>
												{isMounted && deletingId === education.id ? (
													<Loader2 className="h-4 w-4 animate-spin" />
												) : (
													<X className="h-4 w-4" />
												)}
												<span className="sr-only">Delete education</span>
											</Button>
										}
										message="Are you sure you want to delete this education?"
										onYes={() => handleDelete(education.id)}
									/>
								</div>
							</div>
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
