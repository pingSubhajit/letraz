'use client'

import {cn} from '@/lib/utils'
import {AnimatePresence, motion} from 'motion/react'
import {useEffect, useRef, useState} from 'react'
import {supportEmail} from '@/config'
import {ChevronDown} from 'lucide-react'

const MotionChevronDown = motion(ChevronDown)

const faqItems = [
	{
		question: 'How is Letraz different from other resume builders?',
		answer: 'Letraz goes beyond just formatting resumes, it thinks about your application. Traditional builders give you templates to fill, Letraz uses AI to understand the job and your profile, then tailors your resume’s wording, structure, and tone to maximize your chances of getting shortlisted.'
	},
	{
		question: 'Will my resume really be tailored to each job I apply for?',
		answer: 'Yes, that’s the whole point of Letraz. Each time you paste a job description, Letraz analyzes it to understand what the company is looking for and then adapts your resume automatically, highlighting the most relevant skills, adjusting phrasing, and reordering sections if needed.'
	},
	{
		question: 'Do I need to write everything from scratch?',
		answer: 'Not at all. Letraz handles the heavy lifting for you. During onboarding, it collects your details once, and from there, you can generate multiple tailored resumes without re-entering anything. You can also edit or refine any part of your resume manually if you want to.'
	},
	{
		question: 'Can I use Letraz with any job site or application portal?',
		answer: 'Yes! Letraz works with any job portal. You can paste the link from anywhere, LinkedIn, Indeed, company career pages and Letraz will instantly understand it. The final resume is exported as a standard PDF, perfectly formatted and ready to upload wherever you apply.'
	},
	{
		question: 'Is my personal data secure with Letraz?',
		answer: 'Absolutely. Your data is encrypted and stored securely, and we never share it with third parties. Letraz only uses your information to generate resumes for you. You stay in full control of your data at all times, with the option to edit or delete it whenever you want.'
	}
]

const LandingPageFaq = ({
	className
}: {
	className?: string;
}) => {
	const [activeIndex, setActiveIndex] = useState<number | null>(1)
	const [isLargeScreen, setIsLargeScreen] = useState<boolean>(false)

	// Measure container width and gap to compute a fixed text width for the expanded state
	const containerRef = useRef<HTMLDivElement | null>(null)
	const [containerWidth, setContainerWidth] = useState(0)
	const [columnGap, setColumnGap] = useState(0)

	useEffect(() => {
		if (typeof window === 'undefined') return
		const mq = window.matchMedia('(min-width: 1024px)')
		const setMatches = (value: boolean) => setIsLargeScreen(value)
		setMatches(mq.matches)
		const listener = (event: MediaQueryListEvent) => setMatches(event.matches)
		if (typeof mq.addEventListener === 'function') {
			mq.addEventListener('change', listener)
			return () => mq.removeEventListener('change', listener)
		}
		mq.addListener(listener)
		return () => mq.removeListener(listener)
	}, [])

	useEffect(() => {
		if (!isLargeScreen) {
			setContainerWidth(0)
			setColumnGap(0)
			return
		}
		if (!containerRef.current) return
		const element = containerRef.current
		const updateMeasurements = () => {
			const rect = element.getBoundingClientRect()
			setContainerWidth(rect.width)
			const styles = getComputedStyle(element)
			const gapValue = parseFloat(styles.columnGap || (styles as any).gap || '0')
			setColumnGap(Number.isFinite(gapValue) ? gapValue : 0)
		}
		updateMeasurements()
		const ro = new ResizeObserver(() => updateMeasurements())
		ro.observe(element)
		return () => ro.disconnect()
	}, [isLargeScreen])

	useEffect(() => {
		if (isLargeScreen && activeIndex === null) {
			setActiveIndex(0)
		}
	}, [isLargeScreen, activeIndex])

	// Keep grow factors in one place so UI and measurement stay in sync
	const collapsedGrow = 1.5
	const expandedGrow = 3.5
	const itemsCount = faqItems.length
	const totalGrow = expandedGrow + (itemsCount - 1) * collapsedGrow
	const usableWidth = Math.max(0, containerWidth - columnGap * (itemsCount - 1))
	const expandedCardWidth = totalGrow > 0 ? (usableWidth * expandedGrow) / totalGrow : 0
	const paddingPx = 16 // matches p-4 on the card
	const paddingExpandedPx = 32 // matches p-4 on the card
	const fixedTextWidth = Math.max(0, expandedCardWidth - paddingExpandedPx * 2)

	// Collapsed-state fixed width for the question text
	const collapsedCardWidth = totalGrow > 0 ? (usableWidth * collapsedGrow) / totalGrow : 0
	const fixedCollapsedTextWidth = Math.max(0, collapsedCardWidth - paddingPx * 2)

	const handleActivate = (index: number) => {
		if (isLargeScreen) {
			setActiveIndex(index)
			return
		}
		setActiveIndex((current) => current === index ? null : index)
	}

	return (
		<section className="w-full space-y-12 sm:space-y-16 px-4 sm:px-6 lg:px-0 antialiased">
			<div className="space-y-3 sm:space-y-4 px-4">
				<h2 className="text-4xl sm:text-5xl flex flex-col leading-tight font-medium">
					<span>Frequently</span>
					<span>asked <span className="text-flame-500">questions</span></span>
				</h2>

				<p className="max-w-xl text-sm sm:text-base text-neutral-600 leading-relaxed sm:leading-7">
					These are the answers to the most common question we are asked. If you still have some other question, feel free to reach us out
					at <a href={`mailto:${supportEmail}`} className="text-flame-500 font-medium">{supportEmail}</a>
				</p>
			</div>

			{isLargeScreen ? (
				<motion.div
					initial={{opacity: 0, translateY: 20}}
					animate={{opacity: 1, translateY: 0}}
					transition={{
						duration: 0.3,
						delay: 0.5
					}}
					className={cn('relative w-full px-4', className)}
				>
					<motion.div
						initial={{opacity: 0}}
						animate={{opacity: 1}}
						transition={{duration: 0.3}}
						className="w-full"
					>
						<div ref={containerRef} className="flex w-full  items-stretch gap-1">
							{faqItems.map((item, index) => {
								const isActive = activeIndex === index
								return (
									<motion.div
										key={index}
										className={cn(
											'relative basis-0 cursor-pointer overflow-hidden rounded-3xl bg-neutral-200 p-4 transition-colors duration-300 ease-in-out',
											isActive && 'bg-flame-500'
										)}
										initial={{height: '24rem', flexGrow: collapsedGrow}}
										animate={{
											flexGrow: isActive ? expandedGrow : collapsedGrow,
											height: '24rem'
										}}
										transition={{duration: 0.3, ease: 'easeInOut'}}
										onClick={() => handleActivate(index)}
										onHoverStart={() => handleActivate(index)}
										role="button"
										aria-expanded={isActive}
									>
										{/* Inactive Question */}
										<AnimatePresence>
											{!isActive && <motion.h3
												initial={{y: -16, opacity: 1}}
												animate={{y: 0, opacity: 1}}
												exit={{y: -16, opacity: 0}}
												transition={{duration: 0.2, ease: 'easeInOut'}}
												className="absolute bottom-8 left-4 text-xl text-neutral-800/90"
												style={fixedCollapsedTextWidth ? {width: fixedCollapsedTextWidth} : undefined}
											>
												{item.question}
											</motion.h3>}
										</AnimatePresence>

										{/* Answer */}
										<AnimatePresence>
											{isActive && (
												<motion.div
													initial={{opacity: 0, y: 10}}
													animate={{opacity: 1, y: 0}}
													exit={{opacity: 0, y: 10}}
													transition={{duration: 0.25}}
													className="absolute inset-0 flex h-full w-full flex-col justify-end p-8 space-y-4"
												>
													<h3
														className="text-neutral-50/90 text-2xl"
														style={fixedTextWidth ? {width: fixedTextWidth} : undefined}
													>
														{item.question}
													</h3>

													<p className="text-neutral-50/70 text-xl" style={fixedTextWidth ? {width: fixedTextWidth - 16} : undefined}>
														{item.answer}
													</p>
												</motion.div>
											)}
										</AnimatePresence>
									</motion.div>
								)
							})}
						</div>
					</motion.div>
				</motion.div>
			) : (
				<div className={cn('flex w-full flex-col gap-3 sm:gap-4', className)}>
					{faqItems.map((item, index) => {
						const isActive = activeIndex === index
						return (
							<motion.div
								key={item.question}
								initial={{opacity: 0, translateY: 12}}
								animate={{opacity: 1, translateY: 0}}
								transition={{duration: 0.2, delay: index * 0.04}}
								className={cn(
									'rounded-2xl overflow-hidden transition-colors border border-flame-500/40',
									isActive ? 'bg-flame-500 text-white' : 'bg-white text-neutral-600'
								)}
							>
								<button
									type="button"
									className="w-full flex items-center justify-between gap-3 sm:gap-4 px-4 py-4 sm:px-6 sm:py-5 text-left"
									onClick={() => handleActivate(index)}
									aria-expanded={isActive}
								>
									<span className="text-sm sm:text-base font-semibold sm:font-semibold">{item.question}</span>
									<MotionChevronDown
										initial={false}
										animate={{rotate: isActive ? 180 : 0}}
										transition={{duration: 0.2}}
										className={cn(
											'h-5 w-5 shrink-0 transition-colors',
											isActive ? 'text-white' : 'text-flame-500'
										)}
									/>
								</button>
								<AnimatePresence initial={false}>
									{isActive && (
										<motion.div
											key="content"
											initial={{height: 0, opacity: 0}}
											animate={{height: 'auto', opacity: 1}}
											exit={{height: 0, opacity: 0}}
											transition={{duration: 0.2}}
											className="px-4 pb-4 sm:px-6 sm:pb-5 text-xs sm:text-sm font-medium text-white tracking-tight antialiased"
										>
											{item.answer}
										</motion.div>
									)}
								</AnimatePresence>
							</motion.div>
						)
					})}
				</div>
			)}
		</section>
	)
}

export default LandingPageFaq
