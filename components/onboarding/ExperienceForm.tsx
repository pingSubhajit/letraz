'use client'

import {motion} from 'motion/react'
import {z} from 'zod'
import {Link, useTransitionRouter} from 'next-view-transitions'
import {useForm} from 'react-hook-form'
import {zodResolver} from '@hookform/resolvers/zod'
import {cn} from '@/lib/utils'
import {Form, FormField, FormItem, FormLabel, FormMessage} from '@/components/ui/form'
import {
	OnboardingFormInput,
	OnboardingFormSelect,
	OnboardingRichTextInput
} from '@/components/onboarding/OnboardingFormInput'
import {Button} from '@/components/ui/button'
import {ChevronLeft, ChevronRight, Loader2} from 'lucide-react'
import {months, years} from '@/constants'
import {toast} from 'sonner'
import {employmentTypes, Experience, ExperienceMutation, ExperienceMutationSchema} from '@/lib/experience/types'
import {JSX} from 'react'
import {useUpdateUserExperienceMutation} from '@/features/user/user-experience/mutations'
import {countries} from '@/lib/constants'
import {useQueryClient} from '@tanstack/react-query'
import {experienceQueryOptions} from '@/lib/experience/queries'

// Define the props for the ExperienceForm component
type ExperienceFormProps = {
	className?: string,
}

/**
 * ExperienceForm component handles the form for adding employment details.
 *
 * @param {ExperienceFormProps} props - The properties object.
 * @param {string} [props.className] - Additional class names for styling.
 * @param {Experience[]} props.experiences - The list of current experience entries.
 * @param {function} props.setExperiences - Function to update the list of experiences entries.
 * @returns {JSX.Element} The JSX code to render the experience form.
 */
const ExperienceForm = ({className}: ExperienceFormProps): JSX.Element => {
	const router = useTransitionRouter()

	const queryClient = useQueryClient()


	const {mutateAsync, isPending} = useUpdateUserExperienceMutation({
		onMutate: async (newExperience) => {
			await queryClient.cancelQueries(experienceQueryOptions)
			const prevExperiences = queryClient.getQueryData(experienceQueryOptions.queryKey)
			// TODO remove this any
			queryClient.setQueryData(experienceQueryOptions.queryKey, (oldData:any) => [...oldData, newExperience])
			return {prevExperiences}
		},
		onSuccess: () => {
			toast.success('Experience added')
			queryClient.invalidateQueries(experienceQueryOptions)
		},
		// TODO remove this any the
		onError: (err, newExperience, context:any) => {
			queryClient.setQueryData(experienceQueryOptions.queryKey, context?.prevExperiences)

			throw Error('Failed to add experience')
		},
		onSettled: () => {
			queryClient.invalidateQueries(experienceQueryOptions)
		}
	})

	// Initialize the form with default values and validation schema
	const form = useForm<ExperienceMutation>({
		resolver: zodResolver(ExperienceMutationSchema),
		defaultValues: {
			company_name: '',
			country: 'IND',
			job_title: '',
			city: '',
			employment_type: employmentTypes[0].value,
			started_from_month: null,
			started_from_year: null,
			finished_at_month: null,
			finished_at_year: null,
			current: false,
			description: ''
		}
	})

	/**
	 * Function to insert experience details into the database.
	 *
	 * @param {ExperienceMutation} values - The form values.
	 * @returns {Promise<Experience>} The newly added experience entry.
	 */
	const insertExperience = async (values: ExperienceMutation): Promise<Experience> => {
		const params = ExperienceMutationSchema.parse(values)
		return mutateAsync(params)
	}

	/**
	 * Function to handle form submission.
	 * @param {z.infer<typeof ExperienceMutationSchema>} values - The form values.
	 */
	const onSubmit = async (values: z.infer<typeof ExperienceMutationSchema>) => {
		try {
			const newExperience = await insertExperience(values)
			if (newExperience){
				form.reset()
			} else {
				throw new Error('Failed to add experience')
			}
		} catch (error) {
			toast.error(error instanceof Error ? error.message : 'Failed to update experience, please try again')
		}
	}

	/**
	 * Function to handle form submission with redirect to next step.
	 * @param {z.infer<typeof ExperienceMutationSchema>} values - The form values.
	 */
	const submitWithRedirect = async (values: z.infer<typeof ExperienceMutationSchema>) => {
		try {
			if (form.formState.isDirty) {
				await insertExperience(values)
			}

			// router.push('/app/onboarding?step=resume')
		} catch (error) {
			toast.error('Failed to update experience, please try again')
		}
	}

	return (
		<div className={cn('max-w-2xl flex flex-col', className)}
		>
			{/* Informational message about the benefits of adding employment details */}
			<motion.div
				className="text-xl mt-8 max-w-xl"
				initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}} transition={{delay: 0.2, duration: 0.7}}
			>
				<p>Mentioning your past employment details can increase the chance of your résumé getting selected upto 75%</p>
			</motion.div>

			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="mt-12 space-y-8">
					{/* Form fields for company name and country */}
					<motion.div
						initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}}
						transition={{delay: 0.4, duration: 0.7}}
						className="flex items-center gap-8 justify-between w-full"
					>
						<FormField
							disabled={isPending}
							control={form.control}
							name="company_name"
							render={({field}) => (
								<FormItem className="w-[95%]">
									<OnboardingFormInput placeholder="company" {...field} autoFocus/>
									<FormLabel className="transition">Name of the company</FormLabel>
									<FormMessage/>
								</FormItem>
							)}
						/>

						<FormField
							disabled={isPending}
							control={form.control}
							name="country"
							render={({field}) => (
								<FormItem className="w-full">
									<OnboardingFormSelect
										onChange={field.onChange}
										value={field.value || ''}
										options={countries.map(country => ({
											value: country.code,
											label: country.name, image:
											country.flag
										}))}
										placeholder="Country"
										className="text-3xl"
									/>
									<FormLabel className="transition">
										Country of workplace
									</FormLabel>
									<FormMessage />
								</FormItem>
							)}
						/>
					</motion.div>

					{/* Form fields for job title and city */}
					<motion.div
						initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}}
						transition={{delay: 0.4, duration: 0.7}}
						className="flex items-center gap-8 justify-between"
					>
						<FormField
							disabled={isPending}
							control={form.control}
							name="job_title"
							render={({field}) => (
								<FormItem className="w-[95%]">
									<OnboardingFormInput placeholder="job title" {...field} />
									<FormLabel className="transition">Designation or job title</FormLabel>
									<FormMessage/>
								</FormItem>
							)}
						/>

						<FormField
							disabled={isPending}
							control={form.control}
							name="city"
							render={({field}) => (
								<FormItem>
									<OnboardingFormInput placeholder="city" {...field} value={field.value || ''} />
									<FormLabel className="transition">City of work</FormLabel>
									<FormMessage/>
								</FormItem>
							)}
						/>
					</motion.div>

					{/* Form fields for start and end dates */}
					<motion.div
						initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}}
						transition={{delay: 0.4, duration: 0.7}}
						className="flex items-center gap-8 justify-between"
					>
						{/* Form field for start month */}
						<FormField
							disabled={isPending}
							control={form.control}
							name="started_from_month"
							render={({field}) => (
								<FormItem className="w-full">
									<OnboardingFormSelect
										onChange={field.onChange}
										value={field.value || ''}
										options={months}
										placeholder="Start month"
									/>
									<FormLabel className="transition">Month of starting</FormLabel>
									<FormMessage/>
								</FormItem>
							)}
						/>

						{/* Form field for start year */}
						<FormField
							disabled={isPending}
							control={form.control}
							name="started_from_year"
							render={({field}) => (
								<FormItem className="w-full">
									<OnboardingFormSelect
										onChange={field.onChange}
										value={field.value || ''}
										options={years}
										placeholder="Start year"
									/>
									<FormLabel className="transition">Year of starting</FormLabel>
									<FormMessage/>
								</FormItem>
							)}
						/>

						{/* Form field for end month */}
						<FormField
							disabled={isPending}
							control={form.control}
							name="finished_at_month"
							render={({field}) => (
								<FormItem className="w-full">
									<OnboardingFormSelect
										onChange={field.onChange}
										value={field.value || ''}
										options={months}
										placeholder="End month"
									/>
									<FormLabel className="transition">Month of end</FormLabel>
									<FormMessage/>
								</FormItem>
							)}
						/>

						{/* Form field for end year */}
						<FormField
							disabled={isPending}
							control={form.control}
							name="finished_at_year"
							render={({field}) => (
								<FormItem className="w-full">
									<OnboardingFormSelect
										onChange={field.onChange}
										value={field.value || ''}
										options={years}
										placeholder="End year"
									/>
									<FormLabel className="transition">Year of end</FormLabel>
									<FormMessage/>
								</FormItem>
							)}
						/>
					</motion.div>

					{/* Form field for description */}
					<motion.div
						initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}}
						transition={{delay: 0.4, duration: 0.7}}
						className="flex items-center gap-8 justify-between" >
						<FormField
							disabled={isPending}
							control={form.control}
							name="description"
							render={({field}) => (
								<FormItem className="w-full">
									<OnboardingRichTextInput placeholder="write a few things about what you learnt, the things you've build etc."
										value={field?.value || ''}
										onChange={field?.onChange}
									/>
									<FormLabel className="transition">Description (optional)</FormLabel>
									<FormMessage/>
								</FormItem>
							)}
						/>
					</motion.div>

					{/* Navigation buttons */}
					<div
						className="w-[calc(100%-4.7rem)] flex items-center justify-between fixed left-[4.7rem] z-10 bottom-16 px-16"

					>
						{/* Button to navigate to the previous step */}
						<Link href={'/app/onboarding?step=education'}>
							<Button
								disabled={isPending}

								className="transition rounded-full shadow-lg hover:shadow-xl px-6"
								variant="secondary"
								type="button"
							>
								<ChevronLeft className="w-5 h-5 mr-1"/>
								Education
							</Button>
						</Link>

						{/* Buttons to add another experience or proceed to the next step */}
						<div className="flex items-center gap-4">
							<Button
								className="transition rounded-full shadow-lg px-6 hover:shadow-xl"
								variant="secondary"
								type="submit"
								disabled={ isPending || form.formState.isSubmitting || !form.formState.isDirty}
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
								disabled={form.formState.isSubmitting}
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
