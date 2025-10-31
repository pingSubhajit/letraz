'use client'

import React, {useEffect, useRef, useState} from 'react'
import {cn} from '@/lib/utils'
import {AnimatePresence, motion} from 'motion/react'

interface ScrollMaskProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
  maskHeight?: number
  showTop?: boolean
  showBottom?: boolean
}

const ScrollMask: React.FC<ScrollMaskProps> = ({
	children,
	className,
	maskHeight = 48,
	showTop = true,
	showBottom = true,
	...rest
}) => {
	const [scrollState, setScrollState] = useState({
		canScrollUp: false,
		canScrollDown: false,
		isScrolling: false
	})
	const scrollRef = useRef<HTMLDivElement>(null)
	const scrollTimeoutRef = useRef<NodeJS.Timeout>(null)

	const checkScrollability = () => {
		if (!scrollRef.current) return

		const {scrollTop, scrollHeight, clientHeight} = scrollRef.current
		const canScrollUp = scrollTop > 0
		const canScrollDown = scrollTop < scrollHeight - clientHeight - 1

		setScrollState(prev => ({
			...prev,
			canScrollUp,
			canScrollDown
		}))
	}

	const handleScroll = () => {
		setScrollState(prev => ({...prev, isScrolling: true}))

		// Clear existing timeout
		if (scrollTimeoutRef.current) {
			clearTimeout(scrollTimeoutRef.current)
		}

		// Set scrolling to false after scroll ends
		scrollTimeoutRef.current = setTimeout(() => {
			setScrollState(prev => ({...prev, isScrolling: false}))
		}, 150)

		checkScrollability()
	}

	useEffect(() => {
		const scrollElement = scrollRef.current
		if (!scrollElement) return

		// Initial check
		checkScrollability()

		// Add scroll listener
		scrollElement.addEventListener('scroll', handleScroll, {passive: true})

		// Check on resize
		const resizeObserver = new ResizeObserver(checkScrollability)
		resizeObserver.observe(scrollElement)

		return () => {
			scrollElement.removeEventListener('scroll', handleScroll)
			resizeObserver.disconnect()
			if (scrollTimeoutRef.current) {
				clearTimeout(scrollTimeoutRef.current)
			}
		}
	}, [])

	return (
		<div className={cn('relative', className)} {...rest}>
			{/* Top fade mask */}
			<AnimatePresence>
				{showTop && scrollState.canScrollUp && (
					<motion.div
						initial={{opacity: 0}}
						animate={{opacity: 1}}
						exit={{opacity: 0}}
						className={cn(
							'absolute top-0 left-0 right-0 z-10 pointer-events-none transition-opacity duration-300 bg-gradient-to-b from-[#FAFAFA] to-transparent',
							scrollState.canScrollUp ? 'opacity-100' : 'opacity-0'
						)}
						style={{
							height: `${maskHeight}px`
						}}
					/>
				)}
			</AnimatePresence>

			{/* Bottom fade mask */}
			<AnimatePresence>
				{showBottom && scrollState.canScrollDown && (
					<motion.div
						initial={{opacity: 0}}
						animate={{opacity: 1}}
						exit={{opacity: 0}}
						className={cn(
							'absolute bottom-0 left-0 right-0 z-10 pointer-events-none transition-opacity duration-300 bg-gradient-to-t from-[#FAFAFA] to-transparent',
							scrollState.canScrollDown ? 'opacity-100' : 'opacity-0'
						)}
						style={{
							height: `${maskHeight}px`
						}}
					/>
				)}
			</AnimatePresence>

			{/* Scrollable content */}
			<div ref={scrollRef} className="h-full overflow-y-auto hide-scrollbar">
				{children}
			</div>
		</div>
	)
}

export default ScrollMask
