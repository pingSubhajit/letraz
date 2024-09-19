'use client'

import {motion} from 'framer-motion'
import {z} from 'zod'
import {Link, useTransitionRouter} from 'next-view-transitions'
import {useForm} from 'react-hook-form'
import {zodResolver} from '@hookform/resolvers/zod'
import {cn} from '@/lib/utils'
import {Form, FormField, FormItem, FormLabel, FormMessage} from '@/components/ui/form'
import {
	OnboardingFormInput,
	OnboardingFormSelect,
	OnboardingFormTextArea
} from '@/components/onboarding/OnboardingFormInput'
import {Button} from '@/components/ui/button'
import {ChevronLeft, ChevronRight, Loader2} from 'lucide-react'
import {months, years} from '@/constants'

export const experienceFormSchema = z.object({
	companyName: z.string().max(100, {message: 'That\'s a long name! We can\'t handle that'}).optional(),
	country: z.string().optional(),
	jobTitle: z.string().optional(),
	city: z.string().optional(),
	startedFromMonth: z.string().optional(),
	startedFromYear: z.string().optional(),
	finishedAtMonth: z.string().optional(),
	finishedAtYear: z.string().optional(),
	current: z.boolean().optional(),
	description: z.string().optional()
})

type ExperienceFormProps = {
	className?: string,
	experiences: z.infer<typeof experienceFormSchema>[],
	setExperiences: (educations: z.infer<typeof experienceFormSchema>[]) => void
}

const ExperienceForm = ({className, experiences, setExperiences}: ExperienceFormProps) => {
	const router = useTransitionRouter()

	const form = useForm<z.infer<typeof experienceFormSchema>>({
		resolver: zodResolver(experienceFormSchema),
		defaultValues: {
			companyName: '',
			country: '',
			jobTitle: '',
			city: '',
			startedFromMonth: '',
			startedFromYear: '',
			finishedAtMonth: '',
			finishedAtYear: '',
			current: false,
			description: ''
		},
	})

	function onSubmit(values: z.infer<typeof experienceFormSchema>) {
		setExperiences([...experiences, values])
		form.reset()
	}

	function submitWithRedirect(values: z.infer<typeof experienceFormSchema>) {
		router.push('/app/onboarding?step=resume')
	}

	return (
		<div className={cn('max-w-2xl flex flex-col', className)}>
			<motion.div
				className="text-xl mt-8 max-w-xl"
				initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}} transition={{delay: 0.2, duration: 0.7}}
			>
				<p>Having 2 or more educational details can increase the chance of your résumé getting selected upto 15%</p>
			</motion.div>

			<Form {...form}>
				<form
					onSubmit={form.handleSubmit(onSubmit)}
					className="mt-12"
				>
					<motion.div
						initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}}
						transition={{delay: 0.4, duration: 0.7}}
						className="flex items-center gap-8 justify-between w-full"
					>
						<FormField
							control={form.control}
							name="companyName"
							render={({field}) => (
								<FormItem className="w-[95%]">
									<OnboardingFormInput placeholder="company" {...field} autoFocus/>
									<FormLabel className="transition">Name of the company</FormLabel>
									<FormMessage/>
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="country"
							render={({field}) => (
								<FormItem>
									<OnboardingFormInput placeholder="country" {...field} />
									<FormLabel className="transition">Country</FormLabel>
									<FormMessage/>
								</FormItem>
							)}
						/>
					</motion.div>

					<motion.div
						initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}}
						transition={{delay: 0.4, duration: 0.7}}
						className="flex items-center gap-8 justify-between my-8"
					>
						<FormField
							control={form.control}
							name="jobTitle"
							render={({field}) => (
								<FormItem className="w-[95%]">
									<OnboardingFormInput placeholder="job title" {...field} />
									<FormLabel className="transition">Designation or job title</FormLabel>
									<FormMessage/>
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="city"
							render={({field}) => (
								<FormItem>
									<OnboardingFormInput placeholder="city" {...field} />
									<FormLabel className="transition">City of work</FormLabel>
									<FormMessage/>
								</FormItem>
							)}
						/>
					</motion.div>

					<motion.div
						initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}}
						transition={{delay: 0.4, duration: 0.7}}
						className="flex items-center gap-8 justify-between my-6"
					>
						<FormField
							control={form.control}
							name="startedFromMonth"
							render={({field}) => (
								<FormItem className="w-full">
									<OnboardingFormSelect
										onChange={field.onChange}
										value={field.value}
										options={months}
										placeholder="Start month"
									/>
									<FormLabel className="transition">Month of starting</FormLabel>
									<FormMessage/>
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="startedFromYear"
							render={({field}) => (
								<FormItem className="w-full">
									<OnboardingFormSelect
										onChange={field.onChange}
										value={field.value}
										options={years}
										placeholder="Start year"
									/>
									<FormLabel className="transition">Year of starting</FormLabel>
									<FormMessage/>
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="finishedAtMonth"
							render={({field}) => (
								<FormItem className="w-full">
									<OnboardingFormSelect
										onChange={field.onChange}
										value={field.value}
										options={months}
										placeholder="End month"
									/>
									<FormLabel className="transition">Month of end</FormLabel>
									<FormMessage/>
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="finishedAtYear"
							render={({field}) => (
								<FormItem className="w-full">
									<OnboardingFormSelect
										onChange={field.onChange}
										value={field.value}
										options={years}
										placeholder="End year"
									/>
									<FormLabel className="transition">Year of end</FormLabel>
									<FormMessage/>
								</FormItem>
							)}
						/>
					</motion.div>

					<motion.div
						initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}}
						transition={{delay: 0.4, duration: 0.7}}
						className="flex items-center gap-8 justify-between"
					>
						<FormField
							control={form.control}
							name="description"
							render={({field}) => (
								<FormItem className="w-full">
									<OnboardingFormTextArea
										placeholder="write a fiew things about what you did, the skills you've gained etc."
										{...field}
									/>
									<FormLabel className="transition">Description (optional)</FormLabel>
									<FormMessage/>
								</FormItem>
							)}
						/>
					</motion.div>

					<div
						className="w-full flex items-center justify-between absolute left-1/2 -translate-x-1/2
						bottom-16 px-16"
					>
						{/* PREVIOUS STEP BUTTON */}
						<Link href={'/app/onboarding?step=education'}>
							<Button
								className="transition rounded-full shadow-lg hover:shadow-xl px-6"
								variant="secondary"
								type="button"
							>
								<ChevronLeft className="w-5 h-5 mr-1"/>
								Educations
							</Button>
						</Link>

						{/* NEXT STEP BUTTONS */}
						<div className="flex items-center gap-4">
							<Button
								className="transition rounded-full shadow-lg px-6 hover:shadow-xl"
								variant="secondary"
								type="submit"
								disabled={form.formState.isSubmitting || !form.formState.isDirty}
							>
								Add another
								{form.formState.isSubmitting
									? <Loader2 className="w-4 h-4 ml-1 animate-spin"/>
									: <ChevronRight className="w-5 h-5 ml-1"/>
								}
							</Button>

							<Button
								className="transition rounded-full shadow-lg px-6 hover:shadow-xl"
								variant="secondary"
								type="button"
								onClick={form.handleSubmit(submitWithRedirect)}
							>
								Create my base résumé
								{form.formState.isSubmitting
									? <Loader2 className="w-4 h-4 ml-1 animate-spin"/>
									: <ChevronRight className="w-5 h-5 ml-1"/>
								}
							</Button>
						</div>
					</div>
				</form>
			</Form>
		</div>
	)
}

export default ExperienceForm
