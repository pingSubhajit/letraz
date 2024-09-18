'use client'

import {motion} from 'framer-motion'
import {cn} from '@/lib/utils'
import {z} from 'zod'
import {useForm} from 'react-hook-form'
import {zodResolver} from '@hookform/resolvers/zod'
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage, useFormField} from '@/components/ui/form'
import {Input, InputProps} from '@/components/ui/input'
import {useState} from 'react'
import {Button} from '@/components/ui/button'
import {Link} from 'next-view-transitions'
import {ChevronLeft, ChevronRight} from 'lucide-react'

const FormInput = ({ className, type, ...props }: InputProps) => {
	const [fieldState, setFieldState] = useState<'idle' | 'hover' | 'focus' | 'error'>('idle')
	const { error } = useFormField()

	return (
		<div className={cn('relative mb-2', className)}>
			<FormControl>
				<Input
					className="text-3xl font-bold italic px-0 py-2 h-auto border-0 ring-0 border-b-2"
					{...props}
					onFocus={() => setFieldState('focus')}
					onBlur={() => setFieldState('idle')}
					onMouseEnter={() => {
						if (fieldState !== 'focus') setFieldState('hover')
					}}
					onMouseLeave={() => {
						if (fieldState !== 'focus') setFieldState('idle')
					}}
				/>
			</FormControl>

			<motion.div
				initial={{width: 0}} animate={{width: fieldState === 'focus' ? '100%' : fieldState === 'hover' ? '50%' : 0}}
				className="absolute w-0 h-[1px] inset-x-0 bottom-0 bg-primary origin-left"
			/>

			<motion.div
				initial={{width: 0}}
				animate={{width: error ? '100%' : 0}}
				className="absolute w-0 h-[1px] inset-x-0 bottom-0 bg-red-500 origin-left"
			/>
		</div>
	)
}

const formSchema = z.object({
	firstName: z.string()
		.min(2, {message: 'You don\'t have a name shorter than two letters do you?'})
		.max(50, {message: 'That\'s a long name! We can\'t handle that'}),
	lastName: z.string()
		.min(2, {message: 'You don\'t have a name shorter than two letters do you?'})
		.max(50, {message: 'That\'s a long name! We can\'t handle that'}),
	email: z.string().email({message: 'Please enter a valid email address'}),
	phone: z.string()
		.min(10, {message: 'That phone number doesn\'t look right'})
		.max(15, {message: 'That phone number doesn\'t look right'})
		.optional(),
})

const PersonalDetailsForm = ({className}: { className?: string }) => {
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			firstName: '',
			lastName: '',
			email: '',
			phone: undefined,
		},
	})

	function onSubmit(values: z.infer<typeof formSchema>) {
		console.log(values)
	}

	return (
		<div className={cn('max-w-4xl mx-auto flex flex-col items-center', className)}>
			<motion.div
				className="text-xl text-center mt-8 max-w-xl"
				initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}} transition={{delay: 0.2, duration: 0.7}}
			>
				<p>We need a few details about you to craft the perfect resume for you</p>
			</motion.div>

			<Form {...form}>
				<form
					onSubmit={form.handleSubmit(onSubmit)}
					className="mt-20 space-y-8"
				>
					<motion.div
						initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}} transition={{delay: 0.4, duration: 0.7}}
						className="flex items-center gap-8 justify-between"
					>
						<FormField
							control={form.control}
							name="firstName"
							render={({field}) => (
								<FormItem>
									<FormInput placeholder="first name" {...field} />
									<FormLabel className="transition">First name</FormLabel>
									<FormMessage/>
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="lastName"
							render={({field}) => (
								<FormItem>
									<FormInput placeholder="last name" {...field} />
									<FormLabel className="transition">Last name</FormLabel>
									<FormMessage/>
								</FormItem>
							)}
						/>
					</motion.div>

					<motion.div
						initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}} transition={{delay: 0.4, duration: 0.7}}
						className="flex items-center gap-8 justify-between"
					>
						<FormField
							control={form.control}
							name="email"
							render={({field}) => (
								<FormItem>
									<FormInput placeholder="email address" {...field} />
									<FormLabel className="transition">Email</FormLabel>
									<FormMessage/>
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="phone"
							render={({field}) => (
								<FormItem>
									<FormInput placeholder="phone no." {...field} />
									<FormLabel className="transition">Phone (optional)</FormLabel>
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
						<Link href={'/app/onboarding?step=about'}>
							<Button
								className="transition rounded-full shadow-lg hover:shadow-xl px-6"
								variant="secondary"
							>
								<ChevronLeft className="w-5 h-5 mr-1"/>
								Overview
							</Button>
						</Link>

						{/* NEXT STEP BUTTON */}
						<Button
							className="transition rounded-full shadow-lg px-6 hover:shadow-xl"
							variant="secondary"
							type="submit"
						>
								Looks good
							<ChevronRight className="w-5 h-5 ml-1"/>
						</Button>
					</div>
				</form>
			</Form>
		</div>
	)
}

export default PersonalDetailsForm
