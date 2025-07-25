'use client'

import {cn} from '@/lib/utils'
import PersonalDetailsEditorSkeleton from '@/components/skeletons/PersonalDetailsEditorSkeleton'
import EditorHeaderSkeleton from '@/components/skeletons/shared/EditorHeaderSkeleton'

interface ResumeEditorSkeletonProps {
  className?: string
  activeTab?: 'profile' | 'education' | 'experience' | 'skills' | 'certifications' | 'projects'
}

const ResumeEditorSkeleton = ({className, activeTab = 'profile'}: ResumeEditorSkeletonProps) => {
	// Tab data matching ResumeEditor structure
	const tabs = [
		{title: 'Profile', id: 'profile'},
		{title: 'Education', id: 'education'},
		{title: 'Experience', id: 'experience'},
		{title: 'Skills', id: 'skills'},
		{title: 'Certifications', id: 'certifications'},
		{title: 'Projects', id: 'projects'}
	]

	return (
		<div className={cn('p-6', className)}>
			{/* Traditional tabs skeleton - matching ResumeEditor design */}
			<div className="grid grid-cols-6 h-12 p-1 rounded-xl border bg-neutral-100 mb-6">
				{tabs.map((tab, index) => (
					<div key={tab.id} className={cn(
						'flex items-center justify-center gap-2 p-2 rounded-lg transition-all',
						activeTab === tab.id
							? 'bg-white shadow-md border-0'
							: 'hover:bg-white/60'
					)}>
						{/* Icon skeleton */}
						<div className={cn(
							'h-4 w-4 rounded animate-pulse',
							activeTab === tab.id ? 'bg-orange-200' : 'bg-neutral-200'
						)}></div>
						{/* Tab title skeleton */}
						<div className={cn(
							'h-4 rounded animate-pulse hidden sm:block',
							// Active tab should be highlighted
							activeTab === tab.id ? 'bg-orange-200' : 'bg-neutral-200',
							// Different widths for different tab names
							tab.title === 'Profile' ? 'w-12' :
								tab.title === 'Education' ? 'w-16' :
									tab.title === 'Experience' ? 'w-16' :
										tab.title === 'Skills' ? 'w-10' :
											tab.title === 'Certifications' ? 'w-20' : 'w-14'
						)}></div>
					</div>
				))}
			</div>

			{/* Tab content skeleton */}
			<div className="mt-6">
				<EditorHeaderSkeleton />
				<PersonalDetailsEditorSkeleton />
			</div>
		</div>
	)
}

export default ResumeEditorSkeleton
