'use client'

import {useState, useEffect} from 'react'
import {FormControl, FormItem, FormLabel, FormMessage} from '@/components/ui/form'
import {Slider} from '@/components/ui/slider'
import {useFormContext} from 'react-hook-form'
import {cn} from '@/lib/utils'
import {Badge} from '@/components/ui/badge'

interface ProficiencyLevel {
  value: string
  label: string
  color: string
  description: string
}

interface ProficiencySliderProps {
  name: string
  levels: ProficiencyLevel[]
  label?: string
  description?: string
  disabled?: boolean
}

const ProficiencySlider = ({
	name,
	levels,
	label = 'Proficiency Level',
	description,
	disabled = false
}: ProficiencySliderProps) => {
	const form = useFormContext()
	const [activeLevel, setActiveLevel] = useState<ProficiencyLevel | null>(null)

	// Map form value to slider value (0-based index)
	const value = form.watch(name)
	const sliderValue = value
		? [levels.findIndex(level => level.value === value)]
		: [0]

	useEffect(() => {
		if (sliderValue[0] >= 0) {
		if (sliderValue[0] >= 0 && sliderValue[0] < levels.length) {
			setActiveLevel(levels[sliderValue[0]])
		}
	}, [sliderValue, levels])

	const handleSliderChange = (newValue: number[]) => {
		const levelIndex = newValue[0]
		const selectedLevel = levels[levelIndex]
		form.setValue(name, selectedLevel.value, {shouldValidate: true})
		setActiveLevel(selectedLevel)
	}

	return (
		<FormItem className="space-y-4">
			<div className="flex items-baseline justify-between">
				<FormLabel className="text-foreground">{label}</FormLabel>
				{activeLevel && (
					<Badge
						className="text-xs font-medium"
						variant="outline"
					>
						{activeLevel.label}
					</Badge>
				)}
			</div>

			{description && (
				<p className="text-xs text-muted-foreground">{description}</p>
			)}

			<div className="pt-2 pb-4">
				<FormControl>
					<Slider
						value={sliderValue}
						min={0}
						max={levels.length - 1}
						step={1}
						onValueChange={handleSliderChange}
						disabled={disabled}
						className="py-1.5"
					/>
				</FormControl>
			</div>

			<div className="flex justify-between text-xs text-muted-foreground">
				{levels.map((level, index) => (
					<div
						key={level.value}
						className={cn(
							'cursor-pointer transition-all px-1.5',
							sliderValue[0] === index ? 'text-foreground font-medium' : ''
						)}
						onClick={() => !disabled && handleSliderChange([index])}
					>
						{level.label}
					</div>
				))}
			</div>

			{activeLevel && (
				<p className="text-sm text-muted-foreground mt-2 italic">
					{activeLevel.description}
				</p>
			)}

			<FormMessage className="text-xs" />
		</FormItem>
	)
}

export default ProficiencySlider
