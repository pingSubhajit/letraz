'use client'

import Lenis from 'lenis'
import {ReactNode, useEffect, useRef} from 'react'

const SmoothScrollProvider = ({ children, className }: { children: ReactNode, className?: string }) => {
	const wrapper = useRef<HTMLDivElement>(null)
	const content = useRef<HTMLDivElement>(null)

	useEffect(() => {
		if (wrapper.current && content.current) {
			const lenis = new Lenis({
				wrapper: wrapper.current,
				content: content.current,
				lerp: 0.12,
				smoothWheel: true, // @ts-ignore
				smoothTouch: false,
			})

			function raf(time: any) {
				lenis.raf(time)
				requestAnimationFrame(raf)
			}

			requestAnimationFrame(raf)
		}
	}, [])

	return (
		<div className={className} ref={wrapper}>
			<main ref={content}>
				{children}
			</main>
		</div>
	)
}

export default SmoothScrollProvider
