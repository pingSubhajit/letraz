'use client'

import {motion} from 'motion/react'

const LetrazStoryPageHeading = () => {
	return (
		<>
			<motion.h1
				className="mt-8 text-7xl lg:text-6xl xl:text-7xl 2xl:text-8xl tracking-tight text-center"
				initial={{opacity: 0}}
				animate={{opacity: 1}}
				exit={{opacity: 0}}
			>The Story Behind Letraz</motion.h1>
			<motion.h2
				className="mt-16 text-base lg:text-lg opacity-70 max-w-[70%] text-center"
				initial={{opacity: 0}}
				animate={{opacity: 1}}
				exit={{opacity: 0}}
			>
				There is a lost art in crafting resumes — resumes that not only list achievements but tell a compelling and tailored story. Here are the foundational principles Letraz is built on.
			</motion.h2>
		</>
	)
}

export default LetrazStoryPageHeading
