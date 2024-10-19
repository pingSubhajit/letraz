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
import {AnimatePresence, motion} from 'framer-motion'
import {Loader2} from 'lucide-react'
import {toast} from 'sonner'

const formSchema = z.object({
	email: z.string().email({message: 'Please enter a valid email address'})
})

const Waitlist = ({className, referrer}: {className?: string, referrer: string | undefined}) => {
	const [signedUp, setSignedUp] = useState(false)
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: ''
		}
	})

	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		try {
			await signUpForWaitlist(values.email, referrer)
			form.reset()
			setSignedUp(true)
		} catch (error) {
			toast.error('Failed to sign up, please try again')
		}
	}

	return (
		<div className={cn('', className)}>
			<AnimatePresence>
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
								{form.formState.isSubmitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
								Join waitlist
							</Button>
						</form>
					</Form>
				</motion.div>}

				{!signedUp && <motion.p
					initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}}
					className="mt-4 text-xs text-primary/60"
				>
					Your email will not be shared with any third parties.
				</motion.p>}

				{signedUp && <motion.p initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}}>
					Thanks for signing up! We'll notify you when we launch.
				</motion.p>}
			</AnimatePresence>
		</div>
	)
}

export default Waitlist
