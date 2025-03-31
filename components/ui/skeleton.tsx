import {cn} from '@/lib/utils'

const Skeleton = ({
	className,
	...props
}: React.HTMLAttributes<HTMLDivElement>) => (
	<div
		className={cn('animate-pulse rounded-md bg-neutral-300', className)}
		{...props}
	/>
)

export {Skeleton}
