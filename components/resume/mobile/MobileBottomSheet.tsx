'use client'

import {ReactNode, useRef} from 'react'
import {motion, PanInfo, useAnimation} from 'motion/react'
import {cn} from '@/lib/utils'
import {BOTTOM_SHEET} from '@/lib/constants'

interface MobileBottomSheetProps {
	isExpanded: boolean
	onExpandChange: (expanded: boolean) => void
	children: ReactNode
	className?: string
}

// Re-export for convenience
const {COLLAPSED_HEIGHT, EXPANDED_HEIGHT_VH} = BOTTOM_SHEET

const MobileBottomSheet = ({
	isExpanded,
	onExpandChange,
	children,
	className
}: MobileBottomSheetProps) => {
	const controls = useAnimation()
	const sheetRef = useRef<HTMLDivElement>(null)

	const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
		const velocity = info.velocity.y
		const offset = info.offset.y

		// If dragging down with significant velocity or offset, collapse
		if (velocity > 500 || offset > 100) {
			onExpandChange(false)
		}
		// If dragging up with significant velocity or offset, expand
		else if (velocity < -500 || offset < -100) {
			onExpandChange(true)
		}
		// Otherwise, stay in current state
		else {
			controls.start({
				y: isExpanded ? 0 : window.innerHeight * (1 - EXPANDED_HEIGHT_VH / 100) - COLLAPSED_HEIGHT
			})
		}
	}

	const sheetVariants = {
		collapsed: {
			height: `${COLLAPSED_HEIGHT}px`,
			y: 0,
			transition: {
				type: 'spring',
				damping: 30,
				stiffness: 300
			}
		},
		expanded: {
			height: `${EXPANDED_HEIGHT_VH}vh`,
			y: 0,
			transition: {
				type: 'spring',
				damping: 30,
				stiffness: 300
			}
		}
	}

	return (
		<>
			{/* Backdrop overlay when expanded */}
			{isExpanded && (
				<motion.div
					initial={{opacity: 0}}
					animate={{opacity: 1}}
					exit={{opacity: 0}}
					className="fixed inset-0 bg-black/20 z-40"
					onClick={() => onExpandChange(false)}
				/>
			)}

			{/* Transparent positioning container */}
			<div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden flex justify-center">
				{/* Bottom Sheet */}
				<motion.div
					ref={sheetRef}
					drag="y"
					dragConstraints={{top: 0, bottom: 0}}
					dragElastic={0.2}
					onDragEnd={handleDragEnd}
					animate={isExpanded ? 'expanded' : 'collapsed'}
					variants={sheetVariants}
					className={cn(
						'w-full sm:w-fit sm:max-w-2xl',
						'bg-neutral-50 rounded-t-3xl shadow-2xl border-t-4 border-flame-500',
						'flex flex-col overflow-hidden',
						className
					)}
				>
					{/* Drag handle */}
					<div className="flex justify-center items-center py-4 cursor-grab active:cursor-grabbing bg-neutral-50">
						<div className="w-16 h-1.5 bg-neutral-400 rounded-full" />
					</div>

					{/* Content */}
					<div className="flex-1">
						{children}
					</div>
				</motion.div>
			</div>
		</>
	)
}

export default MobileBottomSheet
