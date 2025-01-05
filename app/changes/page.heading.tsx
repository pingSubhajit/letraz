'use client'

import {discordHandle} from '@/constants'
import {motion} from 'motion/react'

const ChangesPageHeading = () => {
	return (
		<>
			<motion.h1
				className="mt-8 text-3xl lg:text-4xl xl:text-5xl leading-snug tracking-tight"
				initial={{opacity: 0}}
				animate={{opacity: 1}}
				exit={{opacity: 0}}
				{...({} as any)}
				// Framer-motion types are broken as of 22/10/2024
			>News & updates about the development</motion.h1>
			<motion.h2
				className="mt-8 text-base lg::text-lg opacity-70 max-w-[75%]"
				initial={{opacity: 0}}
				animate={{opacity: 1}}
				exit={{opacity: 0}}
				{...({} as any)}
				// Framer-motion types are broken as of 22/10/2024
			>
				Join our <a href={discordHandle}
					target="_blank"
					className="font-semibold text-flame-500 focus-visible:underline hover:underline"
				>Discord</a> to stay connected to more frequent updates and help us build the community
			</motion.h2>
		</>
	)
}

export default ChangesPageHeading
