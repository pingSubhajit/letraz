'use client'

import {format} from 'date-fns'
import * as React from 'react'

import {Button} from '@/components/ui/button'
import {Calendar} from '@/components/ui/calendar'
import {
	Popover,
	PopoverContent,
	PopoverTrigger
} from '@/components/ui/popover'
import {cn} from '@/lib/utils'
import {CalendarIcon} from 'lucide-react'
import {UseFormReturn} from 'react-hook-form'

export interface DatePickerProps {
    form: UseFormReturn<any>
    name: string
    label: string
    placeholder?: string
    disabled?: boolean
    className?: string
}

const DatePicker: React.FC<DatePickerProps> = ({
	form,
	label,
	name,
	className,
	disabled,
	placeholder
}) => {
	const {setValue, watch, formState: {errors}} = form
	const selectedDate = watch(name)
	const [date, setDate] = React.useState<Date | undefined>(selectedDate)

	// Update form value when date changes
	React.useEffect(() => {
		setValue(name, date, {shouldValidate: true})
	}, [date, name, setValue])

	// Memoize formatted date
	const formattedDate = React.useMemo(() => {
		return date ? format(date, 'PPP') : placeholder || 'Pick a date'
	}, [date, placeholder])

	return (
		<div className={cn('flex flex-col', className)}>
			<label className="mb-2 text-sm font-medium">{label}</label>
			<Popover>
				<PopoverTrigger asChild>
					<Button
						variant="outline"
						className={cn(
							'w-[240px] justify-start text-left font-normal',
							!date && 'text-muted-foreground'
						)}
						aria-label="Pick a date"
						disabled={disabled}
					>
						<CalendarIcon className="mr-2 h-4 w-4" />
						{formattedDate}
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-auto p-0" align="start">
					<Calendar
						mode="single"
						selected={date}
						onSelect={setDate}
						autoFocus
					/>
				</PopoverContent>
			</Popover>
			{errors[name] && (
				<p className="mt-1 text-sm text-red-600">
					{errors[name]?.message as string}
				</p>
			)}
		</div>
	)
}

export default DatePicker
