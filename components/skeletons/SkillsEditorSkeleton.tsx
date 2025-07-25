'use client'

import {cn} from '@/lib/utils'
import EditorHeaderSkeleton from '@/components/skeletons/shared/EditorHeaderSkeleton'

interface SkillsEditorSkeletonProps {
  className?: string
  categoryCount?: number
}

const SkillsEditorSkeleton = ({className, categoryCount = 3}: SkillsEditorSkeletonProps) => {
	return (
		<div className={cn('space-y-6', className)}>
			<EditorHeaderSkeleton />

			{/* Skills categories */}
			<div className="space-y-4">
				{Array.from({length: categoryCount}).map((_, categoryIndex) => (
					<div key={categoryIndex} className="border rounded-lg p-4">
						{/* Category header with collapse button */}
						<div className="flex items-center justify-between mb-3">
							<div className="h-5 bg-neutral-200 rounded w-32 animate-pulse"></div>
							<div className="h-6 w-6 bg-neutral-200 rounded animate-pulse"></div>
						</div>

						{/* Skills within category */}
						<div className="space-y-2">
							{Array.from({length: Math.floor(Math.random() * 4) + 2}).map((_, skillIndex) => (
								<div key={skillIndex} className="flex items-center justify-between p-2 rounded bg-neutral-50">
									<div className="flex items-center gap-2">
										<div className="h-6 bg-neutral-200 rounded-full w-16 animate-pulse"></div>
										<div className="h-4 bg-neutral-200 rounded w-24 animate-pulse"></div>
									</div>
									<div className="flex items-center gap-2">
										<div className="h-6 w-6 bg-neutral-200 rounded animate-pulse"></div>
										<div className="h-6 w-6 bg-neutral-200 rounded animate-pulse"></div>
									</div>
								</div>
							))}
						</div>
					</div>
				))}
			</div>
		</div>
	)
}

export default SkillsEditorSkeleton
