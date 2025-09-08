import * as React from 'react'
import {Slot} from '@radix-ui/react-slot'
import {cva, type VariantProps} from 'class-variance-authority'

import {cn} from '@/lib/utils'

const buttonVariants = cva(
	'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background ' +
	'transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ' +
	'focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ',
	{
		variants: {
			variant: {
				default: 'bg-flame-500 text-primary-foreground hover:bg-flame-500/90',
				destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
				outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
				secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
				ghost: 'hover:bg-accent hover:text-accent-foreground',
				link: 'text-primary underline-offset-4 hover:underline'
			},
			size: {
				default: 'h-10 px-4 py-2',
				sm: 'h-9 rounded-md px-3',
				lg: 'h-11 rounded-md px-8',
				icon: 'h-10 w-10'
			},
			animation: {
				default: 'hover:-translate-y-0.5',
				subtle: 'hover:[&>*]text-flame-500 hover:bg-transparent'
			}
		},
		defaultVariants: {
			variant: 'default',
			size: 'default',
			animation: 'default'
		}
	}
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	({className, variant, size, animation, asChild = false, type = 'button', ...props}, ref) => {
		const Comp = asChild ? Slot : 'button'
		return (
			<Comp
				className={cn(buttonVariants({variant, size, animation, className}))}
				ref={ref}
				type={type}
				{...props}
			/>
		)
	}
)
Button.displayName = 'Button'

export {Button, buttonVariants}
