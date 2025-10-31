import {cn} from '@/lib/utils'

interface ResumeCardSkeletonProps {
	className?: string
	isBase?: boolean
}

const ResumeCardSkeleton = ({className, isBase = false}: ResumeCardSkeletonProps) => {
	return (
		<div className={cn(
			'h-96 w-full rounded-lg overflow-hidden border bg-white flex flex-col',
			isBase && 'border-2 border-flame-400',
			className
		)}>
			{/* Thumbnail area */}
			<div className="flex-1 bg-neutral-100 animate-pulse" />
			{/* Bottom section */}
			<div className={cn('p-3 border-t', isBase && 'bg-flame-500')}>
				<div className="flex items-center gap-2 justify-between">
					<div className="text-sm flex flex-col min-w-0 space-y-2">
						<div className={cn(
							'h-4 rounded animate-pulse w-32',
							isBase ? 'bg-white/30' : 'bg-neutral-100'
						)} />
						<div className={cn(
							'h-3 rounded animate-pulse w-24',
							isBase ? 'bg-white/20' : 'bg-neutral-100'
						)} />
					</div>
				</div>
			</div>
		</div>
	)
}

export default ResumeCardSkeleton
