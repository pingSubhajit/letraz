'use client'

import {cn} from '@/lib/utils'
import ResumeViewerSkeleton from '@/components/skeletons/ResumeViewerSkeleton'
import PersonalDetailsEditorSkeleton from '@/components/skeletons/PersonalDetailsEditorSkeleton'

interface ResumeViewSkeletonProps {
  className?: string
}

const ResumeViewSkeleton = ({className}: ResumeViewSkeletonProps) => {
	return (
		<div className={cn('flex h-screen', className)} role="main">
			{/* Resume viewer skeleton */}
			<div className="shadow-2xl bg-neutral-50 size-a4 max-h-screen relative">
				<ResumeViewerSkeleton className="max-h-screen" />
			</div>

			{/* Resume editor skeleton */}
			<div className="size-full bg-neutral-50 p-12">
				<PersonalDetailsEditorSkeleton />
			</div>
		</div>
	)
}

export default ResumeViewSkeleton
