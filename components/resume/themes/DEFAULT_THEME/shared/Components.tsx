import {ReactNode} from 'react'
import {cn} from '@/lib/utils'

export const Divider = ({className}: { className?: string }) => (
	<div className={cn('h-[0.5px] bg-primary w-full', className)}/>
)

export const SectionTitle = ({children, className}: {children: ReactNode, className?: string}) => (
	<p className={cn('text-base font-semibold uppercase', className)}>{children}</p>
)
