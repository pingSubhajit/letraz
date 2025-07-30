'use client'

import React, {createContext, useContext, useState, ReactNode, useRef, useEffect} from 'react'

const SCROLL_DELAY_MS = 200
const SCROLL_THRESHOLD = 100 // pixels of buffer space from viewport edges

export interface HighlightedItem {
	type: 'education' | 'experience' | 'project' | 'skill' | 'certification' | 'personal'
	id?: string | number
	sectionIndex?: number
}

interface ResumeHighlightContextType {
	highlightedItem: HighlightedItem | null
	setHighlightedItem: (item: HighlightedItem | null) => void
	scrollToItem: (item: HighlightedItem) => void
	clearHighlight: () => void
}

const ResumeHighlightContext = createContext<ResumeHighlightContextType | undefined>(undefined)

export const useResumeHighlight = () => {
	const context = useContext(ResumeHighlightContext)
	if (context === undefined) {
		throw new Error('useResumeHighlight must be used within a ResumeHighlightProvider')
	}
	return context
}

interface ResumeHighlightProviderProps {
	children: ReactNode
}

export const ResumeHighlightProvider: React.FC<ResumeHighlightProviderProps> = ({children}) => {
	const [highlightedItem, setHighlightedItem] = useState<HighlightedItem | null>(null)
	const timeoutRefs = useRef<{
		scrollToElement?: NodeJS.Timeout
	}>({})

	// Cleanup function to clear all active timeouts
	const clearAllTimeouts = () => {
		if (timeoutRefs.current.scrollToElement) {
			clearTimeout(timeoutRefs.current.scrollToElement)
			timeoutRefs.current.scrollToElement = undefined
		}
	}

	// Cleanup timeouts on component unmount
	useEffect(() => {
		return () => {
			clearAllTimeouts()
		}
	}, [])

	const clearHighlight = () => {
		setHighlightedItem(null)
	}

	const scrollToItem = (item: HighlightedItem) => {
		// Clear any existing timeouts to prevent memory leaks and race conditions
		clearAllTimeouts()

		setHighlightedItem(item)

		// Find and scroll to the element after DOM update delay
		timeoutRefs.current.scrollToElement = setTimeout(() => {
			try {
				const selector = generateSelector(item)

				// Validate selector is not empty
				if (!selector || selector.trim() === '') {
					return
				}

				const element = document.querySelector(selector)

				if (element) {
					// Check if element is already visible in viewport
					const rect = element.getBoundingClientRect()
					const isVisible = rect.top >= 0 && rect.bottom <= window.innerHeight

					// Only scroll if element is not fully visible
					if (!isVisible) {
						// Find the actual scrollable container first
						let scrollContainer = element.parentElement
						while (scrollContainer && scrollContainer !== document.body) {
							const styles = window.getComputedStyle(scrollContainer)
							if (styles.overflow === 'auto' || styles.overflow === 'scroll' ||
								styles.overflowY === 'auto' || styles.overflowY === 'scroll') {
								break
							}
							scrollContainer = scrollContainer.parentElement
						}

						// Calculate optimal scroll position with threshold
						if (scrollContainer) {
							// For container scrolling, calculate position relative to container
							const containerRect = scrollContainer.getBoundingClientRect()
							const elementRect = element.getBoundingClientRect()
							const relativeTop = elementRect.top - containerRect.top

							let targetScrollTop = scrollContainer.scrollTop + relativeTop - SCROLL_THRESHOLD

							// Ensure we don't scroll past the boundaries
							targetScrollTop = Math.max(0, Math.min(targetScrollTop, scrollContainer.scrollHeight - scrollContainer.clientHeight))

							scrollContainer.scrollTo({
								top: targetScrollTop,
								behavior: 'smooth'
							})
						} else {
							// Fallback to scrollIntoView
							element.scrollIntoView({
								behavior: 'smooth',
								block: 'nearest',
								inline: 'nearest'
							})
						}
					}
				}
			} catch (error) {
				// Silent error handling - scrolling is not critical functionality
			} finally {
				timeoutRefs.current.scrollToElement = undefined
			}
		}, SCROLL_DELAY_MS)
	}

	return (
		<ResumeHighlightContext.Provider value={{
			highlightedItem,
			setHighlightedItem,
			scrollToItem,
			clearHighlight
		}}>
			{children}
		</ResumeHighlightContext.Provider>
	)
}

const generateSelector = (item: HighlightedItem): string => {
	switch (item.type) {
	case 'education':
		return item.id ? `[data-resume-item="education-${item.id}"]` : ''
	case 'experience':
		return item.id ? `[data-resume-item="experience-${item.id}"]` : ''
	case 'project':
		return item.id ? `[data-resume-item="project-${item.id}"]` : ''
	case 'certification':
		return item.id ? `[data-resume-item="certification-${item.id}"]` : ''
	case 'skill':
		return '[data-resume-item="skill-section"]'
	case 'personal':
		return '[data-resume-item="personal-info"]'
	default:
		return ''
	}
}
