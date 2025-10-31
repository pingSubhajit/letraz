'use client'

import {forwardRef, ReactNode} from 'react'
import {cn} from '@/lib/utils'

const SafariMockup = forwardRef<HTMLDivElement, {children?: ReactNode, className?: string}>(({children, className}, ref) => {
	return (
		<div
			ref={ref}
			className={cn(
				'w-full lg:min-w-[700px] rounded-md sm:rounded-lg lg:rounded-xl border border-zinc-200 dark:border-zinc-800 bg-muted shadow-md overflow-hidden flex flex-col',
				className
			)}
		>
			{/* Browser top bar */}
			<div className="flex items-center justify-between px-2 sm:px-3 lg:px-4 py-1 sm:py-1.5 lg:py-2 bg-gray-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
				<div className="flex items-center space-x-1 sm:space-x-1.5 lg:space-x-2">
					<span className="w-1.5 h-1.5 sm:w-2 sm:h-2 lg:w-3 lg:h-3 bg-red-400 rounded-full" />
					<span className="w-1.5 h-1.5 sm:w-2 sm:h-2 lg:w-3 lg:h-3 bg-yellow-400 rounded-full" />
					<span className="w-1.5 h-1.5 sm:w-2 sm:h-2 lg:w-3 lg:h-3 bg-green-500 rounded-full" />
				</div>
				<div className="flex-1 mx-2 sm:mx-3 lg:mx-4 bg-gray-200 dark:bg-zinc-800 rounded-sm sm:rounded lg:rounded-md h-3 sm:h-4 lg:h-5 max-w-md">
					<p className="text-[6px] sm:text-[8px] lg:text-[10px] opacity-60 text-center mx-auto leading-3 sm:leading-4 lg:leading-5">Letraz - Builds your resume</p>
				</div>
				<div className="w-2 h-2 sm:w-3 sm:h-3 lg:w-4 lg:h-4" /> {/* Placeholder for right side icons */}
			</div>

			{/* Preview area */}
			<div className="relative bg-gray-100 dark:bg-zinc-800 w-full h-[calc(100%-25px)] sm:h-[calc(100%-30px)] lg:h-[calc(100%-37px)]">
				{children ? (
					<div className="absolute inset-0">
						{children}
					</div>
				) : (
					<div className="absolute inset-0 flex items-center justify-center text-xs sm:text-sm text-gray-500 dark:text-gray-400">
						No preview image
					</div>
				)}
			</div>
		</div>
	)
})

SafariMockup.displayName = 'SafariMockup'

export default SafariMockup
