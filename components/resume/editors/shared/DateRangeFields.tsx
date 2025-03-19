'use client'

import {useEffect, useState} from 'react'
import {FormField, FormItem, FormLabel, FormControl, FormMessage} from '@/components/ui/form'
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select'
import {Checkbox} from '@/components/ui/checkbox'
import {months, years} from '@/constants'
import {AnimatePresence, motion} from 'framer-motion'
import {UseFormReturn} from 'react-hook-form'

interface DateRangeFieldsProps {
  form: UseFormReturn<any>
  isSubmitting?: boolean
  startMonthName?: string
  startYearName?: string
  endMonthName?: string
  endYearName?: string
  currentFieldName?: string
  currentLabel?: string
}

const DateRangeFields = ({
	form,
	isSubmitting = false,
	startMonthName = 'started_from_month',
	startYearName = 'started_from_year',
	endMonthName = 'finished_at_month',
	endYearName = 'finished_at_year',
	currentFieldName = 'current',
	currentLabel = 'I currently study here'
}: DateRangeFieldsProps) => {
	// Use useState to track the current checkbox state locally in addition to form state
	const [isCurrentLocal, setIsCurrentLocal] = useState(form.getValues(currentFieldName) || false);
	// Also watch the form value
	const isCurrent = form.watch(currentFieldName);

	// Keep local state in sync with form state
	useEffect(() => {
		setIsCurrentLocal(isCurrent);
	}, [isCurrent]);

	// Clear end date fields when "current" is checked
	useEffect(() => {
		if (isCurrentLocal) {
			form.setValue(endMonthName, null);
			form.setValue(endYearName, null);
		}
	}, [isCurrentLocal, form, endMonthName, endYearName]);

	// Handle checkbox change
	const handleCurrentChange = (checked: boolean) => {
		// Update local state
		setIsCurrentLocal(checked);
		
		// Update form state with all needed flags
		form.setValue(currentFieldName, checked, { 
			shouldValidate: true,
			shouldDirty: true,
			shouldTouch: true
		});
	};

	return (
		<>
			<div className="grid grid-cols-4 gap-4">
				<FormField
					control={form.control}
					name={startMonthName}
					render={({field}) => (
						<FormItem>
							<FormLabel className="text-foreground">Start Month</FormLabel>
							<Select onValueChange={field.onChange} value={field.value || ''} disabled={isSubmitting}>
								<FormControl>
									<SelectTrigger>
										<SelectValue placeholder="Choose start month" />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									{months.map(month => (
										<SelectItem key={month.value} value={month.value}>
											{month.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<FormMessage className="text-xs" />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name={startYearName}
					render={({field}) => (
						<FormItem>
							<FormLabel className="text-foreground">Start Year</FormLabel>
							<Select onValueChange={field.onChange} value={field.value || ''} disabled={isSubmitting}>
								<FormControl>
									<SelectTrigger>
										<SelectValue placeholder="Choose start year" />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									{years.map(year => (
										<SelectItem key={year.value} value={year.value}>
											{year.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<FormMessage className="text-xs" />
						</FormItem>
					)}
				/>

				<div className="col-span-2 grid grid-cols-2 gap-4">
					<AnimatePresence>
						{!isCurrentLocal && (
							<>
								<motion.div
									initial={{opacity: 0, height: 0}}
									animate={{opacity: 1, height: 'auto'}}
									exit={{opacity: 0, height: 0}}
									transition={{duration: 0.3, ease: 'easeInOut'}}
								>
									<FormField
										control={form.control}
										name={endMonthName}
										render={({field}) => (
											<FormItem>
												<FormLabel className="text-foreground">End Month</FormLabel>
												<Select onValueChange={field.onChange} value={field.value || ''} disabled={isSubmitting}>
													<FormControl>
														<SelectTrigger>
															<SelectValue placeholder="Choose end month" />
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														{months.map(month => (
															<SelectItem key={month.value} value={month.value}>
																{month.label}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
												<FormMessage className="text-xs" />
											</FormItem>
										)}
									/>
								</motion.div>
								<motion.div
									initial={{opacity: 0, height: 0}}
									animate={{opacity: 1, height: 'auto'}}
									exit={{opacity: 0, height: 0}}
									transition={{duration: 0.3, ease: 'easeInOut'}}
								>
									<FormField
										control={form.control}
										name={endYearName}
										render={({field}) => (
											<FormItem>
												<FormLabel className="text-foreground">End Year</FormLabel>
												<Select onValueChange={field.onChange} value={field.value || ''} disabled={isSubmitting}>
													<FormControl>
														<SelectTrigger>
															<SelectValue placeholder="Choose end year" />
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														{years.map(year => (
															<SelectItem key={year.value} value={year.value}>
																{year.label}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
												<FormMessage className="text-xs" />
											</FormItem>
										)}
									/>
								</motion.div>
							</>
						)}
					</AnimatePresence>
				</div>
			</div>

			<FormField
				control={form.control}
				name={currentFieldName}
				render={({field}) => (
					<FormItem className="flex flex-row items-start space-x-3 space-y-0">
						<FormControl>
							<Checkbox
								checked={isCurrentLocal}
								onCheckedChange={handleCurrentChange}
								disabled={isSubmitting}
							/>
						</FormControl>
						<div className="space-y-1 leading-none">
							<FormLabel>
								{currentLabel}
							</FormLabel>
						</div>
					</FormItem>
				)}
			/>
		</>
	)
}

export default DateRangeFields
