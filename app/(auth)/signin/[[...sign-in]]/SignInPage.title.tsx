'use client'

import {motion} from 'framer-motion'

const SignInPageTitle = () => {
	return (
		<motion.h1 className="flex flex-col items-center" layout initial={{opacity: 0}} animate={{opacity: 1}}>
			<span className="text-4xl font-medium">Welcome to</span>
			<span className="text-8xl font-bold">Letraz</span>
		</motion.h1>
	)
}

export default SignInPageTitle

