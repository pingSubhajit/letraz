'use client'

import {useEffect, useRef} from 'react'

/**
 * Custom hook to automatically focus the first input field when a form is opened
 * @param isFormOpen - Boolean indicating if the form is currently open/visible
 * @param delay - Optional delay in milliseconds before focusing (default: 100ms)
 */
export const useAutoFocus = (isFormOpen: boolean, delay: number = 100) => {
	const hasBeenFocused = useRef(false)

	useEffect(() => {
		if (isFormOpen && !hasBeenFocused.current) {
			const timer = setTimeout(() => {
				// Find the first focusable input element in the form
				const firstInput = document.querySelector(
					'input:not([disabled]):not([readonly]), textarea:not([disabled]):not([readonly]), select:not([disabled])'
				) as HTMLElement

				if (firstInput) {
					firstInput.focus()
					hasBeenFocused.current = true
				}
			}, delay)

			return () => clearTimeout(timer)
		}

		// Reset the flag when form is closed
		if (!isFormOpen) {
			hasBeenFocused.current = false
		}
	}, [isFormOpen, delay])
}

/**
 * Custom hook to automatically focus a specific field by name when a form is opened
 * @param isFormOpen - Boolean indicating if the form is currently open/visible
 * @param fieldName - Name of the field to focus
 * @param delay - Optional delay in milliseconds before focusing (default: 100ms)
 */
export const useAutoFocusField = (isFormOpen: boolean, fieldName: string, delay: number = 100) => {
	const hasBeenFocused = useRef(false)

	useEffect(() => {
		if (isFormOpen && !hasBeenFocused.current) {
			const timer = setTimeout(() => {
				// Find the specific field by name
				const targetField = document.querySelector(
					`input[name="${fieldName}"]:not([disabled]):not([readonly]),
					 textarea[name="${fieldName}"]:not([disabled]):not([readonly]),
					 select[name="${fieldName}"]:not([disabled])`
				) as HTMLElement

				if (targetField) {
					targetField.focus()
					hasBeenFocused.current = true
				}
			}, delay)

			return () => clearTimeout(timer)
		}

		// Reset the flag when form is closed
		if (!isFormOpen) {
			hasBeenFocused.current = false
		}
	}, [isFormOpen, fieldName, delay])
}
