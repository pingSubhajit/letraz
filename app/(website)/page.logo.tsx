'use client'

import {Link} from 'next-view-transitions'
import {motion} from 'motion/react'
import {cn} from '@/lib/utils'

const LandingPageLogo = ({className, hideOnMobile}: {className?: string, hideOnMobile?: boolean}) => {
	return (
		<Link href="/">
			<motion.img
				initial={{opacity: 0}}
				animate={{opacity: 1}}
				exit={{opacity: 0}}
				src="/logo_mono.svg"
				alt="Letraz logo"
				className={cn('w-24 md:w-28 lg:w-36 xl:w-40 2xl:w-44', hideOnMobile && 'invisible lg:visible', className)}
			/>
		</Link>
	)
}

export default LandingPageLogo
