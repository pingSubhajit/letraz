'use client'

import {useState, useRef, useEffect} from 'react'
import {Input} from '@/components/ui/input'
import {FormControl, FormItem, FormLabel, FormMessage} from '@/components/ui/form'
import {useFormContext} from 'react-hook-form'
import {cn} from '@/lib/utils'

interface CategoryAutocompleteProps {
	categories: string[]
	name: string
	label?: string
	placeholder?: string
	disabled?: boolean
	onCategorySelect?: (category: string) => void
	showLabel?: boolean
	defaultValue?: string
}

const CategoryAutocomplete = ({
	categories,
	name,
	label = 'Category',
	placeholder = 'Type a category...',
	disabled = false,
	onCategorySelect,
	showLabel = false,
	defaultValue = ''
}: CategoryAutocompleteProps) => {
	const [inputValue, setInputValue] = useState(defaultValue)
	const [showSuggestions, setShowSuggestions] = useState(false)
	const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0)
	const inputRef = useRef<HTMLInputElement>(null)
	const suggestionsRef = useRef<HTMLDivElement>(null)
	const form = useFormContext()

	// Watch for changes in the form value and update input accordingly
	const formValue = form.watch(name)
	
	useEffect(() => {
		// Update input value when form value changes (e.g., from skill selection)
		if (formValue !== inputValue) {
			setInputValue(formValue || '')
		}
	}, [formValue, inputValue])

	// Filter categories based on input value
	const suggestions = categories
		.filter(category => 
			category.toLowerCase().includes(inputValue.toLowerCase().trim())
		)
		.sort((a, b) => {
			// Exact matches first
			const aExact = a.toLowerCase() === inputValue.toLowerCase()
			const bExact = b.toLowerCase() === inputValue.toLowerCase()
			
			if (aExact && !bExact) return -1
			if (!aExact && bExact) return 1
			
			// Then alphabetically
			return a.localeCompare(b)
		})

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

	const handleSelectSuggestion = (category: string) => {
		setInputValue(category)
		setShowSuggestions(false)
		form.setValue(name, category, {shouldValidate: true})

		if (onCategorySelect) {
			onCategorySelect(category)
		}
	}

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value
		setInputValue(value)

		// Update form value
		form.setValue(name, value, {shouldValidate: true})

		// Show suggestions if there are matches
		if (value.trim() && suggestions.length > 0) {
			setShowSuggestions(true)
			setActiveSuggestionIndex(0)
		} else {
			setShowSuggestions(false)
		}

		// Notify parent component
		if (onCategorySelect) {
			onCategorySelect(value)
		}
	}

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		// Don't handle keyboard navigation when suggestions aren't shown
		if (!showSuggestions || suggestions.length === 0) return

		if (e.key === 'Tab' || e.key === 'Enter') {
			// Tab or Enter to select the current suggestion
			e.preventDefault()
			const activeCategory = suggestions[activeSuggestionIndex]
			handleSelectSuggestion(activeCategory)
		} else if (e.key === 'ArrowDown') {
			// Arrow down to navigate suggestions
			e.preventDefault()
			setActiveSuggestionIndex((prev) => (prev + 1) % suggestions.length)
		} else if (e.key === 'ArrowUp') {
			// Arrow up to navigate suggestions
			e.preventDefault()
			setActiveSuggestionIndex((prev) => prev > 0 ? prev - 1 : suggestions.length - 1)
		} else if (e.key === 'Escape') {
			// Escape to close suggestions
			setShowSuggestions(false)
		}
	}

	const handleBlur = () => {
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
					className="absolute z-50 w-full mt-1 max-h-60 overflow-auto rounded-md border bg-white py-1 shadow-lg"
				>
					{suggestions.map((category, index) => {
						const isActive = index === activeSuggestionIndex

						return (
							<div
								key={category}
								className={cn(
									'flex items-center px-3 py-2 cursor-pointer',
									isActive && 'bg-neutral-100'
								)}
								onClick={() => handleSelectSuggestion(category)}
								onMouseEnter={() => setActiveSuggestionIndex(index)}
							>
								<div className="flex-1">
									<span className="font-medium">{category}</span>
								</div>

								{isActive && (
									<div className="text-xs text-muted-foreground ml-2 whitespace-nowrap">
										Press Tab
									</div>
								)}
							</div>
						)
					})}
				</div>
			)}

			<FormMessage className="text-xs" />
		</FormItem>
	)
}

export default CategoryAutocomplete