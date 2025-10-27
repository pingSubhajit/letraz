'use client'

import {useEffect, useRef} from 'react'
import {cn} from '@/lib/utils'
import SafariMockup from '@/components/ui/safari-mockup'

const HeroVideoSequence = ({className}: {className?: string}) => {
	const canvasRef = useRef<HTMLCanvasElement | null>(null)
	const mockupRef = useRef<HTMLDivElement | null>(null)
	const frameStateRef = useRef({frame: 0})
	const imagesCacheRef = useRef<Map<number, HTMLImageElement>>(new Map())
	const lastDrawnRef = useRef<number>(-1)
	const canvasSizeRef = useRef<{width: number; height: number}>({width: 0, height: 0})
	const rafScheduledRef = useRef(false)
	const pendingIndexRef = useRef<number | null>(null)

	useEffect(() => {
		const canvas = canvasRef.current
		if (!canvas) return
		const context = canvas.getContext('2d', {alpha: false})
		if (!context) return

		let cleanup: (() => void) | undefined
		let activated = false

		const activate = async () => {
			if (activated) return
			activated = true
			const [{default: gsap}, {ScrollTrigger}] = await Promise.all([
				import('gsap'),
				import('gsap/ScrollTrigger')
			])
			gsap.registerPlugin(ScrollTrigger)
			gsap.ticker.lagSmoothing(0)

			const frameCount = 362
			const getFrameSrc = (i: number) => `/landing-sequence/frame${i.toString().padStart(3, '0')}.webp`

			const setCanvasSize = () => {
				const dpr = Math.min(window.devicePixelRatio || 1, 2)
				const {clientWidth, clientHeight} = canvas
				canvasSizeRef.current = {width: clientWidth, height: clientHeight}
				canvas.width = Math.max(1, Math.floor(clientWidth * dpr))
				canvas.height = Math.max(1, Math.floor(clientHeight * dpr))
				context.setTransform(dpr, 0, 0, dpr, 0, 0)
			}

			const drawFrame = (index: number) => {
				if (index === lastDrawnRef.current) return
				const cached = imagesCacheRef.current.get(index)
				if (cached && cached.complete) {
					const {width: clientWidth, height: clientHeight} = canvasSizeRef.current
					context.fillStyle = '#ffffff'
					context.fillRect(0, 0, clientWidth, clientHeight)
					const imgAspect = cached.width / cached.height || 1
					const canvasAspect = clientWidth / clientHeight || 1
					let drawWidth = clientWidth
					let drawHeight = clientHeight
					// Use 'contain' behavior - fit entire image within canvas
					if (imgAspect > canvasAspect) {
						drawWidth = clientWidth
						drawHeight = drawWidth / imgAspect
					} else {
						drawHeight = clientHeight
						drawWidth = drawHeight * imgAspect
					}
					const dx = (clientWidth - drawWidth) / 2
					const dy = (clientHeight - drawHeight) / 2
					context.imageSmoothingQuality = 'high'
					context.drawImage(cached, dx, dy, drawWidth, drawHeight)
					lastDrawnRef.current = index
				}
			}

			const loadFrame = (index: number) => {
				if (imagesCacheRef.current.has(index)) return
				const img = new Image()
				img.decoding = 'async'
				img.loading = 'eager'
				img.src = getFrameSrc(index)
				img.onload = () => {
					imagesCacheRef.current.set(index, img)
					if (index === Math.round(frameStateRef.current.frame)) {
						drawFrame(index)
					}
				}
				img.onerror = () => {}
			}

			const preloadLookahead = (index: number, lookahead: number) => {
				const start = Math.max(0, index)
				const end = Math.min(frameCount - 1, index + lookahead)
				for (let i = start; i <= end; i += 1) loadFrame(i)
			}

			setCanvasSize()
			preloadLookahead(0, 24)

			const tryInitialDraw = () => {
				if (imagesCacheRef.current.get(0)?.complete) {
					drawFrame(0)
					return true
				}
				return false
			}
			if (!tryInitialDraw()) setTimeout(() => {tryInitialDraw()}, 50)

			const scrubAmount = 0.5
			// Adjust scroll length based on screen size to match container height
			const isLargeScreen = window.innerWidth >= 1024
			const isMediumScreen = window.innerWidth >= 640

			/*
			 * Calculate scroll length to match exactly with the parent container height
			 * The canvas is absolutely positioned, so we need to account for its starting position
			 */
			const canvasTopOffset = isLargeScreen ? 500 : isMediumScreen ? 400 : 330
			const containerHeight = isLargeScreen ? 530 : isMediumScreen ? 400 : 300

			/*
			 * Scroll length should be: (containerHeight * vh - canvasTopOffset - viewport height)
			 * This ensures the pin duration matches exactly with when the canvas should release
			 */
			const scrollLength = Math.max(
				(containerHeight * window.innerHeight / 100) - canvasTopOffset - window.innerHeight,
				isLargeScreen ? 2000 : isMediumScreen ? 1500 : 1000
			)

			const topOffsetPx = 120
			const scheduleDraw = (idx: number) => {
				pendingIndexRef.current = idx
				if (rafScheduledRef.current) return
				rafScheduledRef.current = true
				requestAnimationFrame(() => {
					rafScheduledRef.current = false
					const i = pendingIndexRef.current
					if (i != null) drawFrame(i)
				})
			}

			const tween = gsap.to(frameStateRef.current, {
				frame: frameCount - 1,
				snap: {frame: 1},
				ease: 'none',
				onUpdate: () => {
					const idx = Math.round(frameStateRef.current.frame)
					scheduleDraw(idx)
					preloadLookahead(idx, 24)
				},
				scrollTrigger: {
					trigger: mockupRef.current || canvas,
					start: `top top+=${topOffsetPx}`,
					end: `+=${scrollLength}`,
					pin: mockupRef.current || true,
					pinSpacing: true,
					scrub: scrubAmount,
					anticipatePin: 1,
					invalidateOnRefresh: true
				}
			})

			const handleResize = () => {
				setCanvasSize()
				drawFrame(Math.round(frameStateRef.current.frame))
				ScrollTrigger.refresh()
			}
			window.addEventListener('resize', handleResize)

			cleanup = () => {
				window.removeEventListener('resize', handleResize)
				tween.scrollTrigger?.kill()
				tween.kill()
				imagesCacheRef.current.clear()
			}
		}

		const io = new IntersectionObserver((entries) => {
			if (entries.some(e => e.isIntersecting)) {
				io.disconnect()
				activate()
			}
		}, {rootMargin: '200px'})
		io.observe(canvas)

		return () => {
			io.disconnect()
			cleanup?.()
		}
	}, [])

	return (
		<SafariMockup ref={mockupRef} className={cn('block', className)}>
			<canvas ref={canvasRef} className={cn('block h-full w-full')}></canvas>
		</SafariMockup>
	)
}

export default HeroVideoSequence
