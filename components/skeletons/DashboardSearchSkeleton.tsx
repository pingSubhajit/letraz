import ResumeCardSkeleton from '@/components/skeletons/ResumeCardSkeleton'

const DashboardSearchSkeleton = () => {
	return (
		<>
			{/* Search bar skeleton */}
			<div className="mb-10 px-8">
				<div className="relative mb-2">
					<div className="h-10 bg-neutral-100 rounded animate-pulse w-full max-w-md" />
					<div className="absolute left-0 h-[2px] bottom-0 bg-neutral-200 w-full" />
				</div>
			</div>

			{/* Resume grid skeleton */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8 px-8">
				{Array.from({length: 4}).map((_, i) => (
					<ResumeCardSkeleton key={i} />
				))}
			</div>
		</>
	)
}

export default DashboardSearchSkeleton