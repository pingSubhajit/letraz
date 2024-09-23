'use client'

import {Link} from 'next-view-transitions'
import {motion} from 'framer-motion'
import {cn} from '@/lib/utils'

const LandingPageLogo = ({className}: {className?: string}) => {
	return (
		<Link href="/">
			<motion.img
				initial={{opacity: 0}}
				animate={{opacity: 1}}
				exit={{opacity: 0}}
				src='/logo_mono.svg'
				alt="Letraz logo"
				className={cn('w-32 md:w-36 lg:w-40 xl:w-44', className)}
			/>
		</Link>
	)
}

export default LandingPageLogo
