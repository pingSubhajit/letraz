'use client'

import {cn} from '@/lib/utils'
import ItemCardSkeleton from '@/components/skeletons/shared/ItemCardSkeleton'

interface EditorListSkeletonProps {
  className?: string
  itemCount?: number
  contentLines?: number
  ariaLabel?: string
  itemClassName?: string
}

const EditorListSkeleton = ({
	className,
	itemCount = 2,
	contentLines = 3,
	ariaLabel = 'Loading items',
	itemClassName = 'space-y-1'
}: EditorListSkeletonProps) => {
	return (
		<div className={cn('space-y-6', className)} role="status" aria-label={ariaLabel}>
			<div className="space-y-4" aria-hidden="true">
				{Array.from({length: itemCount}).map((_, index) => (
					<ItemCardSkeleton
						key={index}
						contentLines={contentLines}
						className={itemClassName}
					/>
				))}
			</div>
		</div>
	)
}

export default EditorListSkeleton
