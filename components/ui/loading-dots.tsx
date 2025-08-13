import {cn} from '@/lib/utils'

type LoadingDotsProps = {
    className?: string
    dotClassName?: string
}

const LoadingDots = ({className, dotClassName}: LoadingDotsProps) => {
	return (
		<div className={cn('flex items-center justify-center space-x-2', className)}>
			<div className={cn('bg-primary h-5 w-5 animate-bounce rounded-full [animation-delay:-0.3s]', dotClassName)}></div>
			<div className={cn('bg-primary h-5 w-5 animate-bounce rounded-full [animation-delay:-0.13s]', dotClassName)}></div>
			<div className={cn('bg-primary h-5 w-5 animate-bounce rounded-full', dotClassName)}></div>
		</div>
	)
}

export default LoadingDots
