'use client'

import {useState} from 'react'
import {cn} from '@/lib/utils'
import {Button} from '@/components/ui/button'
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from '@/components/ui/form'
import {useForm} from 'react-hook-form'
import {zodResolver} from '@hookform/resolvers/zod'
import {months, years} from '@/constants'
import {countries} from '@/lib/constants'
import {Pencil, Plus, X} from 'lucide-react'
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
import {Education, EducationMutation, EducationMutationSchema} from '@/lib/education/types'
import {nanoid} from 'nanoid'
import Image from 'next/image'
import ButtonGroup from '@/components/ui/button-group'

type ViewState = 'list' | 'form'

const EducationEditor = ({className}: {className?: string}) => {
	const [view, setView] = useState<ViewState>('list')
	const [educations, setEducations] = useState<Education[]>([])
	const [parent] = useAutoAnimate()
	const [editingIndex, setEditingIndex] = useState<number | null>(null)
	const [headerParent] = useAutoAnimate()
	const [endDateFieldsParent] = useAutoAnimate()

	const form = useForm<EducationMutation>({
		resolver: zodResolver(EducationMutationSchema),
		defaultValues: {
			institution_name: '',
			country: '',
			field_of_study: '',
			degree: '',
			started_from_month: '',
			started_from_year: '',
			finished_at_month: '',
			finished_at_year: '',
			current: false,
			description: ''
		}
	})

	const onSubmit = (values: EducationMutation) => {
		const newEducation: Education = {
			...values,
			id: nanoid(),
			user: 'user-id',
			resume_section: 'resume-section-id',
			country: {
				code: values.country,
				name: countries.find(c => c.name === values.country)?.name || ''
			},
			started_from_month: values.started_from_month ? parseInt(values.started_from_month) : null,
			started_from_year: values.started_from_year ? parseInt(values.started_from_year) : null,
			finished_at_month: values.finished_at_month ? parseInt(values.finished_at_month) : null,
			finished_at_year: values.finished_at_year ? parseInt(values.finished_at_year) : null,
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString()
		}

		if (editingIndex !== null) {
			setEducations(prev => {
				const updated = [...prev]
				updated[editingIndex] = newEducation
				return updated
			})
			setEditingIndex(null)
		} else {
			setEducations(prev => [...prev, newEducation])
		}

		form.reset()
		setView('list')
	}

	const handleEdit = (index: number) => {
		const education = educations[index]
		form.reset({
			...education,
			country: education.country.code,
			started_from_month: education.started_from_month?.toString(),
			started_from_year: education.started_from_year?.toString(),
			finished_at_month: education.finished_at_month?.toString() || '',
			finished_at_year: education.finished_at_year?.toString() || ''
		})
		setEditingIndex(index)
		setView('form')
	}

	const handleDelete = (index: number) => {
		setEducations(prev => prev.filter((_, i) => i !== index))
		if (editingIndex === index) {
			setEditingIndex(null)
			form.reset()
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
										<Select onValueChange={field.onChange} value={field.value}>
											<FormControl>
												<SelectTrigger className="focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0">
													<SelectValue placeholder="Select country">
														{field.value && (
															<span className="flex items-center">
																<Image src={countries.find(c => c.name === field.value)?.flag || ''} width={64} height={64} alt={`The flag of ${countries.find(c => c.name === field.value)?.name}`} className="mr-2 w-6" />
																{field.value}
															</span>
														)}
													</SelectValue>
												</SelectTrigger>
											</FormControl>
											<SelectContent className="max-h-[300px]">
												{countries.map(country => (
													<SelectItem
														key={country.code}
														value={country.name}
														className="flex items-center"
													>
														<Image src={country.flag} width={64} height={64} alt={`The flag of ${country.name}`} className="mr-2 w-6" />
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
											<Input {...field} value={field.value || ''} placeholder="e.g. Bachelor of Science" className="focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0" />
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
											<Input {...field} placeholder="e.g. Computer Science" className="focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0" />
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
										<Select onValueChange={field.onChange} value={field.value || ''}>
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
										<Select onValueChange={field.onChange} value={field.value || ''}>
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

							<div ref={endDateFieldsParent} className="col-span-2 grid grid-cols-2 gap-4">
								{!form.watch('current') && (
									<>
										<FormField
											control={form.control}
											name="finished_at_month"
											render={({field}) => (
												<FormItem>
													<FormLabel className="text-foreground">End Month</FormLabel>
													<Select onValueChange={field.onChange} value={field.value || ''}>
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
										<FormField
											control={form.control}
											name="finished_at_year"
											render={({field}) => (
												<FormItem>
													<FormLabel className="text-foreground">End Year</FormLabel>
													<Select onValueChange={field.onChange} value={field.value || ''}>
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
									</>
								)}
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
											onCheckedChange={field.onChange}
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
											value={field.value}
											onChange={field.onChange}
											className="h-60 mt-3"
											placeholder="Describe your academic achievements, relevant coursework, thesis, or any notable projects completed during your studies..."
											editorContentClassName="flex-1 h-[200px] overflow-y-auto"
										/>
									</FormControl>
									<FormMessage className="text-xs" />
								</FormItem>
							)}
						/>

						<ButtonGroup className="justify-end">
							<Button type="button" variant="outline" onClick={handleCancel}>
								Cancel
							</Button>
							<Button type="submit">
								{editingIndex !== null ? 'Update Education' : 'Add Education'}
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
				{educations.length > 0 && (
					<Button
						onClick={handleAddNew}
						variant="outline"
						size="sm"
					>
						<Plus className="h-4 w-4 mr-2" />
						Add New Education
					</Button>)}
			</div>

			<div ref={parent} className="space-y-4">
				{educations.map((education, index) => (
					<div key={index} className="flex items-start justify-between p-4 rounded-lg border bg-card">
						<div className="space-y-1">
							<h3 className="font-medium">
								{education.degree} in {education.field_of_study}
							</h3>
							<p className="text-sm text-muted-foreground">
								{[
									education.institution_name,
									education.country?.name
								].filter(Boolean).join(', ')}
							</p>
							<p className="text-sm">
								{[
									education.started_from_month,
									education.started_from_year
								].filter(Boolean).join(', ')} - {' '}
								{education.current ? 'Present' : [
									education.finished_at_month,
									education.finished_at_year
								].filter(Boolean).join(', ')}
							</p>
						</div>
						<div className="flex gap-2">
							<Button
								variant="ghost"
								size="icon"
								onClick={() => handleEdit(index)}
							>
								<span className="sr-only">Edit education</span>
								<Pencil className="h-4 w-4" />
							</Button>
							<PopConfirm
								triggerElement={
									<Button variant="ghost" size="icon">
										<span className="sr-only">Delete education</span>
										<X className="h-4 w-4" />
									</Button>
								}
								message="Are you sure you want to delete this education?"
								onYes={() => handleDelete(index)}
							/>
						</div>
					</div>
				))}
			</div>
			{educations.length === 0 && (
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
	)
}

export default EducationEditor
