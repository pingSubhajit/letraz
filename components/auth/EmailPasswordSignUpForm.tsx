'use client'

import {useMemo, useState} from 'react'
import {useSignUp} from '@clerk/nextjs'
import {useRouter} from 'next/navigation'
import {useForm} from 'react-hook-form'
import {zodResolver} from '@hookform/resolvers/zod'
import {z} from 'zod'
import {motion} from 'motion/react'
import {Button} from '@/components/ui/button'
import {BrandedInput} from '@/components/ui/input'
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from '@/components/ui/form'
import {cn} from '@/lib/utils'
import {Check, Eye, EyeOff, Loader2, X} from 'lucide-react'
import {passwordStrengthConfig} from '@/config'
import {zxcvbn, zxcvbnOptions} from '@zxcvbn-ts/core'
import {adjacencyGraphs, dictionary as commonDictionary} from '@zxcvbn-ts/language-common'
import {dictionary as enDictionary, translations as enTranslations} from '@zxcvbn-ts/language-en'
import Link from 'next/link'
import {InputOTP, InputOTPGroup, InputOTPSlot} from '@/components/ui/input-otp'

// Configure zxcvbn language packs once per module
zxcvbnOptions.setOptions({
	translations: enTranslations,
	graphs: adjacencyGraphs,
	dictionary: {
		...commonDictionary,
		...enDictionary
	}
})

const signUpSchema = z.object({
	firstName: z
		.string()
		.min(1, 'First name is required')
		.min(2, 'First name must be at least 2 characters')
		.max(50, 'First name must be less than 50 characters'),
	lastName: z
		.string()
		.min(1, 'Last name is required')
		.min(2, 'Last name must be at least 2 characters')
		.max(50, 'Last name must be less than 50 characters'),
	email: z
		.string()
		.min(1, 'Email is required')
		.email('Please enter a valid email address'),
	password: z
		.string()
		.min(passwordStrengthConfig.requirements.minLength, `Password must be at least ${passwordStrengthConfig.requirements.minLength} characters`)
		.regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
		.regex(/[a-z]/, 'Password must contain at least one lowercase letter')
		.regex(/[0-9]/, 'Password must contain at least one number')
		.regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character')
})

type SignUpFormData = z.infer<typeof signUpSchema>

interface EmailPasswordSignUpFormProps {
	className?: string
	onVerificationStateChange?: (isVerifying: boolean) => void
}

const EmailPasswordSignUpForm = ({className, onVerificationStateChange}: EmailPasswordSignUpFormProps) => {
	const {signUp, setActive} = useSignUp()
	const router = useRouter()
	const [isLoading, setIsLoading] = useState(false)
	const [showPassword, setShowPassword] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [verificationPending, setVerificationPending] = useState(false)
	const [verificationCode, setVerificationCode] = useState('')
	const [isVerifying, setIsVerifying] = useState(false)

	const form = useForm<SignUpFormData>({
		resolver: zodResolver(signUpSchema),
		defaultValues: {
			firstName: '',
			lastName: '',
			email: '',
			password: ''
		}
	})

	const password = form.watch('password')

	// Password strength calculation (zxcvbn for strength + requirements for checklist)
	const passwordStrength = useMemo(() => {
		if (!password) {
			return {zxScore: 0, level: 'weak', requirements: [], requirementsScore: 0}
		}

		const requirements = [
			{
				label: `At least ${passwordStrengthConfig.requirements.minLength} characters`,
				met: password.length >= passwordStrengthConfig.requirements.minLength
			},
			{
				label: 'At least one uppercase letter',
				met: /[A-Z]/.test(password)
			},
			{
				label: 'At least one lowercase letter',
				met: /[a-z]/.test(password)
			},
			{
				label: 'At least one number',
				met: /[0-9]/.test(password)
			},
			{
				label: 'At least one special character',
				met: /[^A-Za-z0-9]/.test(password)
			}
		]

		const requirementsScore = requirements.filter(req => req.met).length

		const zx = zxcvbn(password)
		const zxScore = zx.score // 0..4
		const level =
			zxScore === 0 ? 'weak' :
			zxScore === 1 ? 'fair' :
			zxScore === 2 ? 'good' :
			zxScore === 3 ? 'strong' : 'veryStrong'

		return {zxScore, level, requirements, requirementsScore}
	}, [password])

	const onSubmit = async (data: SignUpFormData) => {
		if (!signUp) return

		setIsLoading(true)
		setError(null)

		try {
			const result = await signUp.create({
				firstName: data.firstName,
				lastName: data.lastName,
				emailAddress: data.email,
				password: data.password
			})

			if (result.status === 'complete') {
				await setActive({session: result.createdSessionId})
				router.push('/app')
			} else {
				// Send verification email
				await signUp.prepareEmailAddressVerification({strategy: 'email_code'})
				setVerificationPending(true)
				setError(null)
				onVerificationStateChange?.(true)
			}
		} catch (err: any) {
			// Handle Clerk errors
			if (err.errors && err.errors.length > 0) {
				const clerkError = err.errors[0]
				setError(clerkError.message || 'Sign up failed. Please try again.')
			} else {
				setError('An unexpected error occurred. Please try again.')
			}
		} finally {
			setIsLoading(false)
		}
	}

	const handleVerification = async () => {
		if (!signUp || !verificationCode) return

		setIsVerifying(true)
		setError(null)

		try {
			const result = await signUp.attemptEmailAddressVerification({
				code: verificationCode
			})

			if (result.status === 'complete') {
				await setActive({session: result.createdSessionId})
				router.push('/app')
			} else {
				setError('Verification failed. Please check your code and try again.')
			}
		} catch (err: any) {
			if (err.errors && err.errors.length > 0) {
				const clerkError = err.errors[0]
				setError(clerkError.message || 'Verification failed. Please try again.')
			} else {
				setError('An unexpected error occurred. Please try again.')
			}
		} finally {
			setIsVerifying(false)
		}
	}

	if (!signUp) return null

	// Show verification form if verification is pending
	if (verificationPending) {
		return (
			<motion.div
				initial={{opacity: 0, y: 20}}
				animate={{opacity: 1, y: 0}}
				transition={{delay: 0.1}}
				className={cn('w-full', className)}
			>
				<div className="space-y-6">
					<div className="space-y-3">
						<div className="flex justify-center">
							<InputOTP
								maxLength={6}
								value={verificationCode}
								onChange={setVerificationCode}
								disabled={isVerifying}
								pattern="[0-9]*"
							>
								<InputOTPGroup>
									<InputOTPSlot index={0} className="w-16 h-16 text-2xl" />
									<InputOTPSlot index={1} className="w-16 h-16 text-2xl" />
									<InputOTPSlot index={2} className="w-16 h-16 text-2xl" />
									<InputOTPSlot index={3} className="w-16 h-16 text-2xl" />
									<InputOTPSlot index={4} className="w-16 h-16 text-2xl" />
									<InputOTPSlot index={5} className="w-16 h-16 text-2xl" />
								</InputOTPGroup>
							</InputOTP>
						</div>
					</div>

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
						onClick={handleVerification}
						disabled={isVerifying || !verificationCode}
						className="w-full text-base py-6 px-20 bg-flame-500 hover:bg-flame-300 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{isVerifying ? (
							<>
								<Loader2 className="h-4 w-4 mr-2 animate-spin" />
								Verifying...
							</>
						) : (
							'Verify account'
						)}
					</Button>

					<div className="text-center">
						<button
							type="button"
							onClick={() => {
								setVerificationPending(false)
								onVerificationStateChange?.(false)
							}}
							className="text-sm text-neutral-500 hover:text-neutral-700 transition-colors"
							disabled={isVerifying}
						>
							← Back to sign up
						</button>
					</div>
				</div>
			</motion.div>
		)
	}

	return (
		<motion.div
			initial={{opacity: 0, y: 20}}
			animate={{opacity: 1, y: 0}}
			transition={{delay: 0.1}}
			className={cn('w-full', className)}
		>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
					{/* Name Fields */}
					<div className="grid grid-cols-2 gap-4">
						<FormField
							control={form.control}
							name="firstName"
							render={({field}) => (
								<FormItem>
									<FormLabel className="text-sm font-medium text-neutral-700">
										First Name
									</FormLabel>
									<FormControl>
										<BrandedInput
											type="text"
											placeholder="Enter your first name"
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
							name="lastName"
							render={({field}) => (
								<FormItem>
									<FormLabel className="text-sm font-medium text-neutral-700">
										Last Name
									</FormLabel>
									<FormControl>
										<BrandedInput
											type="text"
											placeholder="Enter your last name"
											disabled={isLoading}
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>

					{/* Email Field */}
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

					{/* Password Field */}
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
											placeholder="Create a password"
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

					{/* Password Strength Indicator */}
					{password && (
						<motion.div
							initial={{opacity: 0, height: 0}}
							animate={{opacity: 1, height: 'auto'}}
							className="space-y-3"
						>
							{/* Progress Bar */}
							<div className="space-y-2">
								<div className="flex justify-between items-center">
									<span className="text-sm font-medium text-neutral-700">Password Strength</span>
									<span className="text-sm font-medium capitalize text-neutral-600">
										{passwordStrength.level}
									</span>
								</div>
								<div className="w-full bg-neutral-200 rounded-full h-2">
									<div
										className={cn(
											'h-2 rounded-full transition-all duration-300',
											passwordStrengthConfig.strengthLevels[passwordStrength.level as keyof typeof passwordStrengthConfig.strengthLevels].color
										)}
										style={{width: `${((passwordStrength.zxScore + 1) / 5) * 100}%`}}
									/>
								</div>
							</div>

							{/* Requirements List */}
							<div className="space-y-2">
								{passwordStrength.requirements.map((requirement, index) => (
									<div key={index} className="flex items-center gap-2">
										{requirement.met ? (
											<Check className="h-4 w-4 text-green-500" />
										) : (
											<X className="h-4 w-4 text-red-500" />
										)}
										<span className={cn(
											'text-sm',
											requirement.met ? 'text-green-700' : 'text-red-700'
										)}>
											{requirement.label}
										</span>
									</div>
								))}
							</div>
						</motion.div>
					)}

					{/* Error Message */}
					{error && (
						<motion.div
							initial={{opacity: 0, height: 0}}
							animate={{opacity: 1, height: 'auto'}}
							className={cn(
								'text-sm border rounded-md p-3',
								verificationPending
									? 'text-blue-600 bg-blue-50 border-blue-200'
									: 'text-red-600 bg-red-50 border-red-200'
							)}
						>
							{error}
						</motion.div>
					)}

					{/* Submit Button */}
					<Button
						type="submit"
						disabled={isLoading || passwordStrength.requirementsScore < 5}
						className="w-full text-base py-6 px-20 bg-flame-500 hover:bg-flame-300 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{isLoading ? (
							<>
								<Loader2 className="h-4 w-4 mr-2 animate-spin" />
								Creating account...
							</>
						) : (
							'Create account'
						)}
					</Button>

					{/* Sign In Link */}
					<div className="text-center mt-4">
						<span className="text-sm text-neutral-600">
							Already have an account?{' '}
							<Link
								href="/signin"
								className="text-flame-500 hover:text-flame-600 font-medium transition-colors"
							>
								Sign in here
							</Link>
						</span>
					</div>
				</form>
			</Form>
		</motion.div>
	)
}

export default EmailPasswordSignUpForm
