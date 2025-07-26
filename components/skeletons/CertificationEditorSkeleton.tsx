'use client'

import EditorListSkeleton from '@/components/skeletons/shared/EditorListSkeleton'

interface CertificationEditorSkeletonProps {
  className?: string
  itemCount?: number
}

const CertificationEditorSkeleton = ({className, itemCount = 2}: CertificationEditorSkeletonProps) => {
	return (
		<EditorListSkeleton
			className={className}
			itemCount={itemCount}
			ariaLabel="Loading certification items"
		/>
	)
}

export default CertificationEditorSkeleton
