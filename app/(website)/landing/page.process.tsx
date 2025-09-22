'use client'

import {useGSAP} from '@gsap/react'
import gsap from 'gsap'
import {ScrollTrigger} from 'gsap/ScrollTrigger'
import ReactLenis from 'lenis/react'
import {type ReactNode, useRef} from 'react'
import {cn} from '@/lib/utils'
import rizeLogo from '@/public/rize-logo.svg'
import Image from 'next/image'
import {Button} from '@/components/ui/button'
import {rizeUrl} from '@/config'

interface CardData {
    id: number | string;
    content: ReactNode;
}

interface StickyCardProps {
	cards: CardData[];
	className?: string;
	containerClassName?: string;
	componentClassName?: string;
}

const StickyCard = ({
	cards,
	className,
	containerClassName,
	componentClassName
}: StickyCardProps) => {
	const container = useRef(null)
	const componentRefs = useRef<(HTMLDivElement | null)[]>([])

	useGSAP(
		() => {
			gsap.registerPlugin(ScrollTrigger)

			const imageElements = componentRefs.current
			const totalCards = imageElements.length

			if (!imageElements[0]) return

			gsap.set(imageElements[0], {y: '0%', scale: 1, rotation: 0})

			const pauseVideoIn = (el: HTMLElement | null) => {
				if (!el) return
				const video = el.querySelector('video') as HTMLVideoElement | null
				if (!video) return
				try {
					video.pause()
				} catch {}
			}

			const restartAndPlayVideoIn = (el: HTMLElement | null) => {
				if (!el) return
				const video = el.querySelector('video') as HTMLVideoElement | null
				if (!video) return

				try {
					video.muted = true
					;(video as any).playsInline = true
					video.setAttribute('playsinline', 'true')
					const tryPlay = () => {
						video.currentTime = 0
						const p = video.play()
						if (p) p.catch(() => {})
					}
					if (video.readyState < 2) {
						const onCanPlay = () => {
							video.removeEventListener('canplay', onCanPlay)
							tryPlay()
						}
						video.addEventListener('canplay', onCanPlay, {once: true})
						video.load()
					} else {
						tryPlay()
					}
				} catch {}
			}

			// If the first card contains a video, ensure it starts from the beginning
			{
				const firstEl = imageElements[0]
				if (firstEl) {
					const video = firstEl.querySelector('video') as HTMLVideoElement | null
					if (video) {
						try {
							video.pause()
							video.currentTime = 0
							const playPromise = video.play()
							if (playPromise) {
								playPromise.catch(() => {})
							}
						} catch {}
					}
				}
			}

			for (let i = 1; i < totalCards; i++) {
				if (!imageElements[i]) continue
				gsap.set(imageElements[i], {y: '100%', scale: 1, rotation: 0})
			}

			const scrollTimeline = gsap.timeline({
				scrollTrigger: {
					trigger: '.sticky-cards',
					start: 'top top',
					end: `+=${window.innerHeight * (totalCards - 1)}`,
					pin: true,
					scrub: 0.5,
					pinSpacing: true
				}
			})

			for (let i = 0; i < totalCards - 1; i++) {
				const currentImage = imageElements[i]
				const nextImage = imageElements[i + 1]
				const position = i
				if (!currentImage || !nextImage) continue

				scrollTimeline.to(
					currentImage,
					{
						scale: 0.7,
						rotation: 5,
						duration: 1,
						ease: 'none'
					},
					position,
				)

				// Pause any video in the outgoing card at the start of its transition
				scrollTimeline.call(() => pauseVideoIn(currentImage), undefined, position)

				scrollTimeline.to(
					nextImage,
					{
						y: '0%',
						duration: 1,
						ease: 'none'
					},
					position,
				)

				// When the next card begins revealing, restart and play any video inside it
				scrollTimeline.call(() => restartAndPlayVideoIn(nextImage), undefined, position + 0.01)
			}

			const resizeObserver = new ResizeObserver(() => {
				ScrollTrigger.refresh()
			})

			if (container.current) {
				resizeObserver.observe(container.current)
			}

			return () => {
				resizeObserver.disconnect()
				scrollTimeline.kill()
				ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
			}
		},
		{scope: container},
	)

	return (
		<div className={cn('relative h-full w-full', className)} ref={container}>
			<div className="sticky-cards relative flex min-h-screen w-full items-center justify-center overflow-hidden p-3 lg:p-8">
				<div
					className={cn(
						'relative h-[90%] w-full max-w-sm overflow-hidden rounded-2xl sm:max-w-md md:max-w-lg lg:max-w-4xl xl:max-w-5xl 2xl:max-w-7xl',
						containerClassName,
					)}
				>
					{cards.map((card, i) => (
						<div
							key={card.id}
							className={cn(
								'absolute h-full w-full',
								componentClassName,
							)}
							ref={(el) => {
								componentRefs.current[i] = el
							}}
						>
							{card.content}
						</div>
					))}
				</div>
			</div>
		</div>
	)
}

// Demo components to showcase composability in the sticky cards
const StepOne = () => (
	<div className="h-full w-full rounded-2xl bg-[#DDE9D3] flex flex-col justify-between items-center pt-32 px-24">
		<div className="text-center max-w-2xl">
			<p className="uppercase tracking-wider text-sm">Step 1</p>
			<h2 className="mt-2 text-5xl font-medium leading-tight">Upload your resume once</h2>
			<p className="mt-5 text-lg">We ask you to enter your details or upload your resume once when you get started. That's our way of getting to know you. Once you do it, applying for jobs become 10x easier</p>
		</div>

		<div className="bg-white aspect-video w-3/4 rounded-t-2xl">

		</div>
	</div>
)

const StepTwo = () => (
	<div className="h-full w-full rounded-2xl bg-[#E5EAF3] flex flex-col justify-between items-center pt-32 px-24">
		<div className="text-center max-w-2xl">
			<p className="uppercase tracking-wider text-sm">Step 2</p>
			<h2 className="mt-2 text-5xl font-medium leading-tight">Find a job you like</h2>
			<p className="mt-5 text-lg">We ask you to enter your details or upload your resume once when you get started. That's our way of getting to know you. Once you do it, applying for jobs become 10x easier</p>
		</div>

		<div className="bg-white aspect-video w-3/4 rounded-t-2xl">

		</div>
	</div>
)

const StepThree = () => (
	<div className="h-full w-full rounded-2xl bg-[#F4F0E7] flex flex-col justify-between items-center pt-32 px-24">
		<div className="text-center max-w-2xl">
			<p className="uppercase tracking-wider text-sm">Step 3</p>
			<h2 className="mt-2 text-5xl font-medium leading-tight">Download, apply with confidence</h2>
			<p className="mt-5 text-lg">We ask you to enter your details or upload your resume once when you get started. That's our way of getting to know you. Once you do it, applying for jobs become 10x easier</p>
		</div>

		<div className="bg-white aspect-video w-3/4 rounded-t-2xl">

		</div>
	</div>
)

const RizeCard = () => (
	<div className="h-full w-full rounded-2xl bg-[#fff4c3] flex flex-col justify-between items-center pt-16 px-24 gap-8">
		<div className="text-center max-w-2xl">
			<Image src={rizeLogo} alt="Infosys logo" className="w-28" />
			<h2 className="mt-2 text-5xl font-bold leading-tight">Why stick to just resumes? Build your portfolio</h2>
			<p className="mt-5 text-lg">We ask you to enter your details or upload your resume once when you get started. That's our way of getting to know you. Once you do it, applying for jobs become 10x easier</p>
			<a href={rizeUrl} target="_blank">
				<Button size="lg" className="mt-5 bg-[#FFD936] hover:bg-[#e0bf2f] rounded-full text-foreground">Try Rize out</Button>
			</a>
		</div>

		<div className="bg-white aspect-video w-3/4 rounded-t-2xl overflow-hidden">
			<video src="/rize-video.mp4" loop autoPlay muted playsInline preload="auto"></video>
		</div>
	</div>
)

// Example usage component with default data
const LandingPageProcess = () => {
	const defaultCards: CardData[] = [
		{id: 1, content: <StepOne />},
		{id: 2, content: <StepTwo />},
		{id: 3, content: <StepThree />},
		{id: 4, content: <RizeCard />}
	]

	return (
		<ReactLenis root>
			<div className="h-full w-full">
				<StickyCard cards={defaultCards} />
			</div>
		</ReactLenis>
	)
}

export default LandingPageProcess
