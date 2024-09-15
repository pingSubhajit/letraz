'use client'

import {z} from 'zod'
import {useForm} from 'react-hook-form'
import {zodResolver} from '@hookform/resolvers/zod'
import {Form, FormControl, FormField, FormItem} from '@/components/ui/form'
import {Input} from '@/components/ui/input'
import {Button} from '@/components/ui/button'
import {cn} from '@/lib/utils'
import {usePathname} from 'next/navigation'
import {signUpForWaitlist} from '@/lib/waitlist.methods'
import {defaultUrl} from '@/config'
import {useState} from 'react'
import {AnimatePresence, motion} from 'framer-motion'
import {Loader2} from 'lucide-react'
import {toast} from 'sonner'

const formSchema = z.object({
	email: z.string().email({message: 'Please enter a valid email address'}),
})

const Waitlist = ({className}: {className?: string}) => {
	const [signedUp, setSignedUp] = useState(false)
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: '',
		},
	})

	const pathName = usePathname()

	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		try {
			await signUpForWaitlist(values.email, `${defaultUrl}${pathName}`)
			form.reset()
			setSignedUp(true)
		} catch (error) {
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
					transition={{delay: 6.5}}
				>
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="flex items-stretch gap-1">
							<FormField
								control={form.control}
								name="email"
								render={({ field }) => (
									<FormItem className="relative">
										<FormControl>
											<Input
												placeholder="Enter your email" {...field}
												className="bg-neutral-50 peer w-72 rounded-l-full"
											/>
										</FormControl>
										<div className="flex items-center w-[102%] h-[110%] rounded-lg rounded-l-full
										bg-gradient-to-r from-orange-600 via-rose-600 to-amber-500
										absolute top-1/2 left-1/2 -z-10 -translate-x-1/2 -translate-y-1/2
										scale-0 peer-focus-visible:scale-100 transition"/>
									</FormItem>
								)}
							/>

							<Button
								type="submit"
								disabled={!form.formState.isValid || form.formState.isSubmitting}
								className="rounded-r-full"
							>
								{form.formState.isSubmitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
								Join waitlist
							</Button>
						</form>
					</Form>
				</motion.div>}

				{signedUp && <motion.p initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}}>
					Thanks for signing up! We'll notify you when we launch.
				</motion.p>}
			</AnimatePresence>
		</div>
	)
}

export default Waitlist
