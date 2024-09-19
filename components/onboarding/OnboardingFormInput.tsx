'use client'

import {Input, InputProps} from '@/components/ui/input'
import {useState} from 'react'
import {FormControl, useFormField} from '@/components/ui/form'
import {cn} from '@/lib/utils'
import {motion} from 'framer-motion'
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select'
import {SelectValueProps} from '@radix-ui/react-select'
import {Textarea, TextareaProps} from '@/components/ui/textarea'

const OnboardingFormInput = ({ className, type, ...props }: InputProps) => {
	const [fieldState, setFieldState] = useState<'idle' | 'hover' | 'focus' | 'error'>('idle')
	const { error } = useFormField()

	return (
		<div className={cn('relative mb-2', className)}>
			<FormControl>
				<Input
					className="text-3xl font-bold italic px-0 py-2 h-auto border-0 ring-0 border-b-2"
					{...props}
					onFocus={() => setFieldState('focus')}
					onBlur={() => setFieldState('idle')}
					onMouseEnter={() => {
						if (fieldState !== 'focus') setFieldState('hover')
					}}
					onMouseLeave={() => {
						if (fieldState !== 'focus') setFieldState('idle')
					}}
				/>
			</FormControl>

			<motion.div
				initial={{width: 0}} animate={{width: fieldState === 'focus' ? '100%' : fieldState === 'hover' ? '50%' : 0}}
				className="absolute w-0 h-[1px] inset-x-0 bottom-0 bg-primary origin-left"
			/>

			<motion.div
				initial={{width: 0}}
				animate={{width: error ? '100%' : 0}}
				className="absolute w-0 h-[1px] inset-x-0 bottom-0 bg-red-500 origin-left"
			/>
		</div>
	)
}

const OnboardingFormTextArea = ({ className, ...props }: TextareaProps) => {
	const [fieldState, setFieldState] = useState<'idle' | 'hover' | 'focus' | 'error'>('idle')
	const { error } = useFormField()

	return (
		<div className="relative mb-2">
			<FormControl>
				<Textarea
					className={cn('text-3xl font-bold italic px-0 py-2 h-auto border-0 ring-0 border-b-2 resize-none text-lg', className)}
					{...props}
					onFocus={() => setFieldState('focus')}
					onBlur={() => setFieldState('idle')}
					onMouseEnter={() => {
						if (fieldState !== 'focus') setFieldState('hover')
					}}
					onMouseLeave={() => {
						if (fieldState !== 'focus') setFieldState('idle')
					}}
				/>
			</FormControl>

			<motion.div
				initial={{width: 0}} animate={{width: fieldState === 'focus' ? '100%' : fieldState === 'hover' ? '50%' : 0}}
				className="absolute w-0 h-[1px] inset-x-0 bottom-0 bg-primary origin-left"
			/>

			<motion.div
				initial={{width: 0}}
				animate={{width: error ? '100%' : 0}}
				className="absolute w-0 h-[1px] inset-x-0 bottom-0 bg-red-500 origin-left"
			/>
		</div>
	)
}

type OnboardingFormSelectProps = {
	value: string | undefined
	onChange: (value: string) => void
	options: string[]
	className?: string
} & SelectValueProps

const OnboardingFormSelect = ({ className, value, onChange, options, ...props }: OnboardingFormSelectProps) => {
	return (
		<Select onValueChange={onChange} defaultValue={value}>
			<FormControl>
				<SelectTrigger className={cn('text-xl font-bold italic px-0 py-2 h-auto border-0 ring-0 border-b-2 text-muted-foreground')}>
					<SelectValue {...props} />
				</SelectTrigger>
			</FormControl>
			<SelectContent>
				{options.map(option => (
					<SelectItem key={option} value={option}>{option}</SelectItem>
				))}
			</SelectContent>
		</Select>
	)
}

export {OnboardingFormInput, OnboardingFormTextArea, OnboardingFormSelect}
