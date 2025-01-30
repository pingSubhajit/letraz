'use client'

import {cn} from '@/lib/utils'

const LandingPageHeading = ({className}: {className?: string}) => {
	return (
		<h1
			className={cn(
				'text-3xl md:text-4xl lg:text-5xl max-w-[700px] lg:max-w-[900px] lg:leading-snug font-bold',
				className
			)}
		>
			Craft unique résumés tailored to every job application
		</h1>
	)
}

export default LandingPageHeading
