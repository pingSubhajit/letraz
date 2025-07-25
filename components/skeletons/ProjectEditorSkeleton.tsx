'use client'

import EditorListSkeleton from '@/components/skeletons/shared/EditorListSkeleton'

interface ProjectEditorSkeletonProps {
  className?: string
  itemCount?: number
}

const ProjectEditorSkeleton = ({className, itemCount = 2}: ProjectEditorSkeletonProps) => {
	return (
		<EditorListSkeleton
			className={className}
			itemCount={itemCount}
			ariaLabel="Loading project items"
		/>
	)
}

export default ProjectEditorSkeleton
