import React, {ReactNode, useEffect, useRef, useState} from 'react'
import {cn} from '@/lib/utils'

interface PDFViewerProps {
	children: ReactNode
	className?: string
}

const PAGE_HEIGHT = 1056 // Approximately A4 height at 96 DPI
const PAGE_WIDTH = 816 // Approximately A4 width at 96 DPI

const Page: React.FC<{ content: ReactNode }> = ({ content }) => {
	return (
		<div className="size-a4 bg-white shadow-lg border border-gray-200 mb-8 overflow-hidden">
			<div className="p-8 h-full overflow-hidden">
				{content}
			</div>
		</div>
	)
}

const SplitContent: React.FC<{ children: ReactNode; onSplit: (pages: ReactNode[]) => void }> = ({ children, onSplit }) => {
	const containerRef = useRef<HTMLDivElement>(null)
	const [isSplit, setIsSplit] = useState(false)

	useEffect(() => {
		console.log('Splitting content')
		if (containerRef.current && !isSplit) {
			setIsSplit(true)
			const splitContent = (element: HTMLElement): ReactNode[] => {
				const pages: ReactNode[] = []
				let currentPage: ReactNode[] = []
				let currentHeight = 0

				const processNode = (node: Node): ReactNode | null => {
					if (node.nodeType === Node.TEXT_NODE) {
						return node.textContent
					} else if (node.nodeType === Node.ELEMENT_NODE) {
						const el = node as HTMLElement
						const style = window.getComputedStyle(el)
						const marginTop = parseInt(style.marginTop, 10)
						const marginBottom = parseInt(style.marginBottom, 10)
						const height = el.offsetHeight + marginTop + marginBottom

						if (currentHeight + height > PAGE_HEIGHT - 64) { // 64px for page padding
							if (currentPage.length > 0) {
								pages.push(currentPage)
								currentPage = []
								currentHeight = 0
							}
						}

						const children = Array.from(el.childNodes).map(processNode).filter(Boolean)
						const props: any = { key: Math.random() }

						Array.from(el.attributes).forEach(attr => {
							props[attr.name] = attr.value
						})

						const reactElement = React.createElement(el.tagName.toLowerCase(), props, ...children)

						currentPage.push(reactElement)
						currentHeight += height

						if (currentHeight > PAGE_HEIGHT - 64) {
							pages.push(currentPage)
							currentPage = []
							currentHeight = 0
						}

						return reactElement
					}
					return null
				}

				Array.from(element.childNodes).forEach(node => {
					const processed = processNode(node)
					if (processed) currentPage.push(processed)
				})

				if (currentPage.length > 0) {
					pages.push(currentPage)
				}

				return pages
			}

			const splitPages = splitContent(containerRef.current)
			onSplit(splitPages)
		}
	}, []) // Run only once on mount

	return <div ref={containerRef} style={{ position: 'absolute', left: '-9999px', width: PAGE_WIDTH }}>{children}</div>
}

export default function A4DocumentViewer({ children, className }: PDFViewerProps) {
	const [pages, setPages] = useState<ReactNode[]>([])

	const handleSplit = (splitPages: ReactNode[]) => {
		setPages(splitPages)
	}

	return (
		<div className={cn('flex flex-col items-center', className)} role="document">
			<SplitContent onSplit={handleSplit}>{children}</SplitContent>
			{pages.map((page, index) => (
				<Page key={index} content={page} />
			))}
		</div>
	)
}