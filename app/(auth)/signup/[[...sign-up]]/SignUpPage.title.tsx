'use client'

import {motion} from 'motion/react'

interface SignUpPageTitleProps {
	isVerification?: boolean
}

const SignUpPageTitle = ({isVerification = false}: SignUpPageTitleProps) => {
	return (
		<motion.div
			initial={{opacity: 0, y: 20}}
			animate={{opacity: 1, y: 0}}
			transition={{delay: 0.2}}
			className="w-full"
		>
			<h1 className="text-4xl font-bold text-neutral-900 mb-2">
				{isVerification ? 'Check your email' : 'Create your account'}
			</h1>
			<p className="text-lg text-neutral-600">
				{isVerification
					? 'We\'ve sent a verification code to your email address. Enter it below to complete your account setup.'
					: 'Join Letraz to start building personalized resumes that get you hired.'
				}
			</p>
		</motion.div>
	)
}

export default SignUpPageTitle
