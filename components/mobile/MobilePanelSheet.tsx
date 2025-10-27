'use client'

import {ReactNode, useEffect} from 'react'
import {motion, AnimatePresence} from 'motion/react'
import {X} from 'lucide-react'
import {Button} from '@/components/ui/button'

interface MobilePanelSheetProps {
	isOpen: boolean
	onClose: () => void
	title: string
	children: ReactNode
}

/**
 * Mobile panel bottom sheet component for displaying notifications and support panels
 * Features:
 * - Slides up from bottom with backdrop
 * - 85vh height (matches resume editor pattern)
 * - Scrollable content area
 * - Close button in header
 * - Prevents body scroll when open
 */
const MobilePanelSheet = ({isOpen, onClose, title, children}: MobilePanelSheetProps) => {
	// Prevent body scroll when panel is open
	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = 'hidden'
		} else {
			document.body.style.overflow = ''
		}
		return () => {
			document.body.style.overflow = ''
		}
	}, [isOpen])

	return (
		<AnimatePresence>
			{isOpen && (
				<>
					{/* Backdrop */}
					<motion.div
						className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60] lg:hidden"
						initial={{opacity: 0}}
						animate={{opacity: 1}}
						exit={{opacity: 0}}
						onClick={onClose}
						transition={{duration: 0.2}}
					/>

					{/* Bottom Sheet */}
					<motion.div
						className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-[70] lg:hidden flex flex-col"
						style={{height: '85vh'}}
						initial={{y: '100%'}}
						animate={{y: 0}}
						exit={{y: '100%'}}
						transition={{type: 'spring', damping: 30, stiffness: 300}}
					>
						{/* Header */}
						<div className="flex items-center justify-between py-4 px-6 border-b bg-background">
							<h3 className="font-semibold text-lg">{title}</h3>
							<Button
								variant="ghost"
								size="icon"
								onClick={onClose}
								className="shrink-0"
							>
								<X className="h-5 w-5" />
							</Button>
						</div>

						{/* Content - Scrollable */}
						<div className="flex-1 overflow-y-auto">
							{children}
						</div>
					</motion.div>
				</>
			)}
		</AnimatePresence>
	)
}

export default MobilePanelSheet
