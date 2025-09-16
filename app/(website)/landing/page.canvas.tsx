'use client'

import gsap from 'gsap'
import {ScrollTrigger} from 'gsap/ScrollTrigger'
import {useEffect, useRef} from 'react'
import {cn} from '@/lib/utils'
import SafariMockup from '@/components/ui/safari-mockup'

const HeroVideoSequence = ({className}: {className?: string}) => {
	const canvasRef = useRef<HTMLCanvasElement | null>(null)
	const mockupRef = useRef<HTMLDivElement | null>(null)
	const frameStateRef = useRef({frame: 0})
	const imagesCacheRef = useRef<Map<number, HTMLImageElement>>(new Map())
	const lastDrawnRef = useRef<number>(-1)

	useEffect(() => {
		gsap.registerPlugin(ScrollTrigger)
		gsap.ticker.lagSmoothing(0)

		const canvas = canvasRef.current
		if (!canvas) return
		const context = canvas.getContext('2d', {alpha: false})
		if (!context) return

		const frameCount = 362
		const getFrameSrc = (i: number) => `/landing-sequence/frame${i.toString().padStart(3, '0')}.jpg`

		const setCanvasSize = () => {
			const dpr = Math.min(window.devicePixelRatio || 1, 2)
			const {clientWidth, clientHeight} = canvas
			canvas.width = Math.max(1, Math.floor(clientWidth * dpr))
			canvas.height = Math.max(1, Math.floor(clientHeight * dpr))
			context.setTransform(dpr, 0, 0, dpr, 0, 0)
		}

		const drawFrame = (index: number) => {
			if (index === lastDrawnRef.current) return
			const cached = imagesCacheRef.current.get(index)
			if (cached && cached.complete) {
				const {clientWidth, clientHeight} = canvas
				// Clear
				context.clearRect(0, 0, clientWidth, clientHeight)
				// Cover behavior
				const imgAspect = cached.width / cached.height || 1
				const canvasAspect = clientWidth / clientHeight || 1
				let drawWidth = clientWidth
				let drawHeight = clientHeight
				if (imgAspect > canvasAspect) {
					// image is wider than canvas => match height
					drawHeight = clientHeight
					drawWidth = drawHeight * imgAspect
				} else {
					// image is taller than canvas => match width
					drawWidth = clientWidth
					drawHeight = drawWidth / imgAspect
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
			img.onerror = () => {
				// Fail silently; keep going
			}
		}

		const preloadLookahead = (index: number, lookahead: number) => {
			const start = Math.max(0, index)
			const end = Math.min(frameCount - 1, index + lookahead)
			for (let i = start; i <= end; i += 1) {
				loadFrame(i)
			}
		}

		// Initial sizing
		setCanvasSize()
		// Preload the first frame and a small lookahead
		preloadLookahead(0, 6)

		// Draw once the very first frame is available
		const tryInitialDraw = () => {
			if (imagesCacheRef.current.get(0)?.complete) {
				drawFrame(0)
				return true
			}
			return false
		}
		if (!tryInitialDraw()) {
			// Fallback draw after a tiny delay if image decodes later
			setTimeout(() => {
				tryInitialDraw()
			}, 50)
		}

		// Scroll-driven timeline
		const scrubAmount = 0.5
		const scrollLength = Math.max(window.innerHeight * 4, 2000)
		const topOffsetPx = 120
		const tween = gsap.to(frameStateRef.current, {
			frame: frameCount - 1,
			snap: {frame: 1},
			ease: 'none',
			onUpdate: () => {
				const idx = Math.round(frameStateRef.current.frame)
				drawFrame(idx)
				preloadLookahead(idx, 8)
			},
			scrollTrigger: {
				trigger: mockupRef.current || canvas,
				start: `top top+=${topOffsetPx}`,
				end: `+=${scrollLength}`,
				pin: mockupRef.current || true,
				pinSpacing: true,
				scrub: scrubAmount,
				anticipatePin: 1
			}
		})

		// Resize handling
		const handleResize = () => {
			setCanvasSize()
			drawFrame(Math.round(frameStateRef.current.frame))
			ScrollTrigger.refresh()
		}
		window.addEventListener('resize', handleResize)

		return () => {
			window.removeEventListener('resize', handleResize)
			tween.scrollTrigger?.kill()
			tween.kill()
			imagesCacheRef.current.clear()
		}
	}, [])

	return (
		<SafariMockup ref={mockupRef} className={cn('block', className)}>
			<canvas ref={canvasRef} className={cn('block h-full w-full')}></canvas>
		</SafariMockup>
	)
}

export default HeroVideoSequence
