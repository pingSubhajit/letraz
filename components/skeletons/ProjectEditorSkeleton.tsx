'use client'

import {cn} from '@/lib/utils'
import ItemCardSkeleton from '@/components/skeletons/shared/ItemCardSkeleton'

interface ProjectEditorSkeletonProps {
  className?: string
  itemCount?: number
}

const ProjectEditorSkeleton = ({className, itemCount = 2}: ProjectEditorSkeletonProps) => {
	return (
		<div className={cn('space-y-6', className)}>
			{/* Project items list */}
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

export default ProjectEditorSkeleton
