'use client'

import {useState} from 'react'
import {z} from 'zod'
import {cn} from '@/lib/utils'
import {Button} from '@/components/ui/button'
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from '@/components/ui/form'
import {useForm} from 'react-hook-form'
import {zodResolver} from '@hookform/resolvers/zod'
import {months, years} from '@/constants'
import {countries} from '@/lib/constants'
import {Pencil, Plus, X} from 'lucide-react'
import {Input} from '@/components/ui/input'
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select'
import RichTextEditor from '@/components/richTextEditor'
import PopConfirm from '@/components/ui/pop-confirm'
import {useAutoAnimate} from '@formkit/auto-animate/react'
import {Checkbox} from '@/components/ui/checkbox'

const educationFormSchema = z.object({
	institutionName: z.string().min(1, 'Institution name is required'),
	country: z.string().min(1, 'Country is required'),
	fieldOfStudy: z.string().min(1, 'Field of study is required'),
	degree: z.string().min(1, 'Degree is required'),
	startedFromMonth: z.string().min(1, 'Start month is required'),
	startedFromYear: z.string().min(1, 'Start year is required'),
	finishedAtMonth: z.string().optional(),
	finishedAtYear: z.string().optional(),
	current: z.boolean().default(false),
	description: z.string().optional()
})

type Education = z.infer<typeof educationFormSchema>

type ViewState = 'list' | 'form'

const EducationEditor = ({className}: {className?: string}) => {
	const [view, setView] = useState<ViewState>('list')
	const [educations, setEducations] = useState<Education[]>([])
	const [parent] = useAutoAnimate()
	const [editingIndex, setEditingIndex] = useState<number | null>(null)
	const [headerParent] = useAutoAnimate()
	const [endDateFieldsParent] = useAutoAnimate()

	const form = useForm<Education>({
		resolver: zodResolver(educationFormSchema),
		defaultValues: {
			institutionName: '',
			country: '',
			fieldOfStudy: '',
			degree: '',
			startedFromMonth: '',
			startedFromYear: '',
			finishedAtMonth: '',
			finishedAtYear: '',
			current: false,
			description: ''
		}
	})

	const onSubmit = (values: Education) => {
		if (editingIndex !== null) {
			setEducations(prev => {
				const updated = [...prev]
				updated[editingIndex] = values
				return updated
			})
			setEditingIndex(null)
		} else {
			setEducations(prev => [...prev, values])
		}

		form.reset({
			institutionName: '',
			country: '',
			fieldOfStudy: '',
			degree: '',
			startedFromMonth: '',
			startedFromYear: '',
			finishedAtMonth: '',
			finishedAtYear: '',
			current: false,
			description: ''
		})
		setView('list')
	}

	const handleEdit = (index: number) => {
		const education = educations[index]
		form.reset(education)
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
				<div ref={headerParent} className="mb-6 flex items-center justify-between">
					<h2 className="text-lg font-medium min-w-[16rem]">
						{editingIndex !== null ? 'Update Education' : 'Add New Education'}
					</h2>
				</div>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<div className="grid grid-cols-2 gap-4">
							<FormField
								control={form.control}
								name="institutionName"
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
																<span className="mr-2">{countries.find(c => c.name === field.value)?.flag}</span>
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
														<span className="mr-2">{country.flag || '🏳️'}</span>
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
											<Input {...field} placeholder="e.g. Bachelor of Science" className="focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0" />
										</FormControl>
										<FormMessage className="text-xs" />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="fieldOfStudy"
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
								name="startedFromMonth"
								render={({field}) => (
									<FormItem>
										<FormLabel className="text-foreground">Start Month</FormLabel>
										<Select onValueChange={field.onChange} value={field.value}>
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
								name="startedFromYear"
								render={({field}) => (
									<FormItem>
										<FormLabel className="text-foreground">Start Year</FormLabel>
										<Select onValueChange={field.onChange} value={field.value}>
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
											name="finishedAtMonth"
											render={({field}) => (
												<FormItem>
													<FormLabel className="text-foreground">End Month</FormLabel>
													<Select onValueChange={field.onChange} value={field.value}>
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
											name="finishedAtYear"
											render={({field}) => (
												<FormItem>
													<FormLabel className="text-foreground">End Year</FormLabel>
													<Select onValueChange={field.onChange} value={field.value}>
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
								<FormItem className="flex-1">
									<FormLabel className="text-foreground ">Description</FormLabel>
									<FormControl>
										<RichTextEditor
											value={field.value}
											onChange={field.onChange}
											className="h-60 mt-3 "
											placeholder="Describe your academic achievements, relevant coursework, thesis, or any notable projects completed during your studies..."
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
								{editingIndex !== null ? 'Update Education' : 'Add Education'}
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
								{education.degree} in {education.fieldOfStudy}
							</h3>
							<p className="text-sm text-muted-foreground">
								{education.institutionName}
								{education.country && (
									<span className="inline-flex items-center gap-1">
										{', '}
										{countries.find(c => c.name === education.country)?.flag}
										{education.country}
									</span>
								)}
							</p>
							<p className="text-sm">
								{education.startedFromMonth} {education.startedFromYear} -{' '}
								{education.current ? 'Present' : `${education.finishedAtMonth} ${education.finishedAtYear}`}
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
