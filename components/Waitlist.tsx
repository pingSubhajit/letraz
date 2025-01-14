'use client'

import {z} from 'zod'
import {useForm} from 'react-hook-form'
import {zodResolver} from '@hookform/resolvers/zod'
import {Form, FormControl, FormField, FormItem} from '@/components/ui/form'
import {Input} from '@/components/ui/input'
import {Button} from '@/components/ui/button'
import {cn} from '@/lib/utils'
import {signUpForWaitlist} from '@/lib/waitlist.methods'
import {useState} from 'react'
import {AnimatePresence, motion} from 'motion/react'
import {Loader2} from 'lucide-react'
import {toast} from 'sonner'
import {discordHandle} from '@/config'

const formSchema = z.object({
	email: z.string().email({message: 'Please enter a valid email address'})
})

const Waitlist = ({className, referrer}: {className?: string, referrer: string | undefined}) => {
	const [signedUp, setSignedUp] = useState(false)
	const [email, setEmail] = useState('')
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: ''
		}
	})

	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		setEmail(values.email)
		form.reset()
		setSignedUp(true)

		try {
			await signUpForWaitlist(values.email, referrer)
		} catch (error) {
			setSignedUp(false)
			form.setValue('email', email)
			toast.error('Failed to sign up, please try again')
		}
	}

	return (
		<div className={cn('', className)}>
			<AnimatePresence mode="wait">
				{!signedUp && <motion.div
					initial={{opacity: 0}}
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
												className="bg-neutral-50 peer w-full lg:w-96 rounded-l-full py-3 lg:py-4 h-auto"
											/>
										</FormControl>
									</FormItem>
								)}
							/>

							<Button
								type="submit"
								disabled={!form.formState.isValid || form.formState.isSubmitting}
								className="rounded-r-full h-auto px-4 lg:px-8"
							>
								Join waitlist
							</Button>
						</form>
					</Form>
				</motion.div>}

				{!signedUp && <motion.p
					initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}}
					className="mt-4 text-xs text-primary/60" >
					Your email will not be shared with any third parties.
				</motion.p>}

				{signedUp && <motion.p
					initial={{opacity: 0}}
					animate={{opacity: 1}}
					exit={{opacity: 0}}
				>
					Thanks for signing up! Join our <a href={discordHandle} target="_blank" className="text-flame-500 font-medium hover:underline focus-visible:underline">Discord</a> to stay connected.
				</motion.p>}
			</AnimatePresence>
		</div>
	)
}

export default Waitlist
