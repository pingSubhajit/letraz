'use client'

import {cn} from '@/lib/utils'
import {AnimatePresence, motion} from 'motion/react'
import {useEffect, useRef, useState} from 'react'
import {supportEmail} from '@/config'

const faqItems = [
	{
		question: 'How is Letraz different from other resume builders?',
		answer: 'Yes. It adheres to the WAI-ARIA design pattern. Yes. It adheres to the WAI-ARIA design pattern. Yes. It adheres to the WAI-ARIA design pattern. Yes. It adheres to the WAI-ARIA design pattern.'
	},
	{
		question: 'Will my resume really be tailored to each job I apply for?',
		answer: 'Yes. It adheres to the WAI-ARIA design pattern. Yes. It adheres to the WAI-ARIA design pattern. Yes. It adheres to the WAI-ARIA design pattern. Yes. It adheres to the WAI-ARIA design pattern.'
	},
	{
		question: 'Do I need to write everything from scratch?',
		answer: 'Yes. It adheres to the WAI-ARIA design pattern. Yes. It adheres to the WAI-ARIA design pattern. Yes. It adheres to the WAI-ARIA design pattern. Yes. It adheres to the WAI-ARIA design pattern.'
	},
	{
		question: 'Can I use Letraz with any job site or application portal?',
		answer: 'Yes. It adheres to the WAI-ARIA design pattern. Yes. It adheres to the WAI-ARIA design pattern. Yes. It adheres to the WAI-ARIA design pattern. Yes. It adheres to the WAI-ARIA design pattern.'
	},
	{
		question: 'Is my personal data secure with Letraz?',
		answer: 'Yes. It adheres to the WAI-ARIA design pattern. Yes. It adheres to the WAI-ARIA design pattern. Yes. It adheres to the WAI-ARIA design pattern. Yes. It adheres to the WAI-ARIA design pattern.'
	}
]

const LandingPageFaq = ({
	className
}: {
	className?: string;
}) => {
	const [activeIndex, setActiveIndex] = useState<number | null>(1)

	// Measure container width and gap to compute a fixed text width for the expanded state
	const containerRef = useRef<HTMLDivElement | null>(null)
	const [containerWidth, setContainerWidth] = useState(0)
	const [columnGap, setColumnGap] = useState(0)

	useEffect(() => {
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
	}, [])

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

	return (
		<section className="w-full space-y-16">
			<div className="space-y-4">
				<h2 className="text-5xl flex flex-col leading-tight font-medium">
					<span>Frequently</span>
					<span>asked <span className="text-flame-500">questions</span></span>
				</h2>

				<p className="max-w-xl">
					These are the answers to the most common question we are asked. If you still have some other question, feel free to reach us out
					at <a href={`mailto:${supportEmail}`} className="text-flame-500 font-medium">{supportEmail}</a>
				</p>
			</div>

			<motion.div
				initial={{opacity: 0, translateY: 20}}
				animate={{opacity: 1, translateY: 0}}
				transition={{
					duration: 0.3,
					delay: 0.5
				}}
				className={cn('relative w-full', className)}
			>
				<motion.div
					initial={{opacity: 0}}
					animate={{opacity: 1}}
					transition={{duration: 0.3}}
					className="w-full"
				>
					<div ref={containerRef} className="flex w-full items-stretch gap-1">
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
									onClick={() => setActiveIndex(index)}
									onHoverStart={() => setActiveIndex(index)}
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
		</section>
	)
}

export default LandingPageFaq
