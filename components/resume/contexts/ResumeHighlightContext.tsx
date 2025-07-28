'use client'

import React, {createContext, useContext, useState, ReactNode, useRef, useEffect} from 'react'

const SCROLL_DELAY_MS = 200
const HIGHLIGHT_DURATION_MS = 3000

export interface HighlightedItem {
	type: 'education' | 'experience' | 'project' | 'skill' | 'certification' | 'personal'
	id?: string | number
	sectionIndex?: number
}

interface ResumeHighlightContextType {
	highlightedItem: HighlightedItem | null
	setHighlightedItem: (item: HighlightedItem | null) => void
	scrollToItem: (item: HighlightedItem) => void
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
		clearHighlight?: NodeJS.Timeout
		scrollToElement?: NodeJS.Timeout
	}>({})

	// Cleanup function to clear all active timeouts
	const clearAllTimeouts = () => {
		if (timeoutRefs.current.clearHighlight) {
			clearTimeout(timeoutRefs.current.clearHighlight)
			timeoutRefs.current.clearHighlight = undefined
		}
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

	const scrollToItem = (item: HighlightedItem) => {
		// Clear any existing timeouts to prevent memory leaks and race conditions
		clearAllTimeouts()

		setHighlightedItem(item)

		// Auto-clear highlight after configured duration
		timeoutRefs.current.clearHighlight = setTimeout(() => {
			setHighlightedItem(null)
			timeoutRefs.current.clearHighlight = undefined
		}, HIGHLIGHT_DURATION_MS)

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
					element.scrollIntoView({
						behavior: 'smooth',
						block: 'center'
					})
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
			scrollToItem
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
