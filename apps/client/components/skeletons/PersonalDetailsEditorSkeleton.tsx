'use client'

import {cn} from '@/lib/utils'

interface PersonalDetailsEditorSkeletonProps {
  className?: string
}

const PersonalDetailsEditorSkeleton = ({className}: PersonalDetailsEditorSkeletonProps) => {
	return (
		<div className={cn('space-y-6', className)}>
			{/* Main content card skeleton */}
			<div className="flex items-start justify-between p-4 rounded-lg border bg-card">
				<div className="space-y-6 p-4 flex-1">
					{/* Header Section with avatar and name */}
					<div className="flex items-center space-x-3">
						<div className="w-12 h-12 bg-neutral-200 rounded-full animate-pulse"></div>
						<div className="space-y-2">
							<div className="h-5 bg-neutral-200 rounded w-48 animate-pulse"></div>
							<div className="h-4 bg-neutral-200 rounded w-32 animate-pulse"></div>
						</div>
					</div>

					{/* Contact Information Grid */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{/* Email */}
						<div className="flex items-center space-x-3">
							<div className="w-8 h-8 bg-neutral-200 rounded-lg animate-pulse"></div>
							<div className="space-y-1 flex-1">
								<div className="h-3 bg-neutral-200 rounded w-12 animate-pulse"></div>
								<div className="h-4 bg-neutral-200 rounded w-40 animate-pulse"></div>
							</div>
						</div>

						{/* Phone */}
						<div className="flex items-center space-x-3">
							<div className="w-8 h-8 bg-neutral-200 rounded-lg animate-pulse"></div>
							<div className="space-y-1 flex-1">
								<div className="h-3 bg-neutral-200 rounded w-12 animate-pulse"></div>
								<div className="h-4 bg-neutral-200 rounded w-32 animate-pulse"></div>
							</div>
						</div>

						{/* Date of Birth */}
						<div className="flex items-center space-x-3">
							<div className="w-8 h-8 bg-neutral-200 rounded-lg animate-pulse"></div>
							<div className="space-y-1 flex-1">
								<div className="h-3 bg-neutral-200 rounded w-20 animate-pulse"></div>
								<div className="h-4 bg-neutral-200 rounded w-24 animate-pulse"></div>
							</div>
						</div>

						{/* Website */}
						<div className="flex items-center space-x-3">
							<div className="w-8 h-8 bg-neutral-200 rounded-lg animate-pulse"></div>
							<div className="space-y-1 flex-1">
								<div className="h-3 bg-neutral-200 rounded w-16 animate-pulse"></div>
								<div className="h-4 bg-neutral-200 rounded w-36 animate-pulse"></div>
							</div>
						</div>
					</div>

					{/* Address Section */}
					<div className="flex items-start space-x-3">
						<div className="w-8 h-8 bg-neutral-200 rounded-lg animate-pulse mt-1"></div>
						<div className="space-y-2 flex-1">
							<div className="h-3 bg-neutral-200 rounded w-16 animate-pulse"></div>
							<div className="space-y-1">
								<div className="h-4 bg-neutral-200 rounded w-56 animate-pulse"></div>
								<div className="h-4 bg-neutral-200 rounded w-44 animate-pulse"></div>
							</div>
						</div>
					</div>

					{/* Bio Section */}
					<div className="flex items-start space-x-3">
						<div className="w-8 h-8 bg-neutral-200 rounded-lg animate-pulse mt-1"></div>
						<div className="space-y-2 flex-1">
							<div className="h-3 bg-neutral-200 rounded w-32 animate-pulse"></div>
							<div className="space-y-1">
								<div className="h-4 bg-neutral-200 rounded w-full animate-pulse"></div>
								<div className="h-4 bg-neutral-200 rounded w-4/5 animate-pulse"></div>
								<div className="h-4 bg-neutral-200 rounded w-3/4 animate-pulse"></div>
							</div>
						</div>
					</div>
				</div>

				{/* Edit button */}
				<div className="flex gap-2">
					<div className="h-8 w-8 bg-neutral-200 rounded animate-pulse"></div>
				</div>
			</div>
		</div>
	)
}

export default PersonalDetailsEditorSkeleton
