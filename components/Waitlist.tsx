'use client'

import {z} from 'zod'
import {useForm} from 'react-hook-form'
import {zodResolver} from '@hookform/resolvers/zod'
import {Form, FormControl, FormField, FormItem} from '@/components/ui/form'
import {Input} from '@/components/ui/input'
import {Button} from '@/components/ui/button'
import {cn} from '@/lib/utils'
import {signUpForWaitlist} from '@/lib/waitlist/actions'
import {useState} from 'react'
import {AnimatePresence, motion} from 'motion/react'
import {toast} from 'sonner'
import {discordHandle} from '@/config'
import {useAnalytics} from '@/lib/analytics'

const formSchema = z.object({
	email: z.string().email({message: 'Please enter a valid email address'})
})

type WaitlistMode = 'old' | 'new'

const Waitlist = ({className, referrer, mode = 'new'}: {className?: string, referrer: string | undefined, mode?: WaitlistMode}) => {
	const [signedUp, setSignedUp] = useState(false)
	const {track} = useAnalytics()
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: ''
		},
		mode: 'onChange'
	})


	// Compute button disabled state
	const isSubmissionDisabled = !form.formState.isValid || form.formState.isSubmitting

	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		try {
			setSignedUp(true)
			await signUpForWaitlist(values.email, referrer)
			track('waitlist_submitted', {referrer})
			form.reset()
		} catch (error) {
			setSignedUp(false)
			toast.error('Failed to sign up, please try again')
		}
	}

	return (
		<div className={cn('', className)}>
			<AnimatePresence mode="wait">
				{!signedUp ? (
					<motion.div
						key="form"
						animate={{opacity: 1}}
						exit={{opacity: 0}}
					>
						<Form {...form}>
							<form onSubmit={form.handleSubmit(onSubmit)} className="flex items-stretch gap-1 justify-between">
								<FormField
									control={form.control}
									name="email"
									render={({field}) => (
										<FormItem className="relative">
											<FormControl>
												<Input
													placeholder="Enter your email" {...field}
													className={cn(
														'bg-neutral-50 peer w-full lg:w-96 rounded-l-full py-3 lg:py-4 h-auto',
														mode === 'new' && 'pl-6'
													)}
												/>
											</FormControl>
										</FormItem>
									)}
								/>

								<Button
									type="submit"
									disabled={isSubmissionDisabled}
									className="rounded-r-full h-auto px-4 lg:px-8"
								>
									Join waitlist
								</Button>
							</form>
						</Form>
						<p className={cn(
							'mt-4 text-xs text-primary/60',
							mode === 'new' && 'text-center mt-2'
						)}>
							Your email will not be shared with any third parties.
						</p>
					</motion.div>
				) : (
					<motion.div
						key="success"
						initial={{opacity: 0}}
						animate={{opacity: 1}}
					>
						Thanks for signing up! Join our <a href={discordHandle} target="_blank"
							className={cn(
								'text-flame-500 font-medium hover:underline focus-visible:underline',
								mode === 'new' && 'text-center'
							)}>
							Discord
						</a> to stay connected.
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	)
}

export default Waitlist
