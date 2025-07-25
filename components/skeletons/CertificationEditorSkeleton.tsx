'use client'

import {cn} from '@/lib/utils'
import EditorHeaderSkeleton from '@/components/skeletons/shared/EditorHeaderSkeleton'
import ItemCardSkeleton from '@/components/skeletons/shared/ItemCardSkeleton'

interface CertificationEditorSkeletonProps {
  className?: string
  itemCount?: number
}

const CertificationEditorSkeleton = ({className, itemCount = 2}: CertificationEditorSkeletonProps) => {
	return (
		<div className={cn('space-y-6', className)}>
			<EditorHeaderSkeleton />

			{/* Certification items list */}
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

export default CertificationEditorSkeleton
