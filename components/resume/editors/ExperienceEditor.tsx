'use client'

import {useState} from 'react'
import {cn} from '@/lib/utils'
import {Button} from '@/components/ui/button'
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from '@/components/ui/form'
import {useForm} from 'react-hook-form'
import {zodResolver} from '@hookform/resolvers/zod'
import {months, years} from '@/constants'
import {Pencil, Plus, X} from 'lucide-react'
import {Input} from '@/components/ui/input'
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select'
import RichTextEditor from '@/components/richTextEditor'
import PopConfirm from '@/components/ui/pop-confirm'
import {useAutoAnimate} from '@formkit/auto-animate/react'
import {Checkbox} from '@/components/ui/checkbox'
import {countries} from '@/lib/constants'
import {employmentTypes, Experience, ExperienceMutation, ExperienceMutationSchema} from '@/lib/experience/types'
import {nanoid} from 'nanoid'
import {Separator} from '@/components/ui/separator'
import Image from 'next/image'

type ViewState = 'list' | 'form'

const ExperienceEditor = ({className}: {className?: string}) => {
	const [view, setView] = useState<ViewState>('list')
	const [experiences, setExperiences] = useState<Experience[]>([])
	const [parent] = useAutoAnimate()
	const [editingIndex, setEditingIndex] = useState<number | null>(null)
	const [headerParent] = useAutoAnimate()
	const [endDateFieldsParent] = useAutoAnimate()

	const form = useForm<ExperienceMutation>({
		resolver: zodResolver(ExperienceMutationSchema),
		defaultValues: {
			company_name: '',
			job_title: '',
			employment_type: employmentTypes[0].value,
			city: '',
			country: '',
			started_from_month: '',
			started_from_year: '',
			finished_at_month: '',
			finished_at_year: '',
			current: false,
			description: ''
		}
	})

	const onSubmit = (values: ExperienceMutation) => {
		const newExperience: Experience = {
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
			setExperiences(prev => {
				const updated = [...prev]
				updated[editingIndex] = newExperience
				return updated
			})
			setEditingIndex(null)
		} else {
			setExperiences(prev => [...prev, newExperience])
		}

		form.reset()
		setView('list')
	}

	const handleEdit = (index: number) => {
		const experience = experiences[index]
		form.reset({
			...experience,
			country: experience.country.code,
			employment_type: employmentTypes.find(type => type.value === experience.employment_type)?.value,
			started_from_month: experience.started_from_month?.toString(),
			started_from_year: experience.started_from_year?.toString(),
			finished_at_month: experience.finished_at_month?.toString() || '',
			finished_at_year: experience.finished_at_year?.toString() || ''
		})
		setEditingIndex(index)
		setView('form')
	}

	const handleDelete = (index: number) => {
		setExperiences(prev => prev.filter((_, i) => i !== index))
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
				<div className="mb-6 flex items-center justify-between">
					<h2 className="text-lg font-medium min-w-[16rem]">
						{editingIndex !== null ? 'Update Experience' : 'Add New Experience'}
					</h2>
				</div>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<div className="grid grid-cols-2 gap-4">
							<FormField
								control={form.control}
								name="company_name"
								render={({field}) => (
									<FormItem>
										<FormLabel className="text-foreground">Company Name</FormLabel>
										<FormControl>
											<Input
												{...field}
												placeholder="e.g. Google"
												className="focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0"
											/>
										</FormControl>
										<FormMessage className="text-xs" />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="job_title"
								render={({field}) => (
									<FormItem>
										<FormLabel className="text-foreground">Job Title</FormLabel>
										<FormControl>
											<Input
												{...field}
												placeholder="e.g. Software Engineer"
												className="focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0"
											/>
										</FormControl>
										<FormMessage className="text-xs" />
									</FormItem>
								)}
							/>
						</div>

						<div className="grid grid-cols-3 gap-4">
							<FormField
								control={form.control}
								name="employment_type"
								render={({field}) => (
									<FormItem>
										<FormLabel className="text-foreground">Employment Type</FormLabel>
										<Select onValueChange={field.onChange} value={field.value}>
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
							<FormField
								control={form.control}
								name="city"
								render={({field}) => (
									<FormItem>
										<FormLabel className="text-foreground">City</FormLabel>
										<FormControl>
											<Input {...field} value={field.value || ''} placeholder="e.g. San Francisco" className="focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0" />
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
													<SelectValue placeholder="Choose month" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{months.map(month => (
													<SelectItem key={month.value} value={month.value || ''}>
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
													<SelectValue placeholder="Choose year" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{years.map(year => (
													<SelectItem key={year.value} value={year.value || ''}>
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
																<SelectValue placeholder="Choose month" />
															</SelectTrigger>
														</FormControl>
														<SelectContent>
															{months.map(month => (
																<SelectItem key={month.value} value={month.value || ''}>
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
																<SelectValue placeholder="Choose year" />
															</SelectTrigger>
														</FormControl>
														<SelectContent>
															{years.map(year => (
																<SelectItem key={year.value} value={year.value || ''}>
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
											I currently work here
										</FormLabel>
									</div>
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="description"
							render={({field}) => (
								<FormItem className="flex-1">
									<FormLabel className="text-foreground">Description</FormLabel>
									<FormControl>
										<RichTextEditor
											value={field.value}
											onChange={field.onChange}
											className="h-60 mt-3"
											placeholder="Describe your role, responsibilities, and key achievements..."
											editorContentClassName="flex-1 h-[200px] overflow-y-auto"
										/>
									</FormControl>
									<FormMessage className="text-xs" />
								</FormItem>
							)}
						/>

						<div className="flex gap-4 justify-end">
							<Button type="button" variant="outline" size="sm" onClick={handleCancel}>
								Cancel
							</Button>
							<Button type="submit" size="sm">
								{editingIndex !== null ? 'Update Experience' : 'Add Experience'}
							</Button>
						</div>
					</form>
				</Form>
			</div>
		)
	}

	return (
		<div className={cn('space-y-6', className)}>
			<div ref={headerParent} className="mb-6 flex items-center justify-between">
				<h2 className="text-lg font-medium">Experience</h2>
				{experiences.length > 0 && (
					<Button
						onClick={handleAddNew}
						variant="outline"
						size="sm"
					>
						<Plus className="h-4 w-4 mr-2" />
						Add New Experience
					</Button>
				)}
			</div>

			<div ref={parent} className="space-y-4">
				{experiences.map((experience, index) => (
					<div key={index} className="flex items-start justify-between p-4 rounded-lg border bg-card">
						<div className="space-y-1">
							<h3 className="font-medium">{experience.job_title}</h3>
							<p className="text-sm text-muted-foreground">
								{experience.company_name} • {employmentTypes.find(type => type.value === experience.employment_type)?.label}
							</p>
							<div className="flex justify-between items-center">
								<p className="text-sm text-muted-foreground">
									{[
										experience.city,
										experience.country?.name
									].filter(Boolean).join(', ')}
								</p>
								<Separator orientation="vertical" className="mx-2 h-4" />
								<p className="text-sm">
									{[
										experience.started_from_month,
										experience.started_from_year
									].filter(Boolean).join(', ')} - {' '}
									{experience.current ? 'Present' : [
										experience.finished_at_month,
										experience.finished_at_year
									].filter(Boolean).join(', ')}
								</p>
							</div>
						</div>
						<div className="flex gap-2">
							<Button
								variant="ghost"
								size="icon"
								onClick={() => handleEdit(index)}
							>
								<span className="sr-only">Edit experience</span>
								<Pencil className="h-4 w-4"/>
							</Button>
							<PopConfirm
								triggerElement={
									<Button variant="ghost" size="icon">
										<span className="sr-only">Delete experience</span>
										<X className="h-4 w-4"/>
									</Button>
								}
								message="Are you sure you want to delete this experience?"
								onYes={() => handleDelete(index)}
							/>
						</div>
					</div>
				))}
			</div>
			{experiences.length === 0 && (
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
	)
}

export default ExperienceEditor
