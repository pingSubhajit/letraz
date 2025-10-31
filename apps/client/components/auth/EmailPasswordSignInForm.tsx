'use client'

import {useState} from 'react'
import {useSignIn} from '@clerk/nextjs'
import {useRouter} from 'next/navigation'
import {useForm} from 'react-hook-form'
import {zodResolver} from '@hookform/resolvers/zod'
import {z} from 'zod'
import {motion} from 'motion/react'
import {Button} from '@/components/ui/button'
import {BrandedInput} from '@/components/ui/input'
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from '@/components/ui/form'
import {cn} from '@/lib/utils'
import {Eye, EyeOff, Loader2} from 'lucide-react'

const signInSchema = z.object({
	email: z
		.string()
		.min(1, 'Email is required')
		.email('Please enter a valid email address'),
	password: z
		.string()
		.min(1, 'Password is required')
		.min(6, 'Password must be at least 6 characters')
})

type SignInFormData = z.infer<typeof signInSchema>

interface EmailPasswordSignInFormProps {
	className?: string
}

const EmailPasswordSignInForm = ({className}: EmailPasswordSignInFormProps) => {
	const {signIn, setActive} = useSignIn()
	const router = useRouter()
	const [isLoading, setIsLoading] = useState(false)
	const [showPassword, setShowPassword] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const form = useForm<SignInFormData>({
		resolver: zodResolver(signInSchema),
		defaultValues: {
			email: '',
			password: ''
		}
	})

	const onSubmit = async (data: SignInFormData) => {
		if (!signIn) return

		setIsLoading(true)
		setError(null)

		try {
			const result = await signIn.create({
				identifier: data.email,
				password: data.password
			})

			if (result.status === 'complete') {
				await setActive({session: result.createdSessionId})
				router.push('/app')
			} else {
				// Handle other statuses if needed (e.g., requires verification)
				setError('Sign in failed. Please check your credentials.')
			}
		} catch (err: any) {
			// Handle Clerk errors
			if (err.errors && err.errors.length > 0) {
				const clerkError = err.errors[0]
				setError(clerkError.message || 'Sign in failed. Please try again.')
			} else {
				setError('An unexpected error occurred. Please try again.')
			}
		} finally {
			setIsLoading(false)
		}
	}

	if (!signIn) return null

	return (
		<motion.div
			initial={{opacity: 0, y: 20}}
			animate={{opacity: 1, y: 0}}
			transition={{delay: 0.1}}
			className={cn('w-full', className)}
		>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
					<FormField
						control={form.control}
						name="email"
						render={({field}) => (
							<FormItem>
								<FormLabel className="text-sm font-medium text-neutral-700">
									Email Address
								</FormLabel>
								<FormControl>
									<BrandedInput
										type="email"
										placeholder="Enter your email"
										disabled={isLoading}
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="password"
						render={({field}) => (
							<FormItem>
								<FormLabel className="text-sm font-medium text-neutral-700">
									Password
								</FormLabel>
								<FormControl>
									<div className="relative">
										<BrandedInput
											type={showPassword ? 'text' : 'password'}
											placeholder="Enter your password"
											disabled={isLoading}
											className="pr-10"
											{...field}
										/>
										<button
											type="button"
											onClick={() => setShowPassword(!showPassword)}
											className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700 transition-colors"
											disabled={isLoading}
										>
											{showPassword ? (
												<EyeOff className="h-4 w-4" />
											) : (
												<Eye className="h-4 w-4" />
											)}
										</button>
									</div>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					{error && (
						<motion.div
							initial={{opacity: 0, height: 0}}
							animate={{opacity: 1, height: 'auto'}}
							className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3"
						>
							{error}
						</motion.div>
					)}

					<Button
						type="submit"
						disabled={isLoading}
						className="w-full text-base py-6 px-20"
					>
						{isLoading ? (
							<>
								<Loader2 className="h-4 w-4 mr-2 animate-spin" />
								Signing in...
							</>
						) : (
							'Sign in'
						)}
					</Button>
				</form>
			</Form>
		</motion.div>
	)
}

export default EmailPasswordSignInForm
