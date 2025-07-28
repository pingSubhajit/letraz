'use client'

import {useEffect, useRef, RefObject} from 'react'

/**
 * Custom hook to automatically focus the first input field when a form is opened
 * @param isFormOpen - Boolean indicating if the form is currently open/visible
 * @param containerRef - Optional ref to the form/container element to scope the search
 * @param delay - Optional delay in milliseconds before focusing (default: 150ms)
 */
export const useAutoFocus = (
	isFormOpen: boolean, 
	containerRef?: RefObject<HTMLElement>, 
	delay: number = 150
) => {
	const hasBeenFocused = useRef(false)

	useEffect(() => {
		if (isFormOpen && !hasBeenFocused.current) {
			const timer = setTimeout(() => {
				try {
					// Use container element if provided, otherwise fallback to document
					const searchContext = containerRef?.current || document
					
					// Ensure we have a valid search context
					if (!searchContext) {
						return
					}
					
					// Find the first focusable input element within the scoped context
					const firstInput = searchContext.querySelector(
						'input:not([disabled]):not([readonly]), textarea:not([disabled]):not([readonly]), select:not([disabled])'
					) as HTMLElement

					if (firstInput && typeof firstInput.focus === 'function') {
						firstInput.focus()
						hasBeenFocused.current = true
					}
				} catch (error) {
					// Silently handle DOM query errors - focus is not critical functionality
				}
			}, delay)

			return () => clearTimeout(timer)
		}

		// Reset the flag when form is closed
		if (!isFormOpen) {
			hasBeenFocused.current = false
		}
	}, [isFormOpen, containerRef, delay])
}

/**
 * Custom hook to automatically focus a specific field by name when a form is opened
 * @param isFormOpen - Boolean indicating if the form is currently open/visible
 * @param fieldName - Name of the field to focus
 * @param containerRef - Optional ref to the form/container element to scope the search
 * @param delay - Optional delay in milliseconds before focusing (default: 150ms)
 */
export const useAutoFocusField = (
	isFormOpen: boolean, 
	fieldName: string, 
	containerRef?: RefObject<HTMLElement>, 
	delay: number = 150
) => {
	const hasBeenFocused = useRef(false)

	useEffect(() => {
		if (isFormOpen && !hasBeenFocused.current) {
			const timer = setTimeout(() => {
				try {
					// Use container element if provided, otherwise fallback to document
					const searchContext = containerRef?.current || document
					
					// Ensure we have a valid search context
					if (!searchContext) {
						return
					}
					
					// Construct a clean, single-line CSS selector for the target field
					const inputSelector = `input[name="${fieldName}"]:not([disabled]):not([readonly])`
					const textareaSelector = `textarea[name="${fieldName}"]:not([disabled]):not([readonly])`
					const selectSelector = `select[name="${fieldName}"]:not([disabled])`
					const combinedSelector = `${inputSelector}, ${textareaSelector}, ${selectSelector}`
					
					// Find the specific field by name within the scoped context
					const targetField = searchContext.querySelector(combinedSelector) as HTMLElement

					if (targetField && typeof targetField.focus === 'function') {
						// Additional check to ensure element is visible and focusable
						if (targetField.offsetParent !== null || targetField === document.activeElement) {
							targetField.focus()
							hasBeenFocused.current = true
						}
					}
				} catch (error) {
					// Silently handle DOM query errors - focus is not critical functionality  
				}
			}, delay)

			return () => clearTimeout(timer)
		}

		// Reset the flag when form is closed
		if (!isFormOpen) {
			hasBeenFocused.current = false
		}
	}, [isFormOpen, fieldName, containerRef, delay])
}
