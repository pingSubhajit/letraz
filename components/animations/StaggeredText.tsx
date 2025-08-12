'use client'

import {motion} from 'motion/react'

type StaggeredTextProps = {
  text: string
  show: boolean
  className?: string
}

const StaggeredText = ({text, show, className}: StaggeredTextProps) => {
	const letters = Array.from(text)

	return (
		<motion.h2
			className={`leading-normal flex overflow-hidden ${className ?? ''}`}
			initial="hidden"
			animate={show ? 'visible' : 'exit'}
			variants={{
				hidden: {},
				visible: {
					transition: {staggerChildren: 0.01, delayChildren: 0.2}
				},
				exit: {
					transition: {staggerChildren: 0.01, delayChildren: 0}
				}
			}}
		>
			{letters.map((letter, index) => (
				<motion.span
					key={index}
					variants={{
						hidden: {
							y: '200%',
							transition: {ease: [0.455, 0.03, 0.515, 0.955], duration: 0.85}
						},
						visible: {
							y: 0,
							transition: {ease: [0.125, 0.92, 0.69, 0.975], duration: 0.75}
						},
						exit: {
							y: '-200%',
							transition: {ease: [0.455, 0.03, 0.515, 0.955], duration: 0.75}
						}
					}}
				>
					{letter === ' ' ? '\u00A0' : letter}
				</motion.span>
			))}
		</motion.h2>
	)
}

export default StaggeredText


