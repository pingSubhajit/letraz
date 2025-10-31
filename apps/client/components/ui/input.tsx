import * as React from 'react'

import {cn} from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
	({className, type, ...props}, ref) => {
		return (
			<input
				type={type}
				className={cn(
					'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ' +
					'ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium ' +
					'placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 ' +
					'focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed ' +
					'disabled:opacity-50',
					className
				)}
				ref={ref}
				{...props}
			/>
		)
	}
)
Input.displayName = 'Input'

const BrandedInput = React.forwardRef<HTMLInputElement, InputProps>(
	({className, type, ...props}, ref) => {
		return (
			<Input
				type={type}
				className={cn(
					'bg-white h-12 border-input/75 transition',
					'hover:border-input/50 focus-visible:border-input/50 hover:shadow-subtle placeholder:opacity-50 placeholder:font-medium',
					className
				)}
				ref={ref}
				{...props}
			/>
		)
	}
)
BrandedInput.displayName = 'BrandedInput'

export {Input, BrandedInput}
