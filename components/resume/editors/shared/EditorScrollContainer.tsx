'use client'

import {useCallback, useEffect} from 'react'
import {cn} from '@/lib/utils'
import ScrollMask from '@/components/ui/scroll-mask'
import useEditorScrollHeight from '@/components/resume/hooks/useEditorScrollHeight'

interface EditorScrollContainerProps {
  children: React.ReactNode
  className?: string
  bottomPadding?: number
  deps?: Array<unknown>
  scrollRef?: React.MutableRefObject<HTMLDivElement | null> | React.RefCallback<HTMLDivElement>
}

const EditorScrollContainer = ({
	children,
	className,
	bottomPadding = 30,
	deps = [],
	scrollRef
}: EditorScrollContainerProps) => {
	const {containerRef, scrollStyle, remeasure} = useEditorScrollHeight(bottomPadding)

	const setRefs = useCallback((node: HTMLDivElement | null) => {
		containerRef.current = node
		if (typeof scrollRef === 'function') {
			scrollRef(node)
		} else if (scrollRef) {
			scrollRef.current = node
		}
	}, [containerRef, scrollRef])

	useEffect(() => {
		remeasure()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [remeasure, ...deps])

	return (
		<div ref={setRefs} className="flex flex-col min-h-0">
			<ScrollMask
				className={cn(
					'h-[calc(100vh-240px)] lg:h-[calc(100vh-160px)] max-h-[calc(100vh-240px)] lg:max-h-[calc(100vh-160px)]',
					className
				)}
				style={scrollStyle}
				data-lenis-prevent
			>
				{children}
			</ScrollMask>
		</div>
	)
}

export default EditorScrollContainer
