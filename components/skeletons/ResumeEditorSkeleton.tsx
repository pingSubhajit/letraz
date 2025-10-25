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
		<div className={cn('p-4 lg:p-4 2xl:p-6', className)}>
			{/* Traditional tabs skeleton - matching ResumeEditor design */}
			<div className="grid grid-cols-6 h-10 lg:h-10 2xl:h-12 p-0.5 lg:p-0.5 2xl:p-1 rounded-xl border bg-neutral-100 mb-4 lg:mb-4 2xl:mb-6">
				{tabs.map((tab, index) => (
					<div key={tab.id} className={cn(
						'flex items-center justify-center gap-1.5 lg:gap-1.5 2xl:gap-2 p-1.5 lg:p-1.5 2xl:p-2 rounded-lg transition-all',
						activeTab === tab.id
							? 'bg-white shadow-md border-0'
							: 'hover:bg-white/60'
					)}>
						{/* Icon skeleton */}
						<div className={cn(
							'h-3.5 w-3.5 lg:h-3.5 lg:w-3.5 2xl:h-4 2xl:w-4 rounded animate-pulse',
							activeTab === tab.id ? 'bg-orange-200' : 'bg-neutral-200'
						)}></div>
						{/* Tab title skeleton */}
						<div className={cn(
							'h-3 lg:h-3 2xl:h-4 rounded animate-pulse hidden sm:block',
							// Active tab should be highlighted
							activeTab === tab.id ? 'bg-orange-200' : 'bg-neutral-200',
							// Different widths for different tab names
							tab.title === 'Profile' ? 'w-10 lg:w-10 2xl:w-12' :
								tab.title === 'Education' ? 'w-12 lg:w-12 2xl:w-16' :
									tab.title === 'Experience' ? 'w-12 lg:w-12 2xl:w-16' :
										tab.title === 'Skills' ? 'w-8 lg:w-8 2xl:w-10' :
											tab.title === 'Certifications' ? 'w-16 lg:w-16 2xl:w-20' : 'w-10 lg:w-10 2xl:w-14'
						)}></div>
					</div>
				))}
			</div>

			{/* Tab content skeleton */}
			<div className="mt-4 lg:mt-4 2xl:mt-6">
				<EditorHeaderSkeleton />
				<PersonalDetailsEditorSkeleton />
			</div>
		</div>
	)
}

export default ResumeEditorSkeleton
