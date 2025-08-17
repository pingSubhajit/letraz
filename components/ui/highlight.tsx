import React from 'react'

export const highlightText = (text: string, searchQuery: string): React.ReactNode => {
	if (!searchQuery || !text) return text

	// Split search query into words and escape special regex characters
	const searchWords = searchQuery
		.trim()
		.split(/\s+/)
		.filter(word => word.length > 0)
		.map(word => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))

	if (searchWords.length === 0) return text

	// Create regex pattern that matches any of the search words
	const pattern = new RegExp(`(${searchWords.join('|')})`, 'gi')

	// Split text by the pattern
	const parts = text.split(pattern)

	return (
		<>
			{parts.map((part, index) => {
				// Check if this part matches any search word
				const isHighlighted = searchWords.some(
					word => new RegExp(`^${word}$`, 'i').test(part)
				)

				if (isHighlighted) {
					return (
						<mark
							key={index}
							className="bg-flame-100 text-flame-900 px-0.5 rounded-sm font-semibold"
						>
							{part}
						</mark>
					)
				}

				return <span key={index}>{part}</span>
			})}
		</>
	)
}

