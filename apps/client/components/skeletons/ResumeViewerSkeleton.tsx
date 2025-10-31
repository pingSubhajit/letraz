'use client'

import {cn} from '@/lib/utils'

interface ResumeViewerSkeletonProps {
  className?: string
}

const ResumeViewerSkeleton = ({className}: ResumeViewerSkeletonProps) => {
	return (
		<div className={cn('size-a4 resume relative overflow-y-hidden bg-white p-14', className)}>
			{/* Header section with personal info */}
			<div className="mb-8 space-y-4">
				{/* Name */}
				<div className="h-8 bg-neutral-200 rounded w-64 animate-pulse"></div>

				{/* Contact info */}
				<div className="flex flex-wrap gap-4">
					<div className="h-4 bg-neutral-200 rounded w-32 animate-pulse"></div>
					<div className="h-4 bg-neutral-200 rounded w-28 animate-pulse"></div>
					<div className="h-4 bg-neutral-200 rounded w-36 animate-pulse"></div>
				</div>

				{/* Bio */}
				<div className="space-y-2">
					<div className="h-4 bg-neutral-200 rounded w-full animate-pulse"></div>
					<div className="h-4 bg-neutral-200 rounded w-4/5 animate-pulse"></div>
					<div className="h-4 bg-neutral-200 rounded w-3/4 animate-pulse"></div>
				</div>
			</div>

			{/* Resume sections */}
			<div className="space-y-6">
				{/* Experience section */}
				<div className="space-y-3">
					<div className="h-5 bg-neutral-200 rounded w-24 animate-pulse"></div>
					<div className="border-b border-neutral-200"></div>

					{/* Experience items */}
					<div className="space-y-4">
						{Array.from({length: 2}).map((_, index) => (
							<div key={index} className="space-y-2">
								<div className="flex justify-between items-start">
									<div className="h-4 bg-neutral-200 rounded w-48 animate-pulse"></div>
									<div className="h-3 bg-neutral-200 rounded w-20 animate-pulse"></div>
								</div>
								<div className="h-3 bg-neutral-200 rounded w-32 animate-pulse"></div>
								<div className="space-y-1">
									<div className="h-3 bg-neutral-200 rounded w-full animate-pulse"></div>
									<div className="h-3 bg-neutral-200 rounded w-4/5 animate-pulse"></div>
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Education section */}
				<div className="space-y-3">
					<div className="h-5 bg-neutral-200 rounded w-20 animate-pulse"></div>
					<div className="border-b border-neutral-200"></div>

					{/* Education items */}
					<div className="space-y-3">
						{Array.from({length: 2}).map((_, index) => (
							<div key={index} className="space-y-1">
								<div className="flex justify-between items-start">
									<div className="h-4 bg-neutral-200 rounded w-40 animate-pulse"></div>
									<div className="h-3 bg-neutral-200 rounded w-16 animate-pulse"></div>
								</div>
								<div className="h-3 bg-neutral-200 rounded w-36 animate-pulse"></div>
							</div>
						))}
					</div>
				</div>

				{/* Skills section */}
				<div className="space-y-3">
					<div className="h-5 bg-neutral-200 rounded w-16 animate-pulse"></div>
					<div className="border-b border-neutral-200"></div>

					{/* Skills list */}
					<div className="flex flex-wrap gap-2">
						{Array.from({length: 8}).map((_, index) => (
							<div key={index} className="h-6 bg-neutral-200 rounded-full w-20 animate-pulse"></div>
						))}
					</div>
				</div>
			</div>
		</div>
	)
}

export default ResumeViewerSkeleton
