import {cn} from '@/lib/utils'
import {Children, cloneElement, ComponentProps, isValidElement, ReactElement} from 'react'

type ButtonGroupProps = {
	children: ReactElement | ReactElement[]
	className?: string
}

type ChildProps = ComponentProps<'button'> & {
	className?: string
}

const ButtonGroup = ({children, className}: ButtonGroupProps) => {
	return (
		<div className={cn('flex gap-1', className)}>
			{Children.map(children, (child, index) => {
				if (isValidElement<ChildProps>(child)) {
					const isFirst = index === 0
					const isLast = index === Children.count(children) - 1

					return cloneElement(child, {
						...child.props,
						className: cn(
							child.props.className,
							isFirst && 'rounded-l-full',
							isLast && 'rounded-r-full'
						)
					})
				}
				return child
			})}
		</div>
	)
}

export default ButtonGroup
