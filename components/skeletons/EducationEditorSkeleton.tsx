'use client'

import {cn} from '@/lib/utils'
import EditorHeaderSkeleton from '@/components/skeletons/shared/EditorHeaderSkeleton'
import ItemCardSkeleton from '@/components/skeletons/shared/ItemCardSkeleton'

interface EducationEditorSkeletonProps {
  className?: string
  itemCount?: number
}

const EducationEditorSkeleton = ({className, itemCount = 2}: EducationEditorSkeletonProps) => {
	return (
		<div className={cn('space-y-6', className)}>
			<EditorHeaderSkeleton />

			{/* Education items list */}
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

export default EducationEditorSkeleton
