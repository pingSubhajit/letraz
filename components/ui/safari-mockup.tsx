'use client'

import {forwardRef, ReactNode} from 'react'
import {cn} from '@/lib/utils'

const SafariMockup = forwardRef<HTMLDivElement, {children?: ReactNode, className?: string}>(({children, className}, ref) => {
	return (
		<div
			ref={ref}
			className={cn(
				'w-full min-w-[700px] rounded-xl border border-zinc-200 dark:border-zinc-800 bg-muted shadow-md overflow-hidden flex flex-col',
				className
			)}
		>
			{/* Browser top bar */}
			<div className="flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
				<div className="flex items-center space-x-2">
					<span className="w-3 h-3 bg-red-400 rounded-full" />
					<span className="w-3 h-3 bg-yellow-400 rounded-full" />
					<span className="w-3 h-3 bg-green-500 rounded-full" />
				</div>
				<div className="flex-1 mx-4 bg-gray-200 dark:bg-zinc-800 rounded-md h-5 max-w-md">
					<p className="text-[10px] opacity-60 text-center mx-auto">Letraz - Builds your resume</p>
				</div>
				<div className="w-4 h-4" /> {/* Placeholder for right side icons */}
			</div>

			{/* Preview area */}
			<div className="relative bg-gray-100 dark:bg-zinc-800 w-full h-[calc(100%-37px)]">
				{children ? (
					<div className="absolute inset-0">
						{children}
					</div>
				) : (
					<div className="absolute inset-0 flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
						No preview image
					</div>
				)}
			</div>
		</div>
	)
})

SafariMockup.displayName = 'SafariMockup'

export default SafariMockup
