'use client'

import {AnimatePresence, motion} from 'motion/react'
import {Link, useTransitionRouter} from 'next-view-transitions'
import {useForm} from 'react-hook-form'
import {zodResolver} from '@hookform/resolvers/zod'
import {cn} from '@/lib/utils'
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from '@/components/ui/form'
import {
	OnboardingFormInput,
	OnboardingFormSelect,
	OnboardingRichTextInput
} from '@/components/onboarding/OnboardingFormInput'
import {Button} from '@/components/ui/button'
import {Checkbox} from '@/components/ui/checkbox'
import {ChevronLeft, ChevronRight, Loader2} from 'lucide-react'
import {months, years} from '@/constants'
import {toast} from 'sonner'
import {Education, EducationMutation, EducationMutationSchema} from '@/lib/education/types'
import {JSX, useEffect, useState} from 'react'

import {countries} from '@/lib/constants'
import {useQueryClient} from '@tanstack/react-query'

import {educationOptions} from '@/lib/education/queries'
import {useAddEducationMutation} from '@/lib/education/mutations'
import {updateOnboardingStep} from '@/lib/onboarding/actions'

// Define the props for the EducationForm component
type EducationFormProps = {
	className?: string
}

/**
 * EducationForm component handles the form for adding educational details.
 *
 * @param {EducationFormProps} props - The properties object.
 * @param {string} [props.className] - Additional class names for styling.
 * @param {Education[]} props.educations - The list of current education entries.
 * @param {function} props.setEducations - Function to update the list of education entries.
 * @returns {JSX.Element} The JSX code to render the education form.
 */
const EducationForm = ({
	className
}: EducationFormProps): JSX.Element => {
	const router = useTransitionRouter()

	const queryClient = useQueryClient()
	const [formKey, setFormKey] = useState(0)
	const [isCurrentLocal, setIsCurrentLocal] = useState(false)
	const [userCountry, setUserCountry] = useState('IND')

	// Get user's country from IP
	useEffect(() => {
		fetch('https://ipapi.co/json/')
			.then(res => res.json())
			.then(data => {
				if (data.country_code_iso3) {
					setUserCountry(data.country_code_iso3)
				}
			})
			.catch(() => {
				// Fallback to India if detection fails
				setUserCountry('IND')
			})
	}, [])


	// Fixing the mutation options
	const {mutateAsync, isPending} = useAddEducationMutation({
		onMutate: async (newEducation) => {
			await queryClient.cancelQueries(educationOptions())
			const prevEducations = queryClient.getQueryData(educationOptions().queryKey)
			// TODO remove this any
			queryClient.setQueryData(educationOptions().queryKey, (oldData:any) => [...oldData, newEducation])
			return {prevEducations}
		},
		// TODO remove this any the
		onError: (err, newEducation, context:any) => {
			queryClient.setQueryData(educationOptions().queryKey, context?.prevEducations)

			throw Error('Failed to add education')
		},
		onSettled: () => {
			queryClient.invalidateQueries(educationOptions())
		}
	})


	// Initialize the form with default values and validation schema
	const form = useForm<EducationMutation>({
		resolver: zodResolver(EducationMutationSchema),
		defaultValues: {
			institution_name: '',
			country: userCountry,
			field_of_study: '',
			degree: '',
			started_from_month: undefined,
			started_from_year: undefined,
			finished_at_month: undefined,
			finished_at_year: undefined,
			current: false,
			description: ''
		}
	})

	// Watch the current field and keep local state in sync
	const isCurrent = form.watch('current')

	useEffect(() => {
		setIsCurrentLocal(isCurrent)
	}, [isCurrent])

	// Update form country when userCountry changes
	useEffect(() => {
		if (userCountry) {
			form.setValue('country', userCountry)
		}
	}, [userCountry, form])

	// Clear end date fields when "current" is checked
	useEffect(() => {
		if (isCurrentLocal) {
			form.setValue('finished_at_month', undefined)
			form.setValue('finished_at_year', undefined)
		}
	}, [isCurrentLocal, form])

	// Handle checkbox change
	const handleCurrentChange = (checked: boolean) => {
		setIsCurrentLocal(checked)
		form.setValue('current', checked, {
			shouldValidate: true,
			shouldDirty: true,
			shouldTouch: true
		})
	}

	/**
	 * Function to insert education details into the database.
	 *
	 * @param {EducationMutation} values - The form values.
	 * @returns {Promise<Education|undefined>} The newly added education entry.
	 */
	const insertEducation = async (values: EducationMutation): Promise<Education|undefined> => {
		return await mutateAsync({data: values})
	}

	/**
	 * Function to handle form submission.
	 * @param {EducationMutation} values - The form values.
	 */
	const onSubmit = async (values: EducationMutation) => {
		try {
			const newEducation = await insertEducation(values)
			if (newEducation) {
				// setEducations([...educations, newEducation])
				form.reset()
				setFormKey(prev => prev + 1)
			} else {
				throw new Error('Failed to add education')
			}
		} catch (error) {
			toast.error('Failed to add education, please try again')
		}
	}

	/**
	 * Function to handle form submission with redirect to next step.
	 * @param {EducationMutation} values - The form values.
	 */
	const submitWithRedirect = async (values: EducationMutation) => {
		try {
			if (form.formState.isDirty) {
				await insertEducation(values)
			}

			// Update onboarding progress
			await updateOnboardingStep('education')
			router.push('/app/onboarding?step=experience')
		} catch (error) {
			toast.error('Failed to update education, please try again')
		}
	}

	return (
		<div className={cn('max-w-2xl flex flex-col', className)}>
			{/* Informational message about the benefits of adding educational details */}
			<motion.div
				className="text-xl mt-8 max-w-xl"
				initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}} transition={{delay: 0.2, duration: 0.7}}
			>
				<p>
					Having 2 or more educational details can increase the chance of your
					résumé getting selected upto 15%
				</p>
			</motion.div>

			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="mt-12 space-y-8">
					{/* Form fields for institution name and country */}
					<motion.div
						initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}}
						transition={{delay: 0.4, duration: 0.7}}
						className="flex items-center gap-8 justify-between w-full"
					>
						<FormField
							disabled={isPending}
							control={form.control}
							name="institution_name"
							render={({field}) => (
								<FormItem className="w-[95%]">
									<OnboardingFormInput
										placeholder="institution"
										{...field}
										autoFocus
									/>
									<FormLabel className="transition">
										Name of the institution
									</FormLabel>
									<FormMessage />
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
										Country of institution
									</FormLabel>
									<FormMessage />
								</FormItem>
							)}
						/>
					</motion.div>

					{/* Form fields for field of study and degree */}
					<motion.div
						initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}}
						transition={{delay: 0.4, duration: 0.7}}
						className="flex items-center gap-8 justify-between"
					>
						<FormField
							disabled={isPending}
							control={form.control}
							name="field_of_study"
							render={({field}) => (
								<FormItem className="w-[95%]">
									<OnboardingFormInput placeholder="field" {...field} />
									<FormLabel className="transition">Field of study</FormLabel>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							disabled={isPending}
							control={form.control}
							name="degree"
							render={({field}) => (
								<FormItem>
									<OnboardingFormInput placeholder="degree" {...field} value={field.value || ''} />
									<FormLabel className="transition">Degree earned</FormLabel>
									<FormMessage />
								</FormItem>
							)}
						/>
					</motion.div>

					{/* Form fields for start and end dates */}
					<motion.div
						initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}}
						transition={{delay: 0.4, duration: 0.7}}
						className="grid grid-cols-4 gap-8"
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
									<FormLabel className="transition">
										Month of starting
									</FormLabel>
									<FormMessage />
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
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Form field for end month */}
						<AnimatePresence>
							{!isCurrentLocal && <motion.div
								initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: 20}}
								transition={{duration: 0.3}}
							>
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
											<FormMessage />
										</FormItem>
									)}
								/>
							</motion.div>}
						</AnimatePresence>

						{/* Form field for end year */}
						<AnimatePresence>
							{!isCurrentLocal && <motion.div
								initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: 20}}
								transition={{duration: 0.3}}
							>
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
											<FormMessage />
										</FormItem>
									)}
								/>
							</motion.div>}
						</AnimatePresence>
					</motion.div>

					{/* Current checkbox */}
					<motion.div
						initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}}
						transition={{delay: 0.4, duration: 0.7}}
						className="flex items-center gap-8 justify-between"
					>
						<FormField
							disabled={isPending}
							control={form.control}
							name="current"
							render={({field}) => (
								<FormItem className="flex flex-row items-start space-x-3 space-y-0">
									<FormControl>
										<Checkbox
											checked={field.value}
											onCheckedChange={handleCurrentChange}
										/>
									</FormControl>
									<div className="space-y-1 leading-none">
										<FormLabel className="text-sm font-medium cursor-pointer transition">
											I currently study here
										</FormLabel>
									</div>
								</FormItem>
							)}
						/>
					</motion.div>

					{/* Form field for description */}
					<motion.div
						initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}}
						transition={{delay: 0.4, duration: 0.7}}
						className="flex items-center gap-8 justify-between"
					>
						<FormField
							disabled={isPending}
							control={form.control}
							name="description"
							render={({field}) => (
								<FormItem className="w-full">
									<OnboardingRichTextInput
										key={formKey}
										placeholder="write a few things about what you learnt, the things you've build etc."
										value={field?.value || ''}
										onChange={field?.onChange}
									/>
									<FormLabel className="transition">Description (optional)</FormLabel>
									<FormMessage />
								</FormItem>
							)}
						/>
					</motion.div>

					{/* Navigation buttons */}
					<div
						className="w-[calc(100%-4.7rem)] flex items-center justify-between fixed left-[4.7rem] z-10 bottom-16 px-16"
					>
						{/* Button to navigate to the previous step */}
						<Link href={'/app/onboarding?step=personal-details'}>
							<Button
								disabled={isPending}

								className="transition rounded-full shadow-lg hover:shadow-xl px-6"
								variant="secondary"
								type="button"
							>
								<ChevronLeft className="w-5 h-5 mr-1" />
								Personal details
							</Button>
						</Link>

						{/* Buttons to add another education or proceed to the next step */}
						<div className=" flex items-center gap-4">
							<Button
								className="transition rounded-full shadow-lg px-6 hover:shadow-xl"
								variant="secondary"
								type="submit"
								disabled={isPending || form.formState.isSubmitting || !form.formState.isDirty}
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
								What's next
								{form.formState.isSubmitting
									? <Loader2 className="w-4 h-4 ml-1 animate-spin" />
									: <ChevronRight className="w-5 h-5 ml-1" />
								}
							</Button>
						</div>
					</div>
				</form>
			</Form>
		</div>
	)
}

export default EducationForm
