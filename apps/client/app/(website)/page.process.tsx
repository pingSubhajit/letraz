'use client'

import ReactLenis from 'lenis/react'
import {type ReactNode, useEffect, useRef} from 'react'
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

	useEffect(() => {
		const el = container.current
		let cleanup: (() => void) | undefined
		if (!el) return

		const io = new IntersectionObserver((entries) => {
			if (!entries.some((e) => e.isIntersecting)) return
			io.disconnect()
			;(async () => {
				const [{default: gsap}, {ScrollTrigger}] = await Promise.all([
					import('gsap'),
					import('gsap/ScrollTrigger')
				])
				gsap.registerPlugin(ScrollTrigger)

				const imageElements = componentRefs.current
				const totalCards = imageElements.length
				if (!imageElements[0]) return

				gsap.set(imageElements[0], {y: '0%', scale: 1, rotation: 0})
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
						{scale: 0.7, rotation: 5, duration: 1, ease: 'none'},
						position,
					)

					scrollTimeline.to(
						nextImage,
						{y: '0%', duration: 1, ease: 'none'},
						position,
					)
				}

				const resizeObserver = new ResizeObserver(() => {
					ScrollTrigger.refresh()
				})
				if (container.current) resizeObserver.observe(container.current)

				cleanup = () => {
					resizeObserver.disconnect()
					scrollTimeline.kill()
					ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
				}
			})()
		}, {rootMargin: '200px'})

		io.observe(el)
		return () => {io.disconnect(); cleanup?.()}
	}, [])

	return (
		<div className={cn('relative h-full w-full', className)} ref={container}>
			<div className="sticky-cards relative flex min-h-screen w-full items-center justify-center overflow-hidden p-4 sm:p-2 lg:p-8">
				<div
					className={cn(
						'relative min-h-[500px] sm:h-[75%] lg:h-[85%] w-full sm:max-w-xl md:max-w-2xl lg:max-w-4xl xl:max-w-5xl 2xl:max-w-7xl overflow-hidden rounded-2xl',
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
	<div className="min-h-fit sm:h-full w-full rounded-2xl bg-[#DDE9D3] flex flex-col justify-between items-center pt-12 sm:pt-20 lg:pt-32 px-4 sm:px-8 lg:px-24 pb-0">
		<div className="text-center max-w-2xl mb-4 sm:mb-6 lg:mb-8">
			<p className="uppercase tracking-wider text-xs sm:text-sm">Step 1</p>
			<h2 className="mt-1 sm:mt-2 text-2xl sm:text-3xl lg:text-5xl font-medium leading-tight">Upload your resume once</h2>
			<p className="mt-3 sm:mt-4 lg:mt-5 text-sm sm:text-base lg:text-lg">We ask you to enter your details or upload your resume once when you get started. That's our way of getting to know you. Once you do it, applying for jobs become 10x easier</p>
		</div>

		<div className="bg-white aspect-video w-[90%] sm:w-[85%] lg:w-3/4 rounded-t-xl sm:rounded-t-2xl overflow-hidden">
			<video preload="none" loop autoPlay muted playsInline className="w-full">
				<source src="/upload-resume.av1.webm" type="video/webm; codecs=av01" />
				<source src="/upload-resume.webm" type="video/webm; codecs=vp9" />
			</video>
		</div>
	</div>
)

const StepTwo = () => (
	<div className="min-h-fit sm:h-full w-full rounded-2xl bg-[#E5EAF3] flex flex-col justify-between items-center pt-12 sm:pt-20 lg:pt-32 px-4 sm:px-8 lg:px-24 pb-0">
		<div className="text-center max-w-2xl mb-4 sm:mb-6 lg:mb-8">
			<p className="uppercase tracking-wider text-xs sm:text-sm">Step 2</p>
			<h2 className="mt-1 sm:mt-2 text-2xl sm:text-3xl lg:text-5xl font-medium leading-tight">Find a job you like</h2>
			<p className="mt-3 sm:mt-4 lg:mt-5 text-sm sm:text-base lg:text-lg">We ask you to enter your details or upload your resume once when you get started. That's our way of getting to know you. Once you do it, applying for jobs become 10x easier</p>
		</div>

		<div className="bg-white aspect-video w-[90%] sm:w-[85%] lg:w-3/4 rounded-t-xl sm:rounded-t-2xl overflow-hidden">
			<video preload="none" loop autoPlay muted playsInline className="w-full">
				<source src="/find-a-job.av1.webm" type="video/webm; codecs=av01" />
				<source src="/find-a-job.webm" type="video/webm; codecs=vp9" />
			</video>
		</div>
	</div>
)

const StepThree = () => (
	<div className="min-h-fit sm:h-full w-full rounded-2xl bg-[#F4F0E7] flex flex-col justify-between items-center pt-12 sm:pt-20 lg:pt-32 px-4 sm:px-8 lg:px-24 pb-0">
		<div className="text-center max-w-2xl mb-4 sm:mb-6 lg:mb-8">
			<p className="uppercase tracking-wider text-xs sm:text-sm">Step 3</p>
			<h2 className="mt-1 sm:mt-2 text-2xl sm:text-3xl lg:text-5xl font-medium leading-tight">Download, apply with confidence</h2>
			<p className="mt-3 sm:mt-4 lg:mt-5 text-sm sm:text-base lg:text-lg">We ask you to enter your details or upload your resume once when you get started. That's our way of getting to know you. Once you do it, applying for jobs become 10x easier</p>
		</div>

		<div className="bg-white aspect-video w-[90%] sm:w-[85%] lg:w-3/4 rounded-t-xl sm:rounded-t-2xl overflow-hidden">
			<video preload="none" loop autoPlay muted playsInline className="w-full">
				<source src="/download-and-apply.av1.webm" type="video/webm; codecs=av01" />
				<source src="/download-and-apply.webm" type="video/webm; codecs=vp9" />
			</video>
		</div>
	</div>
)

const RizeCard = () => (
	<div className="min-h-fit sm:h-full w-full rounded-2xl bg-[#fff4c3] flex flex-col justify-between items-center pt-12 sm:pt-16 lg:pt-16 px-4 sm:px-8 lg:px-24 pb-0">
		<div className="text-center max-w-2xl mb-4 sm:mb-6 lg:mb-8">
			<Image src={rizeLogo} alt="Rize logo" className="w-16 sm:w-20 lg:w-28 mx-auto" />
			<h2 className="mt-1 sm:mt-2 text-2xl sm:text-3xl lg:text-5xl font-bold leading-tight">Why stick to just resumes? Build your portfolio</h2>
			<p className="mt-3 sm:mt-4 lg:mt-5 text-sm sm:text-base lg:text-lg">We ask you to enter your details or upload your resume once when you get started. That's our way of getting to know you. Once you do it, applying for jobs become 10x easier</p>
			<a href={rizeUrl} target="_blank">
				<Button size="lg" className="mt-3 sm:mt-4 lg:mt-5 bg-[#FFD936] hover:bg-[#e0bf2f] rounded-full text-foreground text-sm sm:text-base">Try Rize out</Button>
			</a>
		</div>

		<div className="bg-white aspect-video w-[90%] sm:w-[85%] lg:w-3/4 rounded-t-xl sm:rounded-t-2xl overflow-hidden">
			<video loop autoPlay muted playsInline preload="none">
				<source src="/rize-video.av1.webm" type="video/webm; codecs=av01" />
				<source src="/rize-video.webm" type="video/webm; codecs=vp9" />
			</video>
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
			<section className="h-full w-full">
				<StickyCard cards={defaultCards} />
			</section>
		</ReactLenis>
	)
}

export default LandingPageProcess
