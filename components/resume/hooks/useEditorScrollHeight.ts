'use client'

import {useCallback, useEffect, useRef, useState} from 'react'

const useEditorScrollHeight = (bottomPadding = 60) => {
	const containerRef = useRef<HTMLDivElement | null>(null)
	const [height, setHeight] = useState<number | null>(null)

	const measure = useCallback(() => {
		if (typeof window === 'undefined') return
		const node = containerRef.current
		if (!node) return

		const rect = node.getBoundingClientRect()
		const availableHeight = window.innerHeight - rect.top - bottomPadding
		setHeight(availableHeight > 0 ? availableHeight : null)
	}, [bottomPadding])

	useEffect(() => {
		measure()
		const handleResize = () => measure()
		window.addEventListener('resize', handleResize)
		return () => {
			window.removeEventListener('resize', handleResize)
		}
	}, [measure])

	return {
		containerRef,
		scrollStyle: height ? {height, maxHeight: height} : undefined,
		remeasure: measure
	}
}

export default useEditorScrollHeight
