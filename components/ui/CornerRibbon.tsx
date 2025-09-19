'use client'

import {cn} from '@/lib/utils'

type CornerRibbonProps = {
	label?: string
	className?: string
    colorClassName?: string
}

const CornerRibbon = ({label = 'Preferred', className, colorClassName}: CornerRibbonProps) => {
	return (
		<div aria-hidden className="absolute top-0 right-0 translate-x-2 -translate-y-2 z-10">
			<div
				className={cn(
					'pointer-events-none select-none',
					'inline-flex items-center justify-center px-2 py-1',
					'rounded-full text-[10px] font-medium shadow-sm ring-1 ring-black/5',
					colorClassName || 'bg-flame-500 text-white',
					className
				)}
			>
				{label}
			</div>
		</div>
	)
}

export default CornerRibbon


