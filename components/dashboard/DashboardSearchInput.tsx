'use client'

import {useState} from 'react'
import {cn} from '@/lib/utils'
import {motion} from 'motion/react'
import {Input} from '@/components/ui/input'

interface DashboardSearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

const DashboardSearchInput = ({
	value,
	onChange,
	placeholder = 'Search your resumes . . .',
	className
}: DashboardSearchInputProps) => {
	const [fieldState, setFieldState] = useState<'idle' | 'hover' | 'focus'>('idle')

	return (
		<div className={cn('relative mb-2', className)}>
			<div className="relative w-1/2">
				<Input
					className="text-xl font-medium px-0 py-2 h-auto border-0 ring-0 border-b-2"
					type="text"
					value={value}
					onChange={(e) => onChange(e.target.value)}
					placeholder={placeholder}
					onFocus={() => setFieldState('focus')}
					onBlur={() => setFieldState('idle')}
					onMouseEnter={() => {
						if (fieldState !== 'focus') setFieldState('hover')
					}}
					onMouseLeave={() => {
						if (fieldState !== 'focus') setFieldState('idle')
					}}
				/>

				<motion.div
					initial={{width: 0}}
					animate={{width: fieldState === 'focus' ? '100%' : fieldState === 'hover' ? '50%' : 0}}
					className="absolute w-0 h-[1px] inset-x-0 bottom-0 bg-primary origin-left"
				/>
			</div>
		</div>
	)
}

export default DashboardSearchInput
