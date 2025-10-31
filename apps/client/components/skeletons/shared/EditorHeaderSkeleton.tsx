'use client'

import {cn} from '@/lib/utils'

interface EditorHeaderSkeletonProps {
  className?: string
  showButton?: boolean
}

const EditorHeaderSkeleton = ({className, showButton = true}: EditorHeaderSkeletonProps) => {
	return (
		<div className={cn('mb-4 lg:mb-4 2xl:mb-6 flex items-center justify-between', className)}>
			<div className="flex flex-col gap-0.5 lg:gap-0.5 2xl:gap-1 min-w-0 flex-1">
				{/* Title skeleton */}
				<div className="h-5 lg:h-[18px] 2xl:h-6 bg-neutral-200 rounded w-40 lg:w-40 2xl:w-48 animate-pulse"></div>
				{/* Description skeleton */}
				<div className="h-3.5 lg:h-3.5 2xl:h-4 bg-neutral-200 rounded w-64 lg:w-64 2xl:w-80 animate-pulse mt-0.5 lg:mt-0.5 2xl:mt-1"></div>
			</div>

			{showButton && (
				<div className="h-8 lg:h-8 2xl:h-9 bg-neutral-200 rounded w-20 lg:w-20 2xl:w-24 animate-pulse"></div>
			)}
		</div>
	)
}

export default EditorHeaderSkeleton
