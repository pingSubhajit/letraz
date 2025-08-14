import {cn} from '@/lib/utils'

type LoadingDotsProps = {
    className?: string
    dotClassName?: string
}

const LoadingDots = ({className, dotClassName}: LoadingDotsProps) => {
	return (
		<div role="status" aria-live="polite" className={cn('flex items-center justify-center space-x-2', className)}>
			<span className="sr-only">Loading…</span>
			<div aria-hidden="true" className={cn('bg-primary h-5 w-5 motion-safe:animate-bounce motion-reduce:animate-none rounded-full [animation-delay:-0.3s] motion-reduce:[animation-delay:0s]', dotClassName)}></div>
			<div aria-hidden="true" className={cn('bg-primary h-5 w-5 motion-safe:animate-bounce motion-reduce:animate-none rounded-full [animation-delay:-0.13s] motion-reduce:[animation-delay:0s]', dotClassName)}></div>
			<div aria-hidden="true" className={cn('bg-primary h-5 w-5 motion-safe:animate-bounce motion-reduce:animate-none rounded-full', dotClassName)}></div>
		</div>
	)
}

export default LoadingDots
