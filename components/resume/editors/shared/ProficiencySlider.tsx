'use client'

import {useState, useEffect, useRef, useCallback} from 'react'
import {FormControl, FormItem, FormLabel, FormMessage} from '@/components/ui/form'
import {useFormContext} from 'react-hook-form'
import {cn} from '@/lib/utils'
import {Badge} from '@/components/ui/badge'
import {motion, AnimatePresence} from 'motion/react'
import * as SliderPrimitive from '@radix-ui/react-slider'

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
	const [isDragging, setIsDragging] = useState(false)
	const [continuousValue, setContinuousValue] = useState(0)
	const audioContextRef = useRef<AudioContext | null>(null)
	const lastSoundTimeRef = useRef<number>(0)
	const magnetTimeoutRef = useRef<NodeJS.Timeout | null>(null)

	// Map form value to continuous slider value (0-100 scale)
	const value = form.watch(name)
	const levelIndex = value ? levels.findIndex(level => level.value === value) : 0
	const normalizedValue = levelIndex >= 0 ? (levelIndex / (levels.length - 1)) * 100 : 0

	// Initialize audio context
	const initAudioContext = useCallback(() => {
		if (!audioContextRef.current && typeof window !== 'undefined') {
			try {
				audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
			} catch (error) {
				// console.warn('Audio context not supported:', error)
			}
		}
	}, [])

	// Generate aesthetic continuous sliding sound
	const playContinuousSound = useCallback((sliderPosition: number, force = false) => {
		if (!audioContextRef.current || disabled) return

		const now = Date.now()
		// Throttle sound to avoid overwhelming
		if (!force && now - lastSoundTimeRef.current < 80) return
		lastSoundTimeRef.current = now

		try {
			if (audioContextRef.current.state === 'suspended') {
				audioContextRef.current.resume()
			}

			const ctx = audioContextRef.current
			const currentTime = ctx.currentTime

			// Create a warm, aesthetic sliding sound
			const oscillator = ctx.createOscillator()
			const gainNode = ctx.createGain()
			const filterNode = ctx.createBiquadFilter()

			// Map slider position to a pleasant frequency range (warmer tones)
			const baseFreq = 400 + (sliderPosition / 100) * 300 // 400-700 Hz range (warmer)

			oscillator.connect(filterNode)
			filterNode.connect(gainNode)
			gainNode.connect(ctx.destination)

			oscillator.frequency.setValueAtTime(baseFreq, currentTime)
			oscillator.type = 'triangle' // Warmer than sine

			// Add a warm low-pass filter
			filterNode.type = 'lowpass'
			filterNode.frequency.setValueAtTime(1200, currentTime)
			filterNode.Q.setValueAtTime(1, currentTime)

			// Gentle, aesthetic envelope
			gainNode.gain.setValueAtTime(0, currentTime)
			gainNode.gain.exponentialRampToValueAtTime(0.015, currentTime + 0.01)
			gainNode.gain.exponentialRampToValueAtTime(0.001, currentTime + 0.08)

			oscillator.start(currentTime)
			oscillator.stop(currentTime + 0.08)
		} catch (error) {
			// console.warn('Error playing sound:', error)
		}
	}, [disabled])

	// Generate elegant checkpoint magnet sound
	const playMagnetSound = useCallback((levelIndex: number) => {
		if (!audioContextRef.current || disabled) return

		try {
			const ctx = audioContextRef.current
			const currentTime = ctx.currentTime

			// Create a sophisticated "click" sound with layered tones
			const mainOscillator = ctx.createOscillator()
			const subOscillator = ctx.createOscillator()
			const clickOscillator = ctx.createOscillator()

			const mainGain = ctx.createGain()
			const subGain = ctx.createGain()
			const clickGain = ctx.createGain()

			const filterNode = ctx.createBiquadFilter()
			const compressor = ctx.createDynamicsCompressor()

			// Elegant frequency progression (major scale intervals)
			const frequencies = [440, 523, 659, 880] // A4, C5, E5, A5 (cleaner intervals)
			const frequency = frequencies[levelIndex] || frequencies[0]

			// Main tone - warm and rich
			mainOscillator.connect(mainGain)
			mainGain.connect(filterNode)

			// Sub tone - adds warmth
			subOscillator.connect(subGain)
			subGain.connect(filterNode)

			// Click component - adds definition
			clickOscillator.connect(clickGain)
			clickGain.connect(filterNode)

			filterNode.connect(compressor)
			compressor.connect(ctx.destination)

			// Set frequencies
			mainOscillator.frequency.setValueAtTime(frequency, currentTime)
			subOscillator.frequency.setValueAtTime(frequency * 0.5, currentTime) // Octave below
			clickOscillator.frequency.setValueAtTime(frequency * 2, currentTime) // Octave above

			// Set wave types for different timbres
			mainOscillator.type = 'triangle'
			subOscillator.type = 'sine'
			clickOscillator.type = 'square'

			// Configure filter for warmth
			filterNode.type = 'lowpass'
			filterNode.frequency.setValueAtTime(2000, currentTime)
			filterNode.Q.setValueAtTime(0.7, currentTime)

			// Main tone envelope - the core sound
			mainGain.gain.setValueAtTime(0, currentTime)
			mainGain.gain.exponentialRampToValueAtTime(0.08, currentTime + 0.005)
			mainGain.gain.exponentialRampToValueAtTime(0.001, currentTime + 0.15)

			// Sub tone envelope - adds body
			subGain.gain.setValueAtTime(0, currentTime)
			subGain.gain.exponentialRampToValueAtTime(0.04, currentTime + 0.008)
			subGain.gain.exponentialRampToValueAtTime(0.001, currentTime + 0.12)

			// Click envelope - adds crisp attack
			clickGain.gain.setValueAtTime(0, currentTime)
			clickGain.gain.exponentialRampToValueAtTime(0.02, currentTime + 0.002)
			clickGain.gain.exponentialRampToValueAtTime(0.001, currentTime + 0.03)

			mainOscillator.start(currentTime)
			subOscillator.start(currentTime)
			clickOscillator.start(currentTime)

			mainOscillator.stop(currentTime + 0.15)
			subOscillator.stop(currentTime + 0.12)
			clickOscillator.stop(currentTime + 0.03)
		} catch (error) {
			// console.warn('Error playing sound:', error)
		}
	}, [disabled])

	// Find closest level checkpoint
	const getClosestLevel = useCallback((sliderValue: number): number => {
		const position = sliderValue / 100
		const index = Math.round(position * (levels.length - 1))
		return Math.max(0, Math.min(levels.length - 1, index))
	}, [levels.length])

	// Handle continuous slider changes
	const handleContinuousChange = useCallback((newValue: number[]) => {
		const sliderPos = newValue[0]
		setContinuousValue(sliderPos)

		// Initialize audio on first interaction
		initAudioContext()

		// Play continuous sound while dragging
		if (isDragging) {
			playContinuousSound(sliderPos)
		}

		// Clear existing magnet timeout
		if (magnetTimeoutRef.current) {
			clearTimeout(magnetTimeoutRef.current)
		}

		// Set up magnetic snap with delay
		magnetTimeoutRef.current = setTimeout(() => {
			if (!isDragging) { // Only snap if not actively dragging
				const closestLevelIndex = getClosestLevel(sliderPos)
				const targetValue = (closestLevelIndex / (levels.length - 1)) * 100

				// Snap to closest checkpoint
				setContinuousValue(targetValue)
				setActiveLevel(levels[closestLevelIndex])
				form.setValue(name, levels[closestLevelIndex].value, {shouldValidate: true})

				// Play magnet sound
				playMagnetSound(closestLevelIndex)
			}
		}, 150) // 150ms delay for magnetic feel

	}, [isDragging, initAudioContext, playContinuousSound, getClosestLevel, levels, form, name, playMagnetSound])

	// Handle drag start
	const handlePointerDown = useCallback(() => {
		setIsDragging(true)
		initAudioContext()
	}, [initAudioContext])

	// Handle drag end
	const handlePointerUp = useCallback(() => {
		setIsDragging(false)

		// Immediate snap to closest level when releasing
		const closestLevelIndex = getClosestLevel(continuousValue)
		const targetValue = (closestLevelIndex / (levels.length - 1)) * 100

		setContinuousValue(targetValue)
		setActiveLevel(levels[closestLevelIndex])
		form.setValue(name, levels[closestLevelIndex].value, {shouldValidate: true})

		// Play satisfying snap sound
		playMagnetSound(closestLevelIndex)
	}, [continuousValue, getClosestLevel, levels, form, name, playMagnetSound])

	// Initialize from form value
	useEffect(() => {
		setContinuousValue(normalizedValue)
		if (levelIndex >= 0) {
			setActiveLevel(levels[levelIndex])
		}
	}, [normalizedValue, levelIndex, levels])

	// Cleanup timeout on unmount
	useEffect(() => {
		return () => {
			if (magnetTimeoutRef.current) {
				clearTimeout(magnetTimeoutRef.current)
			}
		}
	}, [])

	return (
		<FormItem className="space-y-4">
			<div className="flex items-baseline justify-between">
				<FormLabel className="text-foreground">{label}</FormLabel>
				<AnimatePresence mode="wait">
					{activeLevel && (
						<motion.div
							key={activeLevel.value}
							initial={{opacity: 0, scale: 0.8, y: -10}}
							animate={{opacity: 1, scale: 1, y: 0}}
							exit={{opacity: 0, scale: 0.8, y: 10}}
							transition={{
								type: 'spring',
								stiffness: 300,
								damping: 20,
								duration: 0.3
							}}
						>
							<Badge
								className={cn(
									'text-xs font-medium transition-all duration-300 border-orange-300 text-orange-600 bg-orange-50',
									isDragging && 'scale-110 shadow-lg border-orange-400 bg-orange-100'
								)}
								variant="outline"
							>
								{activeLevel.label}
							</Badge>
						</motion.div>
					)}
				</AnimatePresence>
			</div>

			{description && (
				<motion.p
					className="text-xs text-muted-foreground"
					initial={{opacity: 0}}
					animate={{opacity: 1}}
					transition={{delay: 0.2}}
				>
					{description}
				</motion.p>
			)}

			<motion.div
				className="pt-4 pb-6 px-8"
				whileHover={{scale: 1.005}}
				transition={{type: 'spring', stiffness: 400}}
			>
				<FormControl>
					<motion.div
						animate={isDragging ? {scale: 1.01} : {scale: 1}}
						transition={{type: 'spring', stiffness: 300, damping: 20}}
					>
						{/* Custom Enhanced Slider */}
						<SliderPrimitive.Root
							value={[continuousValue]}
							min={0}
							max={100}
							step={0.1} // Smooth continuous sliding
							onValueChange={handleContinuousChange}
							onPointerDown={handlePointerDown}
							onPointerUp={handlePointerUp}
							disabled={disabled}
							className="relative flex w-full touch-none select-none items-center py-2"
						>
							{/* Track */}
							<SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-neutral-200">
								{/* Range */}
								<SliderPrimitive.Range
									className="absolute h-full transition-all duration-300"
									style={{
										background: 'linear-gradient(90deg, #fef3e2, #fb923c, #ea580c, #dc2626)'
									}}
								/>

								{/* Checkpoint indicators */}
								{levels.map((level, index) => {
									// Position within the track bounds (no padding offset needed for track elements)
									const position = levels.length === 1 ? 50 : (index / (levels.length - 1)) * 100
									// Get flame color for this level
									const flameColors = ['#fef3e2', '#fb923c', '#ea580c', '#dc2626']
									const flameColor = flameColors[index] || flameColors[0]

									return (
										<motion.div
											key={level.value}
											className="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 w-1.5 h-5 rounded-full bg-white shadow-sm"
											style={{
												left: `${position}%`,
												border: `2px solid ${flameColor}`
											}}
											animate={
												continuousValue >= position - 5 && continuousValue <= position + 5
													? {
														scale: 1.3,
														boxShadow: `0 0 12px ${flameColor}40`,
														borderWidth: '3px'
													}
													: {
														scale: 1,
														boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
														borderWidth: '2px'
													}
											}
											transition={{type: 'spring', stiffness: 400, damping: 25}}
										/>
									)
								})}
							</SliderPrimitive.Track>

							{/* Thumb */}
							<SliderPrimitive.Thumb
								className={cn(
									'block rounded-full bg-white ring-offset-white transition-all duration-300',
									'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
									isDragging
										? 'h-7 w-7 shadow-xl cursor-grabbing'
										: 'h-5 w-5 shadow-lg cursor-grab hover:h-6 hover:w-6'
								)}
								style={{
									backgroundColor: 'white',
									border: `3px solid ${isDragging ? '#ea580c' : '#fb923c'}`,
									boxShadow: isDragging ?
										'0 8px 25px rgba(234, 88, 12, 0.25), 0 0 0 4px rgba(251, 146, 60, 0.1)' :
										'0 4px 12px rgba(251, 146, 60, 0.2)'
								}}
							/>
						</SliderPrimitive.Root>
					</motion.div>
				</FormControl>
			</motion.div>

			{/* Level Labels */}
			<div className="flex justify-between text-xs text-muted-foreground mt-2">
				{levels.map((level, index) => {
					const trackPosition = levels.length === 1 ? 50 : (index / (levels.length - 1)) * 100
					const isNearActive = Math.abs(continuousValue - trackPosition) < 8

					return (
						<motion.div
							key={level.value}
							className={cn(
								'cursor-pointer transition-all duration-200 px-2 py-1.5 rounded-md text-center',
								isNearActive
									? 'text-foreground font-semibold scale-105'
									: 'hover:text-foreground/80 hover:scale-105'
							)}
							style={isNearActive ? {
								backgroundColor: '#fed7aa',
								color: '#ea580c'
							} : {}}
							onClick={() => {
								if (!disabled) {
									const targetValue = trackPosition
									setContinuousValue(targetValue)
									setActiveLevel(level)
									form.setValue(name, level.value, {shouldValidate: true})
									initAudioContext()
									playMagnetSound(index)
								}
							}}
							whileHover={{scale: 1.05}}
							whileTap={{scale: 0.95}}
							transition={{type: 'spring', stiffness: 400, damping: 10}}
						>
							<span className="block whitespace-nowrap">{level.label}</span>
						</motion.div>
					)
				})}
			</div>

			<AnimatePresence mode="wait">
				{activeLevel && (
					<motion.p
						key={activeLevel.value}
						className="text-sm text-muted-foreground mt-3 italic text-center"
						initial={{opacity: 0, y: 10}}
						animate={{opacity: 1, y: 0}}
						exit={{opacity: 0, y: -10}}
						transition={{
							type: 'spring',
							stiffness: 200,
							damping: 20,
							duration: 0.4
						}}
					>
						{activeLevel.description}
					</motion.p>
				)}
			</AnimatePresence>

			<FormMessage className="text-xs" />
		</FormItem>
	)
}

export default ProficiencySlider
