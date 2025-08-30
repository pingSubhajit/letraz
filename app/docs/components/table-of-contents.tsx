'use client'

import {useEffect, useState} from 'react'
import {cn} from '@/lib/utils'
import {ScrollArea} from '@/components/ui/scroll-area'
import {Separator} from '@/components/ui/separator'

interface TOCItem {
  id: string
  title: string
  level: number
}

interface TableOfContentsProps {
  content?: string
}

// Server-side function to extract headings from HTML
const extractHeadingsFromHTML = (html: string): TOCItem[] => {
	const headingRegex = /<h([1-6])[^>]*>(.*?)<\/h[1-6]>/gi
	const items: TOCItem[] = []
	let match

	while ((match = headingRegex.exec(html)) !== null) {
		const level = parseInt(match[1])
		const title = match[2].replace(/<[^>]*>/g, '').trim() // Strip HTML tags

		if (title) {
			// Create a unique ID
			let id = title
				.toLowerCase()
				.replace(/[^a-z0-9\s]/g, '')
				.replace(/\s+/g, '-')
				.trim()

			// Add index to ensure uniqueness
			let counter = 0
			let originalId = id
			while (items.some(item => item.id === id)) {
				counter++
				id = `${originalId}-${counter}`
			}

			items.push({id, title, level})
		}
	}

	return items
}

const TableOfContents = ({content = ''}: TableOfContentsProps) => {
	const [tocItems, setTocItems] = useState<TOCItem[]>([])
	const [activeId, setActiveId] = useState<string>('')

	useEffect(() => {
		if (!content) {
			// Extract from DOM if no content provided
			const headingElements = document.querySelectorAll('.docs-content h1, .docs-content h2, .docs-content h3, .docs-content h4, .docs-content h5, .docs-content h6')
			const items: TOCItem[] = []

			headingElements.forEach((heading, index) => {
				const level = parseInt(heading.tagName.charAt(1))
				const title = heading.textContent || ''

				if (title) {
					let id = heading.id
					if (!id) {
						id = title
							.toLowerCase()
							.replace(/[^a-z0-9\s]/g, '')
							.replace(/\s+/g, '-')
							.trim()

						// Add index to ensure uniqueness
						let counter = 0
						let originalId = id
						while (items.some(item => item.id === id)) {
							counter++
							id = `${originalId}-${counter}`
						}

						heading.id = id // Set the ID on the element
					}

					items.push({id, title, level})
				}
			})

			setTocItems(items)
		} else {
			// Extract from HTML content
			const items = extractHeadingsFromHTML(content)
			setTocItems(items)
		}
	}, [content])

	useEffect(() => {
		if (tocItems.length === 0) return

		// Add IDs to actual DOM headings
		const headingElements = document.querySelectorAll('.docs-content h1, .docs-content h2, .docs-content h3, .docs-content h4, .docs-content h5, .docs-content h6')

		headingElements.forEach((heading, index) => {
			const tocItem = tocItems[index]
			if (tocItem && !heading.id) {
				heading.id = tocItem.id
			}
		})

		// Intersection Observer for active heading detection
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						setActiveId(entry.target.id)
					}
				})
			},
			{
				rootMargin: '-80px 0px -80% 0px'
			}
		)

		headingElements.forEach((heading) => {
			if (heading.id) {
				observer.observe(heading)
			}
		})

		return () => {
			observer.disconnect()
		}
	}, [tocItems])

	const scrollToHeading = (id: string) => {
		const element = document.getElementById(id)
		if (element) {
			const offset = 80 // Account for fixed header
			const elementPosition = element.offsetTop - offset
			window.scrollTo({
				top: elementPosition,
				behavior: 'smooth'
			})
		}
	}

	return (
		<div className="docs-toc">
			<div className="space-y-2">
				<p className="font-medium">On This Page</p>
				<Separator />
				{tocItems.length === 0 ? (
					<p className="text-sm text-muted-foreground px-3 py-2">
						No headings found
					</p>
				) : (
					<ScrollArea className="pb-6">
						<div className="space-y-1">
							{tocItems.map((item) => (
								<button
									key={item.id}
									onClick={() => scrollToHeading(item.id)}
									className={cn(
										'block w-full text-left px-3 py-1 text-sm rounded transition-colors',
										'text-muted-foreground hover:text-foreground hover:bg-muted',
										{
											'text-foreground bg-muted font-medium': activeId === item.id,
											'pl-6': item.level === 3,
											'pl-9': item.level === 4,
											'pl-12': item.level >= 5
										}
									)}
								>
									{item.title}
								</button>
							))}
						</div>
					</ScrollArea>
				)}
			</div>
		</div>
	)
}

export default TableOfContents
