'use client'

import {cn} from '@/lib/utils'
import EditorHeaderSkeleton from '@/components/skeletons/shared/EditorHeaderSkeleton'
import ItemCardSkeleton from '@/components/skeletons/shared/ItemCardSkeleton'

interface ExperienceEditorSkeletonProps {
  className?: string
  itemCount?: number
}

const ExperienceEditorSkeleton = ({className, itemCount = 2}: ExperienceEditorSkeletonProps) => {
	return (
		<div className={cn('space-y-6', className)}>
			<EditorHeaderSkeleton />

			{/* Experience items list */}
			<div className="space-y-4">
				{Array.from({length: itemCount}).map((_, index) => (
					<ItemCardSkeleton
						key={index}
						contentLines={3}
						className="space-y-1"
					/>
				))}
			</div>
		</div>
	)
}

export default ExperienceEditorSkeleton
