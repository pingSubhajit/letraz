'use client'

import gsap from 'gsap'
import {ScrollTrigger} from 'gsap/ScrollTrigger'
import {useEffect, useRef, useState} from 'react'
import Image, {StaticImageData} from 'next/image'
import brainImg from '@/public/brain.webp'
import bannerImg from '@/public/banner.png'
import landingBgImg from '@/public/landing-bg.jpg'
import {cn} from '@/lib/utils'

type Feature = {
    title: string
    description: string
    image: StaticImageData
}

const featuresData: Feature[] = [
	{
		title: 'Import your information from resume or LinkedIn',
		description:
            'Upload your existing resume or connect your LinkedIn profile, and we will read and understand your information. ' +
            'We then create a base resume for you which you will then maintain. ' +
            'That resume is the only resume that holds every single piece of your information.',
		image: brainImg
	},
	{
		title: 'Paste the description or link of any job you\'re applying for',
		description:
            'In the dashboard, paste the job description or the job link and hit enter. ' +
            'Our system will magically read the job description, understand what the company is ' +
            'looking for and how your unique skill-set matches their requirement. ' +
            'Then we craft your resume that makes you stand out from other in that role for that company.',
		image: bannerImg
	},
	{
		title: 'Download tailored resume or edit further',
		description:
            'Once your tailored resume is generated, you can go ahead and directly download it. ' +
            'Or you can use our in-depth resume editor to make further adjustments. ' +
            'Our intelligent system learns from your changes and will respect them the next time.',
		image: landingBgImg
	}
]

const PageFeatures = ({className}: {className?: string}) => {
	const [activeIndex, setActiveIndex] = useState(0)
	const [progress, setProgress] = useState(0) // 0..1 within current slide
	const [railProgress, setRailProgress] = useState(0) // 0..1 overall scroll within section
	const sectionRef = useRef<HTMLElement | null>(null)
	const scrollStateRef = useRef({index: 0})

	const numSlides = featuresData.length

	useEffect(() => {
		gsap.registerPlugin(ScrollTrigger)
		gsap.ticker.lagSmoothing(0)

		const section = sectionRef.current
		if (!section) return

		const scrubAmount = 0.5
		const scrollLength = Math.max(window.innerHeight * 3, 1500)
		const topOffsetPx = 120

		const tween = gsap.to(scrollStateRef.current, {
			index: numSlides - 1,
			snap: {index: 1},
			ease: 'none',
			onUpdate: () => {
				const st = tween.scrollTrigger
				const overall = st ? st.progress : 0
				const rawIndex = overall * Math.max(1, numSlides - 1)
				const idx = Math.min(numSlides - 1, Math.floor(rawIndex))
				const frac = rawIndex - idx
				setActiveIndex(idx)
				setProgress(frac)
				setRailProgress(overall)
			},
			scrollTrigger: {
				trigger: section,
				start: `top top+=${topOffsetPx}`,
				end: `+=${scrollLength}`,
				pin: section,
				pinSpacing: true,
				scrub: scrubAmount,
				anticipatePin: 1
			}
		})

		const handleResize = () => {
			ScrollTrigger.refresh()
		}
		window.addEventListener('resize', handleResize)

		return () => {
			window.removeEventListener('resize', handleResize)
			tween.scrollTrigger?.kill()
			tween.kill()
		}
	}, [numSlides])

	return (
		<section ref={sectionRef} className={cn('px-6 sm:px-8', className)}>
			<div className="max-w-3xl mx-auto">
				<h2 className="text-center text-4xl">Do you send the same resume everywhere?</h2>
				<h3 className="text-center text-3xl mt-0.5">Never again with Letraz</h3>
				<p className="text-center mt-3 max-w-2xl mx-auto">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Alias, delectus dolorem doloribus earum esse ex laboriosam minus necessitatibus nihil odit officia, omnis quae similique!</p>
			</div>

			<div className="mt-24 mx-auto max-w-6xl grid grid-cols-12 gap-10">
				{/* Left: Feature list with progress rail */}
				<div className="col-span-12 lg:col-span-6">
					<div className="relative pl-6">
						{/* Continuous rail with separators */}
						<span className="absolute left-0 top-0 bottom-0 w-[2px] rounded-full bg-neutral-200 overflow-hidden">
							{/* Fill */}
							<span
								className="absolute left-0 top-0 w-full bg-flame-400"
								style={{height: `${railProgress * 100}%`}}
							/>
							{/* Separators (stay visible over fill) */}
							<span
								className="pointer-events-none absolute left-0 right-0 h-2 bg-neutral-50"
								style={{top: `${100 / numSlides}%`}}
							/>
							<span
								className="pointer-events-none absolute left-0 right-0 h-2 bg-neutral-50"
								style={{top: `${(100 / numSlides) * 2}%`}}
							/>
						</span>

						<div className="space-y-8">
							{featuresData.map((feature, index) => {
								const isActive = index === activeIndex

								return (
									<div
										key={feature.title}
										className={cn(
											'w-full text-left p-4 opacity-60 hover:opacity-100 transition-opacity',
											isActive && 'opacity-100',
										)}
									>
										<h3 className="text-2xl font-medium leading-tight">
											{feature.title}
										</h3>
										<p className="mt-3 max-w-xl">
											{feature.description}
										</p>
									</div>
								)
							})}
						</div>
					</div>
				</div>

				{/* Right: Image area */}
				<div className="col-span-12 lg:col-span-6">
					<div className="relative w-full h-full rounded-3xl overflow-hidden">
						{featuresData.map((feature, index) => (
							<Image
								key={feature.title}
								src={feature.image}
								alt={feature.title}
								fill
								sizes="(min-width: 1024px) 40vw, 100vw"
								className={cn(
									'object-cover transition-opacity duration-500',
									index === activeIndex ? 'opacity-100' : 'opacity-0'
								)}
								priority={index === 0}
							/>
						))}
					</div>
				</div>
			</div>
		</section>
	)
}

export default PageFeatures


