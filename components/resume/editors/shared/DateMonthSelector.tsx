'use client'

import React, {useState} from 'react'
import {Label} from '@/components/ui/label'
import {Checkbox} from '@/components/ui/checkbox'
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select'
import {Button} from '@/components/ui/button'
import {Popover, PopoverContent, PopoverTrigger} from '@/components/ui/popover'
import {EducationData} from '../../controllers/EducationController'

type Dates = EducationData['dates']

type DateMonthSelectorProps = {
  children: React.ReactNode;
  title?: string;
  description?: string;
  value?: Dates;
  onChange?: (dates:Dates) => void;
};

export const formatDateRange = (dates: any) => {
	if (!dates.hasDates) return 'Add dates'

	const getMonthAbbr = (month: number | null) => {
		if (!month) return ''
		const monthAbbr = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
			'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
		return monthAbbr[month - 1]
	}

	const startDate = dates.startMonth && dates.startYear
		? `${getMonthAbbr(dates.startMonth)} ${dates.startYear}`
		: (dates.startYear ? dates.startYear.toString() : 'Start')

	const endDate = dates.endMonth && dates.endYear
		? `${getMonthAbbr(dates.endMonth)} ${dates.endYear}`
		: (dates.endYear ? dates.endYear.toString() : 'Present')

	return `${startDate} – ${endDate}`
}


const DateMonthSelector: React.FC<DateMonthSelectorProps> = ({
	children,
	title = 'Date Range',
	description = 'Set the date range for this item.',
	value,
	onChange
}) => {
	const [isOpen, setIsOpen] = useState(false)
	const [tempDates, setTempDates] = useState<Dates>(value || {
		hasDates: true,
		startMonth: null,
		startYear: null,
		endMonth: null,
		endYear: null
	})

	const [isCurrentlyPursuing, setIsCurrentlyPursuing] = useState(
		value ? !value.endMonth && !value.endYear && value.hasDates : false
	)

	const months = [
		{value: 1, label: 'January'},
		{value: 2, label: 'February'},
		{value: 3, label: 'March'},
		{value: 4, label: 'April'},
		{value: 5, label: 'May'},
		{value: 6, label: 'June'},
		{value: 7, label: 'July'},
		{value: 8, label: 'August'},
		{value: 9, label: 'September'},
		{value: 10, label: 'October'},
		{value: 11, label: 'November'},
		{value: 12, label: 'December'}
	]

	const currentYear = new Date().getFullYear()
	const years = Array.from({length: 50}, (_, i) => currentYear - i)

	const updateTempDates = (newDates: Partial<typeof tempDates>) => {
		setTempDates(prev => ({...prev, ...newDates}))
	}

	const handleCurrentlyPursuingChange = (checked: boolean) => {
		setIsCurrentlyPursuing(checked)
		if (checked) {
			updateTempDates({endMonth: null, endYear: null})
		}
	}

	const handleClearRange = () => {
		const clearedDates = {
			hasDates: false,
			startMonth: null,
			startYear: null,
			endMonth: null,
			endYear: null
		}
		setTempDates(clearedDates)
		setIsCurrentlyPursuing(false)
	}

	const handleSave = () => {
		onChange?.(tempDates)
		setIsOpen(false)
	}

	const handleCancel = () => {
		// Reset to original value
		setTempDates(value || {
			hasDates: true,
			startMonth: null,
			startYear: null,
			endMonth: null,
			endYear: null
		})
		setIsCurrentlyPursuing(
			value ? !value.endMonth && !value.endYear && value.hasDates : false
		)
		setIsOpen(false)
	}

	const handleOpenChange = (open: boolean) => {
		setIsOpen(open)
		if (open) {
			// Reset temp state to current value when opening
			setTempDates(value || {
				hasDates: true,
				startMonth: null,
				startYear: null,
				endMonth: null,
				endYear: null
			})
			setIsCurrentlyPursuing(
				value ? !value.endMonth && !value.endYear && value.hasDates : false
			)
		}
	}

	return (
		<Popover open={isOpen} onOpenChange={handleOpenChange}>
			<PopoverTrigger asChild>
				{children}
			</PopoverTrigger>
			<PopoverContent className="w-80" align="start">
				<div className="space-y-4">
					<div className="space-y-2">
						<h4 className="font-medium leading-none">{title}</h4>
						<p className="text-sm text-muted-foreground">
							{description}
						</p>
					</div>

					<div className="space-y-4">
						{/* Start Date */}
						<div className="space-y-2">
							<Label className="text-sm font-medium">Start Date</Label>
							<div className="flex space-x-2">
								<Select
									value={tempDates.startMonth?.toString() || ''}
									onValueChange={(value) => updateTempDates({startMonth: parseInt(value), hasDates: true})}
								>
									<SelectTrigger className="w-full">
										<SelectValue placeholder="Month" />
									</SelectTrigger>
									<SelectContent>
										{months.map((month) => (
											<SelectItem key={month.value} value={month.value.toString()}>
												{month.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<Select
									value={tempDates.startYear?.toString() || ''}
									onValueChange={(value) => updateTempDates({startYear: parseInt(value), hasDates: true})}
								>
									<SelectTrigger className="w-full">
										<SelectValue placeholder="Year" />
									</SelectTrigger>
									<SelectContent>
										{years.map((year) => (
											<SelectItem key={year} value={year.toString()}>
												{year}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</div>

						{/* Currently Pursuing Checkbox */}
						<div className="flex items-center space-x-2">
							<Checkbox
								id="currentlyPursuing"
								checked={isCurrentlyPursuing}
								onCheckedChange={handleCurrentlyPursuingChange}
							/>
							<Label htmlFor="currentlyPursuing" className="text-sm font-medium">
								Currently pursuing
							</Label>
						</div>

						{/* End Date */}
						{!isCurrentlyPursuing && (
							<div className="space-y-2">
								<Label className="text-sm font-medium">End Date</Label>
								<div className="flex space-x-2">
									<Select
										value={tempDates.endMonth?.toString() || ''}
										onValueChange={(value) => updateTempDates({endMonth: parseInt(value), hasDates: true})}
										disabled={!tempDates.startYear}
									>
										<SelectTrigger className="w-full">
											<SelectValue placeholder={tempDates.startYear ? 'Month' : 'Select start year first'} />
										</SelectTrigger>
										<SelectContent>
											{months.map((month) => {
												// If same year as start, disable months before start month
												const isDisabled = tempDates.startYear && tempDates.endYear === tempDates.startYear &&
                                         tempDates.startMonth && month.value < tempDates.startMonth
												return (
													<SelectItem
														key={month.value}
														value={month.value.toString()}
														disabled={!!isDisabled}
													>
														{month.label}
													</SelectItem>
												)
											})}
										</SelectContent>
									</Select>
									<Select
										value={tempDates.endYear?.toString() || ''}
										onValueChange={(value) => {
											const newEndYear = parseInt(value)
											let updates: any = {endYear: newEndYear, hasDates: true}

											// If end year is same as start year and end month is before start month, clear end month
											if (tempDates.startYear === newEndYear &&
                          tempDates.startMonth && tempDates.endMonth &&
                          tempDates.endMonth < tempDates.startMonth) {
												updates.endMonth = null
											}

											updateTempDates(updates)
										}}
										disabled={!tempDates.startYear}
									>
										<SelectTrigger className="w-full">
											<SelectValue placeholder={tempDates.startYear ? 'Year' : 'Select start year first'} />
										</SelectTrigger>
										<SelectContent>
											{years.map((year) => {
												// Disable years before start year
												const isDisabled = tempDates.startYear && year < tempDates.startYear
												return (
													<SelectItem
														key={year}
														value={year.toString()}
														disabled={!!isDisabled}
													>
														{year}
													</SelectItem>
												)
											})}
										</SelectContent>
									</Select>
								</div>
							</div>
						)}

						{/* Clear Range Option */}
						<div className="pt-2 ">
							<Button
								variant="ghost"
								size="sm"
								onClick={handleClearRange}
								className="w-full text-red-500 hover:text-red-600"
							>
								Clear date range
							</Button>
						</div>
					</div>

					{/* Action Buttons */}
					<div className="flex justify-end space-x-2 pt-2">
						<Button variant="outline" size="sm" onClick={handleCancel}>
							Cancel
						</Button>
						<Button size="sm" onClick={handleSave}>
							Save
						</Button>
					</div>
				</div>
			</PopoverContent>
		</Popover>
	)
}


export default DateMonthSelector
