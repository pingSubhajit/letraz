'use client'

import {cn} from '@/lib/utils'

interface ItemCardSkeletonProps {
  className?: string
  showActions?: boolean
  contentLines?: number
}

const ItemCardSkeleton = ({className, showActions = true, contentLines = 3}: ItemCardSkeletonProps) => {
	return (
		<div className={cn('flex items-start justify-between p-4 rounded-lg border bg-card', className)}>
			<div className="space-y-2 flex-1">
				{/* Main title line */}
				<div className="h-5 bg-neutral-200 rounded w-3/4 animate-pulse"></div>

				{/* Additional content lines */}
				{Array.from({length: Math.max(0, contentLines - 1)}).map((_, index) => (
					<div
						key={index}
						className={cn(
							'h-4 bg-neutral-200 rounded animate-pulse',
							index === 0 ? 'w-1/2' : 'w-2/3'
						)}
					></div>
				))}
			</div>

			{showActions && (
				<div className="flex gap-2 ml-4">
					{/* Edit button skeleton */}
					<div className="h-8 w-8 bg-neutral-200 rounded animate-pulse"></div>
					{/* Delete button skeleton */}
					<div className="h-8 w-8 bg-neutral-200 rounded animate-pulse"></div>
				</div>
			)}
		</div>
	)
}

export default ItemCardSkeleton
