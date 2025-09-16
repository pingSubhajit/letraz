'use client'

import {Link} from 'next-view-transitions'
import {motion} from 'motion/react'
import {cva, type VariantProps} from 'class-variance-authority'
import {cn} from '@/lib/utils'

const logoVariants = cva('', {
	variants: {
		size: {
			sm: 'w-16 md:w-20 lg:w-24 xl:w-28 2xl:w-32',
			md: 'w-20 md:w-24 lg:w-28 xl:w-32 2xl:w-36',
			lg: 'w-24 md:w-28 lg:w-32 xl:w-36 2xl:w-40',
			xl: 'w-24 md:w-28 lg:w-36 xl:w-40 2xl:w-44' // current largest
		}
	},
	defaultVariants: {
		size: 'xl'
	}
})

type LandingPageLogoProps = {
	className?: string
	hideOnMobile?: boolean
} & VariantProps<typeof logoVariants>

const LandingPageLogo = ({className, hideOnMobile, size}: LandingPageLogoProps) => {
	return (
		<Link href="/">
			<motion.img
				initial={{opacity: 0}}
				animate={{opacity: 1}}
				exit={{opacity: 0}}
				src="/logo_mono.svg"
				alt="Letraz logo"
				className={cn(logoVariants({size}), hideOnMobile && 'invisible lg:visible', className)}
			/>
		</Link>
	)
}

export default LandingPageLogo
