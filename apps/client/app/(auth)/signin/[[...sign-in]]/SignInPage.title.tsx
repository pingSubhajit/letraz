'use client'

import {motion} from 'motion/react'
import Link from 'next/link'
import {Button} from '@/components/ui/button'

const SignInPageTitle = () => {
	return (
		<>
			<motion.h1
				className="flex flex-col items-start gap-2"
				layout initial={{opacity: 0}} animate={{opacity: 1}}
			>
				<span className="text-4xl sm:text-5xl 2xl:text-6xl font-bold">Sign in</span>
			</motion.h1>

			<motion.p className="mt-2 text-sm sm:text-base lg:text-sm 2xl:text-base">
				Or create an account if you haven't yet,  <Link href="/signup">
					<Button variant="link" className="font-bold text-flame-500 px-0 text-sm sm:text-base">Create account.</Button>
				</Link>
			</motion.p>
		</>
	)
}

export default SignInPageTitle
