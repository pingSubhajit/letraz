'use client'

import {cn} from '@/lib/utils'
import PersonalDetailsEditorSkeleton from '@/components/skeletons/PersonalDetailsEditorSkeleton'

interface ResumeEditorSkeletonProps {
  className?: string
  activeTab?: 'profile' | 'education' | 'experience' | 'skills' | 'certifications' | 'projects'
}

const ResumeEditorSkeleton = ({className, activeTab = 'profile'}: ResumeEditorSkeletonProps) => {
	return (
		<div className={cn('p-6', className)}>
			{/* Tabs skeleton */}
			<div className="mb-6 grid grid-cols-6 h-12 p-1 rounded-xl border bg-neutral-100">
				{Array.from({length: 6}).map((_, index) => (
					<div key={index} className="flex items-center justify-center gap-2 p-2">
						<div className="h-4 w-4 bg-neutral-200 rounded animate-pulse"></div>
						<div className="h-4 bg-neutral-200 rounded w-16 animate-pulse hidden sm:block"></div>
					</div>
				))}
			</div>

			{/* Editor content skeleton */}
			<div className="mt-6">
				<PersonalDetailsEditorSkeleton />
			</div>
		</div>
	)
}

export default ResumeEditorSkeleton
