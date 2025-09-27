'use client'

import {Card} from '@/components/ui/card'
import {FlickeringGrid} from '@/components/ui/flickering-grid'
import Image from 'next/image'
import {motion} from 'motion/react'
import {useEffect, useRef, useState} from 'react'
import resumeQr from '@/public/qr-code.webp'

const RizeAsset = ({isHovered}: {isHovered: boolean}) => {
	return (
		<div className="relative w-full h-full flex items-center justify-center">
			{/* Background card - positioned in back */}
			<motion.div
				className="absolute p-1.5 rounded-2xl border bg-white border-neutral-200 shadow-lg"
				initial={{rotate: -3, scale: 0.8}}
				animate={{
					rotate: isHovered ? -8 : -3,
					scale: isHovered ? 0.85 : 0.8,
					x: isHovered ? -15 : 0,
					y: isHovered ? 10 : 0
				}}
				transition={{duration: 0.3, ease: 'easeOut'}}
				style={{zIndex: 1}}
			>
				<Image
					width={128}
					height={128}
					src="https://i.pinimg.com/736x/d6/c5/80/d6c580c2371fdb09fded07bf026aedf2.jpg"
					alt="Profile example"
					className="aspect-square object-cover w-32 h-32 rounded-2xl"
					loading="lazy"
				/>
			</motion.div>

			{/* Front card with image - positioned in front right */}
			<motion.div
				className="absolute p-1.5 rounded-2xl border bg-white border-neutral-200 shadow-lg"
				initial={{rotate: 8, scale: 0.9, x: 40, y: -20}}
				animate={{
					rotate: isHovered ? 15 : 8,
					scale: isHovered ? 0.95 : 0.9,
					x: isHovered ? 60 : 40,
					y: isHovered ? -35 : -20
				}}
				transition={{duration: 0.3, ease: 'easeOut'}}
				style={{zIndex: 3}}
			>
				<div className="w-28 h-36 relative p-1.5 flex flex-col items-center justify-center overflow-hidden rounded-2xl">
					<Image
						alt="Profile"
						fill
						src="https://i.pinimg.com/736x/13/1d/a6/131da63c3a20267459f91fc842571a28.jpg"
						className="object-cover rounded-xl"
					/>
					<div className="bg-white/90 backdrop-blur-sm text-neutral-800 h-6 bottom-2 tracking-tight text-xs rounded-lg w-[85%] z-10 absolute flex items-center justify-center">
						@beckywasgone
					</div>
				</div>
			</motion.div>

			{/* Profile card - positioned in front left */}
			<motion.div
				className="absolute p-1.5 rounded-2xl border bg-white border-neutral-200 shadow-lg"
				initial={{rotate: -6, scale: 0.85, x: -30, y: 30}}
				animate={{
					rotate: isHovered ? -12 : -6,
					scale: isHovered ? 0.9 : 0.85,
					x: isHovered ? -50 : -30,
					y: isHovered ? 45 : 30
				}}
				transition={{duration: 0.3, ease: 'easeOut'}}
				style={{zIndex: 2}}
			>
				<div className="flex flex-col items-center justify-center w-28 h-32 bg-purple-50 border border-purple-200 rounded-2xl p-2">
					<Image
						width={48}
						height={48}
						src="https://i.pinimg.com/736x/eb/da/ed/ebdaed1c261c9cb22e86481fbb08fa1e.jpg"
						alt="Solana Imani profile picture"
						className="aspect-square object-cover w-12 h-12 rounded-full"
						loading="lazy"
					/>
					<div className="flex flex-col items-center justify-center mt-2">
						<span className="text-xs font-medium tracking-tight text-center">
							Solana Imani
						</span>
						<span className="text-xs tracking-tight opacity-70 text-center">
							@solanaimani
						</span>
					</div>
				</div>
			</motion.div>
		</div>
	)
}

const LandingPageFeatures = () => {
	const [isRizeCardHovered, setIsRizeCardHovered] = useState(false)
	const sectionRef = useRef<HTMLElement | null>(null)
	const [active, setActive] = useState(false)

	useEffect(() => {
		const el = sectionRef.current
		if (!el) return
		const io = new IntersectionObserver((entries) => {
			if (entries.some((e) => e.isIntersecting)) {
				setActive(true)
				io.disconnect()
			}
		}, {rootMargin: '200px'})
		io.observe(el)
		return () => io.disconnect()
	}, [])

	return (
		<section ref={sectionRef} className="w-full px-4">
			{/* Bento Grid Container */}
			<div
				className="grid gap-4 w-full max-w-7xl mx-auto min-h-[800px] lg:min-h-[900px]"
				style={{
					gridTemplateColumns: 'repeat(12, 1fr)',
					gridTemplateRows: 'repeat(8, auto)'
				}}
			>
				<Card
					className="bg-neutral-100 border-none rounded-2xl flex flex-col items-center justify-end px-8 py-4 overflow-hidden relative"
					style={{gridArea: '7 / 10 / 9 / 13'}}
				>
					<Image
						src={resumeQr} alt="QR Code for resume shared by Bruce Wayne"
						className="w-32 aspect-square rounded-b-2xl shadow-2xl absolute -top-12"
					/>

					<p className="text-center text-lg font-medium">
						Instantly share your resume with a QR, always updated
					</p>
				</Card>

				<Card
					className="bg-neutral-100 border-none rounded-2xl flex flex-col justify-between items-center p-8 pb-0 relative overflow-hidden"
					style={{gridArea: '4 / 10 / 7 / 13'}}
				>
					<div className="text-center">
						<h3 className="text-2xl font-medium">Baked-in AI insights</h3>
						<p className="mt-4 text-sm">We suggest you opportunities of improvement, and optimize your resume with built-in AI functionality</p>
					</div>

					{active && (
						<video autoPlay muted loop playsInline preload="metadata" poster="/brain.webp" className="absolute -bottom-32 w-full scale-[200%]">
							<source src="/brain-pulse.webm" type="video/webm"/>
						</video>
					)}
				</Card>

				<Card
					className="rounded-2xl overflow-hidden border-none
					bg-[#F4F0E7] relative"
					style={{gridArea: '4 / 6 / 9 / 10'}}
				>
					<FlickeringGrid className="opacity-40" />

					<div className="text-center absolute left-1/2 -translate-x-1/2 top-8 w-[85%]">
						<h3 className="text-2xl font-semibold">Download PDF & LaTeX version, edit easily</h3>
					</div>

					{active && (
						<video autoPlay muted loop playsInline preload="metadata" poster="/letraz.png" className="w-[85%] absolute left-1/2 -translate-x-1/2 -bottom-16 shadow-2xl rounded-2xl">
							<source src="/resume-generation.webm" type="video/webm"/>
							<source src="/resume-generation.mp4" type="video/mp4"/>
						</video>
					)}
				</Card>

				<Card
					className="bg-neutral-100 rounded-2xl p-8 relative overflow-hidden border-none"
					style={{gridArea: '6 / 1 / 9 / 6'}}
				>
					<p className="text-2xl font-semibold text-center relative z-10 leading-normal max-w-[80%] mx-auto">
						Connects with every single job portal you apply for jobs in
					</p>
					{active && (
						<video autoPlay muted loop playsInline preload="metadata" poster="/logo_mono.png" className="w-full absolute left-0 -bottom-16">
							<source src="/logo-carousel.webm" type="video/webm"/>
							<source src="/logo-carousel.mp4" type="video/mp4"/>
						</video>
					)}
				</Card>

				<Card
					className="bg-[#FFF4C2] border-none rounded-2xl flex justify-between items-center p-8 pb-0 relative overflow-hidden gap-4"
					style={{gridArea: '4 / 1 / 6 / 6'}}
					onMouseEnter={() => setIsRizeCardHovered(true)}
					onMouseLeave={() => setIsRizeCardHovered(false)}
				>
					<div className="w-[55%]">
						<h3 className="text-3xl font-medium">Share your bio</h3>
						<p className="mt-4">With Rize, create and share your bio, your portfolio, with just one link, always updated</p>
					</div>

					<div className="w-[45%] h-full">
						<RizeAsset isHovered={isRizeCardHovered} />
					</div>
				</Card>

				<Card
					className="bg-[#F54A22] rounded-2xl relative overflow-hidden p-8 border-none"
					style={{gridArea: '1 / 1 / 4 / 6'}}
				>
					<div className="z-10 relative text-neutral-50 text-center">
						<h3 className="text-3xl font-medium">Apply with confidence</h3>
						<p className="mt-4 opacity-90 max-w-[80%] mx-auto leading-snug">
							Put out the best possible version of your resume for that hiring manager to judge you on
						</p>
					</div>
					<video
						autoPlay
						muted
						loop
						playsInline
						preload="auto"
						className="w-full absolute -bottom-28 left-0">
						<source src="/resume-cards.mp4" type="video/mp4"/>
					</video>
				</Card>

				<Card
					className="rounded-2xl border-none
					bg-[radial-gradient(circle,rgba(245,245,245,1)_0%,rgba(229,229,229,1)_100%)]
					flex justify-between items-center gap-8 p-8"
					style={{gridArea: '1 / 6 / 4 / 13'}}
				>
					<div className="w-[55%]">
						<h3 className="text-3xl font-medium">Edit and tweak easily</h3>
						<p className="mt-4">Make changes to your resume with our state of the art editor, making your life easily all the way</p>
					</div>

					<div className="bg-white aspect-square w-[45%] rounded-2xl overflow-hidden">
						{active && (
							<video autoPlay muted loop playsInline preload="metadata" poster="/letraz.png" className="h-full">
								<source src="/tweak-resume.webm" type="video/webm"/>
								<source src="/tweak-resume.mp4" type="video/mp4"/>
							</video>
						)}
					</div>
				</Card>
			</div>
		</section>
	)
}

export default LandingPageFeatures
