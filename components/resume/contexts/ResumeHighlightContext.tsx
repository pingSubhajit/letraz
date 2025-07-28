'use client'

import React, {createContext, useContext, useState, ReactNode} from 'react'

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

	const scrollToItem = (item: HighlightedItem) => {
		setHighlightedItem(item)

		// Auto-clear highlight after 3 seconds
		setTimeout(() => {
			setHighlightedItem(null)
		}, 3000)

		// Find and scroll to the element
		setTimeout(() => {
			const selector = generateSelector(item)
			const element = document.querySelector(selector)

			if (element) {
				element.scrollIntoView({
					behavior: 'smooth',
					block: 'center'
				})
			}
		}, 100) // Small delay to ensure DOM is updated
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
		return `[data-resume-item="education-${item.id}"]`
	case 'experience':
		return `[data-resume-item="experience-${item.id}"]`
	case 'project':
		return `[data-resume-item="project-${item.id}"]`
	case 'skill':
		return '[data-resume-item="skill-section"]'
	case 'certification':
		return `[data-resume-item="certification-${item.id}"]`
	case 'personal':
		return '[data-resume-item="personal-info"]'
	default:
		return ''
	}
}
