'use client'

import {cn} from '@/lib/utils'

interface FormSkeletonProps {
  className?: string
  fields?: number
  showButtons?: boolean
}

const FormSkeleton = ({className, fields = 6, showButtons = true}: FormSkeletonProps) => {
	return (
		<div className={cn('space-y-6', className)}>
			{/* Form fields */}
			<div className="space-y-4">
				{Array.from({length: fields}).map((_, index) => (
					<div key={index} className="space-y-2">
						{/* Field label */}
						<div className="h-4 bg-neutral-200 rounded w-24 animate-pulse"></div>
						{/* Field input */}
						<div className="h-12 bg-neutral-200 rounded w-full animate-pulse"></div>
					</div>
				))}
			</div>

			{showButtons && (
				<div className="flex gap-3 pt-4">
					{/* Cancel button */}
					<div className="h-10 bg-neutral-200 rounded w-20 animate-pulse"></div>
					{/* Submit button */}
					<div className="h-10 bg-neutral-200 rounded w-24 animate-pulse"></div>
				</div>
			)}
		</div>
	)
}

export default FormSkeleton
