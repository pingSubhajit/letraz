'use client'

import {motion} from 'motion/react'
import Image from 'next/image'
import letrazLogo from '@/public/logo.svg'
import rizeLogo from '@/public/rize-logo.svg'

interface SignUpPageTitleProps {
	isVerification?: boolean,
	isRizeFlow?: boolean
}

const SignUpPageTitle = ({isVerification = false, isRizeFlow = false}: SignUpPageTitleProps) => {
	return (
		<motion.div
			initial={{opacity: 0, y: 20}}
			animate={{opacity: 1, y: 0}}
			transition={{delay: 0.2}}
			className="w-full"
		>
			{isRizeFlow && (
				<div className="mb-6 flex justify-start items-center gap-2">
					<Image src={letrazLogo} alt="Letraz Logo" className="h-10 w-min" />
					<span className="text-4xl ml-2">+</span>
					<Image src={rizeLogo} alt="Rize Logo" className="h-12 w-min" />
				</div>
			)}

			<h1 className="text-4xl font-bold text-neutral-900 mb-2">
				{isVerification ? 'Check your email' : 'Create your account'}
			</h1>
			<p className="text-lg text-neutral-600">
				{isVerification
					? 'We\'ve sent a verification code to your email address. Enter it below to complete your account setup.'
					: !isRizeFlow
						? 'Join Letraz to start building personalized resumes that get you hired.'
						: 'Supercharge your resumes with Letraz like Rize does for your portfolio'
				}
			</p>
		</motion.div>
	)
}

export default SignUpPageTitle
