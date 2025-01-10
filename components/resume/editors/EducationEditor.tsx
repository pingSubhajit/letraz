'use client'

import {useState} from 'react'
import {z} from 'zod'
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

const EducationEditor = ({className}: {className?: string}) => {
	const [educations, setEducations] = useState<Education[]>([])
	const [parent] = useAutoAnimate()
	const [editingIndex, setEditingIndex] = useState<number | null>(null)

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
		form.reset()
	}

	const handleEdit = (index: number) => {
		const education = educations[index]
		form.reset(education)
		setEditingIndex(index)
	}

	const handleDelete = (index: number) => {
		setEducations(prev => prev.filter((_, i) => i !== index))
		if (editingIndex === index) {
			setEditingIndex(null)
			form.reset()
		}
	}

	return (
		<div className={cn('space-y-6', className)}>
			{/* Education List */}
			<div ref={parent} className="space-y-4">
				{educations.map((education, index) => (
					<div key={index} className="flex items-start justify-between p-4 rounded-lg border bg-card">
						<div className="space-y-1">
							<h3 className="font-medium">
								{education.degree} in {education.fieldOfStudy}
							</h3>
							<p className="text-sm text-muted-foreground">
								{education.institutionName}, {education.country}
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

			{/* Education Form */}
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
					<div className="grid grid-cols-2 gap-4">
						<FormField
							control={form.control}
							name="institutionName"
							render={({field}) => (
								<FormItem>
									<FormLabel>Institution Name</FormLabel>
									<FormControl>
										<Input {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="country"
							render={({field}) => (
								<FormItem>
									<FormLabel>Country</FormLabel>
									<FormControl>
										<Input {...field} />
									</FormControl>
									<FormMessage />
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
									<FormLabel>Degree</FormLabel>
									<FormControl>
										<Input {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="fieldOfStudy"
							render={({field}) => (
								<FormItem>
									<FormLabel>Field of Study</FormLabel>
									<FormControl>
										<Input {...field} />
									</FormControl>
									<FormMessage />
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
									<FormLabel>Start Month</FormLabel>
									<Select onValueChange={field.onChange} value={field.value}>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder="Select month" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{months.map(month => (
												<SelectItem key={month} value={month}>
													{month}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="startedFromYear"
							render={({field}) => (
								<FormItem>
									<FormLabel>Start Year</FormLabel>
									<Select onValueChange={field.onChange} value={field.value}>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder="Select year" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{years.map(year => (
												<SelectItem key={year} value={year}>
													{year}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="finishedAtMonth"
							render={({field}) => (
								<FormItem>
									<FormLabel>End Month</FormLabel>
									<Select onValueChange={field.onChange} value={field.value}>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder="Select month" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{months.map(month => (
												<SelectItem key={month} value={month}>
													{month}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="finishedAtYear"
							render={({field}) => (
								<FormItem>
									<FormLabel>End Year</FormLabel>
									<Select onValueChange={field.onChange} value={field.value}>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder="Select year" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{years.map(year => (
												<SelectItem key={year} value={year}>
													{year}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>

					<FormField
						control={form.control}
						name="description"
						render={({field}) => (
							<FormItem className="flex-1">
								<FormLabel>Description</FormLabel>
								<FormControl>
									<RichTextEditor
										value={field.value}
										onChange={field.onChange}
										className="min-h-[200px]"
										editorContentClassName="flex-1 h-[200px] overflow-y-auto"
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<Button type="submit" className="w-full">
						{editingIndex !== null ? 'Update Education' : 'Add Education'}
					</Button>
				</form>
			</Form>
		</div>
	)
}

export default EducationEditor
