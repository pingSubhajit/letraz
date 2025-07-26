'use client'

import EditorListSkeleton from '@/components/skeletons/shared/EditorListSkeleton'

interface EducationEditorSkeletonProps {
  className?: string
  itemCount?: number
}

const EducationEditorSkeleton = ({className, itemCount = 2}: EducationEditorSkeletonProps) => {
	return (
		<EditorListSkeleton
			className={className}
			itemCount={itemCount}
			ariaLabel="Loading education items"
		/>
	)
}

export default EducationEditorSkeleton
