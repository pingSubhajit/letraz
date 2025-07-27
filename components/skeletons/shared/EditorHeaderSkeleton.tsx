'use client'

import {cn} from '@/lib/utils'

interface EditorHeaderSkeletonProps {
  className?: string
  showButton?: boolean
}

const EditorHeaderSkeleton = ({className, showButton = true}: EditorHeaderSkeletonProps) => {
	return (
		<div className={cn('mb-6 flex items-center justify-between', className)}>
			<div className="flex flex-col gap-1">
				{/* Title skeleton */}
				<div className="h-6 bg-neutral-200 rounded w-48 animate-pulse"></div>
				{/* Description skeleton */}
				<div className="h-4 bg-neutral-200 rounded w-80 animate-pulse mt-1"></div>
			</div>

			{showButton && (
				<div className="h-9 bg-neutral-200 rounded w-24 animate-pulse"></div>
			)}
		</div>
	)
}

export default EditorHeaderSkeleton
