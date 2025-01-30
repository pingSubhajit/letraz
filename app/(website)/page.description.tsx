'use client'

import {cn} from '@/lib/utils'

const LandingPageDescription = ({className}: {className?: string}) => {
	return (
		<p className={cn('font-bold text-primary/50', className)}>
			Enter your email below to be notified of updates and when we launch.
		</p>
	)
}

export default LandingPageDescription
