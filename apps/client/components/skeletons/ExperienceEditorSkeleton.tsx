'use client'

import EditorListSkeleton from '@/components/skeletons/shared/EditorListSkeleton'

interface ExperienceEditorSkeletonProps {
  className?: string
  itemCount?: number
}

const ExperienceEditorSkeleton = ({className, itemCount = 2}: ExperienceEditorSkeletonProps) => {
	return (
		<EditorListSkeleton
			className={className}
			itemCount={itemCount}
			ariaLabel="Loading experience items"
		/>
	)
}

export default ExperienceEditorSkeleton
