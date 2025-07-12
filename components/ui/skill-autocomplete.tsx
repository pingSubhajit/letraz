'use client'

import {useState, useRef, useEffect} from 'react'
import {Badge} from '@/components/ui/badge'
import {Input} from '@/components/ui/input'
import {FormControl, FormItem, FormLabel, FormMessage} from '@/components/ui/form'
import {useFormContext} from 'react-hook-form'
import {cn} from '@/lib/utils'
import {Skill, useSkillSearch} from '@/lib/skill/hooks'

interface SkillAutocompleteProps {
	skills: Skill[]
	excludeSkillIds?: string[]
	name: string
	label?: string
	placeholder?: string
	disabled?: boolean
	onSkillSelect?: (skillId: string, skillName: string, category: string | null) => void
	showLabel?: boolean
	defaultValue?: string
}

const SkillAutocomplete = ({
	skills,
	excludeSkillIds = [],
	name,
	label = 'Skill',
	placeholder = 'Type a skill...',
	disabled = false,
	onSkillSelect,
	showLabel = false,
	defaultValue = ''
}: SkillAutocompleteProps) => {
	const [inputValue, setInputValue] = useState(defaultValue)
	const [showSuggestions, setShowSuggestions] = useState(false)
	const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0)
	const inputRef = useRef<HTMLInputElement>(null)
	const suggestionsRef = useRef<HTMLDivElement>(null)
	const form = useFormContext()

	// Use the hook for searching skills without filtering for excludeSkillIds
	const {results: allMatchingSkills, isSearching} = useSkillSearch({
		skills,
		searchQuery: inputValue
	})

	// Mark skills as excluded but don't hide them
	const suggestions = allMatchingSkills.map(skill => ({
		...skill,
		isExcluded: excludeSkillIds.includes(skill.id)
	}))

	// Handle clicks outside the component
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				inputRef.current &&
				!inputRef.current.contains(event.target as Node) &&
				suggestionsRef.current &&
				!suggestionsRef.current.contains(event.target as Node)
			) {
				setShowSuggestions(false)
			}
		}

		document.addEventListener('mousedown', handleClickOutside)
		return () => {
			document.removeEventListener('mousedown', handleClickOutside)
		}
	}, [])

	const handleSelectSuggestion = (skill: Skill & { isExcluded?: boolean }) => {
		// Don't select excluded skills
		if (skill.isExcluded) return

		setInputValue(skill.name)
		setShowSuggestions(false)
		form.setValue(name, skill.id, {shouldValidate: true})

		if (onSkillSelect) {
			// Pass the category to the parent component
			onSkillSelect(skill.id, skill.name, skill.category)
		}
	}

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value
		setInputValue(value)

		// Only show suggestions if the user has typed something
		if (value.trim()) {
			setShowSuggestions(true)
			setActiveSuggestionIndex(0)
		} else {
			setShowSuggestions(false)
			// Clear the skill ID when input is emptied
			form.setValue(name, '', {shouldValidate: true})

			// Notify parent to clear category as well
			if (onSkillSelect) {
				onSkillSelect('', '', null)
			}
		}
	}

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		// Don't handle keyboard navigation when suggestions aren't shown
		if (!showSuggestions) return

		// Tab or Enter to select the current suggestion
		if ((e.key === 'Tab' || e.key === 'Enter') && suggestions.length > 0) {
			const activeSkill = suggestions[activeSuggestionIndex]
			if (!activeSkill.isExcluded) {
				e.preventDefault()
				handleSelectSuggestion(activeSkill)
			}
		} else if (e.key === 'ArrowDown' && suggestions.length > 0) {
			// Arrow down to navigate suggestions
			e.preventDefault()
			// Find the next non-excluded skill
			let nextIndex = activeSuggestionIndex
			do {
				nextIndex = (nextIndex + 1) % suggestions.length
				// Prevent infinite loop by checking if we've gone through all items
				if (nextIndex === activeSuggestionIndex) break
			} while (suggestions[nextIndex].isExcluded)

			setActiveSuggestionIndex(nextIndex)
		} else if (e.key === 'ArrowUp' && suggestions.length > 0) {
			// Arrow up to navigate suggestions
			e.preventDefault()
			// Find the previous non-excluded skill
			let prevIndex = activeSuggestionIndex
			do {
				prevIndex = prevIndex > 0 ? prevIndex - 1 : suggestions.length - 1
				// Prevent infinite loop by checking if we've gone through all items
				if (prevIndex === activeSuggestionIndex) break
			} while (suggestions[prevIndex].isExcluded)

			setActiveSuggestionIndex(prevIndex)
		} else if (e.key === 'Escape') {
			// Escape to close suggestions
			setShowSuggestions(false)
		}
	}

	// Allow custom skills by using the input value directly
	const handleBlur = () => {
		// Handle custom skills when user types something that doesn't match existing skills
		if (inputValue.trim()) {
			// Check if the input matches any existing skill name
			const matchingSkill = suggestions.find(skill => skill.name.toLowerCase() === inputValue.toLowerCase())
			
			// If no exact match found, treat as custom skill
			if (!matchingSkill) {
				// Tell the parent about the custom skill
				if (onSkillSelect) {
					// For custom skills, pass 'custom' as ID and null as category
					onSkillSelect('custom', inputValue, null)
				}
			}
		}

		// Don't hide suggestions immediately to allow clicking on them
		setTimeout(() => {
			if (document.activeElement !== inputRef.current) {
				setShowSuggestions(false)
			}
		}, 200)
	}

	return (
		<FormItem className="relative">
			{showLabel && label && <FormLabel className="text-foreground">{label}</FormLabel>}

			<FormControl>
				<Input
					ref={inputRef}
					value={inputValue}
					onChange={handleInputChange}
					onKeyDown={handleKeyDown}
					onBlur={handleBlur}
					placeholder={placeholder}
					disabled={disabled}
					className="w-full"
				/>
			</FormControl>

			{showSuggestions && suggestions.length > 0 && (
				<div
					ref={suggestionsRef}
					className="absolute z-50 w-full mt-1 max-h-96 overflow-auto rounded-md border bg-white py-1 shadow-lg"
				>
					{(() => {
						let lastWasPreferred = true // Start with true to avoid separator at top

						return suggestions.map((skill, index) => {
							const isActive = index === activeSuggestionIndex
							const isExcluded = skill.isExcluded

							// Check if we need a separator (transition from preferred to non-preferred)
							const needsSeparator = lastWasPreferred && !skill.preferred
							// Update for next item
							lastWasPreferred = skill.preferred

							return (
								<div key={skill.id}>
									{needsSeparator && (
										<div className="mx-3 my-1 border-t border-neutral-200" />
									)}
									<div
										className={cn(
											'flex items-center px-3 py-2',
											isActive && 'bg-neutral-100',
											skill.preferred && 'border-l-2 border-emerald-400',
											isExcluded ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
										)}
										onClick={() => !isExcluded && handleSelectSuggestion(skill)}
										onMouseEnter={() => !isExcluded && setActiveSuggestionIndex(index)}
									>
										<div className="flex-1">
											<div className="flex items-center flex-wrap gap-1.5">
												<span className={cn(
													'font-medium',
													skill.preferred && 'text-emerald-700'
												)}>
													{skill.name}
												</span>

												{skill.preferred && (
													<Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-[10px] px-1">
														preferred
													</Badge>
												)}

												{isExcluded && (
													<Badge variant="outline" className="bg-neutral-50 text-neutral-500 border-neutral-200 text-[10px] px-1">
														added
													</Badge>
												)}
											</div>

											{skill.alias && skill.alias.length > 0 && (
												<div className="text-xs text-muted-foreground mt-0.5">
													Also: {skill.alias.map(a => a.name).join(', ')}
												</div>
											)}
										</div>

										{isActive && !isExcluded && (
											<div className="text-xs text-muted-foreground ml-2 whitespace-nowrap">
												Press Tab
											</div>
										)}
									</div>
								</div>
							)
						})
					})()}
				</div>
			)}

			<FormMessage className="text-xs" />
		</FormItem>
	)
}

export default SkillAutocomplete
