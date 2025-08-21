import {Badge} from '@/components/ui/badge'
import {cn} from '@/lib/utils'
import {motion, AnimatePresence} from 'framer-motion'
import {Loader2, Check, Edit3} from 'lucide-react'

interface SaveIndicatorProps {
  isUpdating?: boolean
  isEditing?: boolean
  hasUnsavedChanges?: boolean
}

const SaveIndicator = ({isUpdating, isEditing, hasUnsavedChanges}: SaveIndicatorProps) => {
	if (!isEditing) return null

	const getStateConfig = () => {
		if (isUpdating) {
			return {
				key: 'saving',
				icon: <Loader2 size={14} />,
				text: 'Saving...',
				className: 'bg-blue-600 text-white shadow-lg shadow-blue-600/40 border-blue-500'
			}
		}

		if (hasUnsavedChanges) {
			return {
				key: 'editing',
				icon: <Edit3 size={14} />,
				text: 'Editing...',
				className: 'bg-amber-500 text-white shadow-lg shadow-amber-500/40 border-amber-400'
			}
		}

		return {
			key: 'saved',
			icon: <Check size={14} />,
			text: 'Saved',
			className: 'bg-green-600 text-white shadow-lg shadow-green-600/40 border-green-500'
		}
	}

	const config = getStateConfig()

	return (
		<motion.div
			layout="position"
			layoutId="save-indicator"
			className="absolute -top-12 right-0 z-50"
			initial={{opacity: 0, scale: 0.8, y: 10}}
			animate={{opacity: 1, scale: 1, y: 0}}
			exit={{opacity: 0, scale: 0.9, y: -5}}
			transition={{
				type: 'spring',
				stiffness: 500,
				damping: 30,
				mass: 0.8
			}}
		>
			<AnimatePresence mode="wait">
				<motion.div
					key={config.key}
					initial={{opacity: 0, x: 20}}
					animate={{opacity: 1, x: 0}}
					exit={{opacity: 0, x: -20}}
					transition={{duration: 0.2, ease: 'easeInOut'}}
				>
					<Badge
						className={cn(
							config.className,
							'!px-3 !py-1.5 gap-2 font-medium tracking-wide relative overflow-hidden',
							'backdrop-blur-sm border transition-all duration-200'
						)}
					>
						{/* Background pulse for editing state */}
						{hasUnsavedChanges && (
							<motion.div
								className="absolute inset-0 bg-white/10"
								animate={{
									opacity: [0, 0.3, 0],
									scale: [0.8, 1.1, 0.8]
								}}
								transition={{
									duration: 2,
									repeat: Infinity,
									ease: 'easeInOut'
								}}
							/>
						)}

						{/* Success ripple effect */}
						{!isUpdating && !hasUnsavedChanges && (
							<motion.div
								className="absolute inset-0 bg-white/20 rounded-full"
								initial={{scale: 0, opacity: 1}}
								animate={{scale: 2, opacity: 0}}
								transition={{duration: 0.6, ease: 'easeOut'}}
							/>
						)}

						{/* Animated icon */}
						<motion.span
							key={`icon-${config.key}`}
							initial={{rotate: -180, scale: 0}}
							animate={{rotate: 0, scale: 1}}
							transition={{
								type: 'spring',
								stiffness: 400,
								damping: 20,
								delay: 0.1
							}}
							className={cn(
								isUpdating && 'animate-spin'
							)}
						>
							{config.icon}
						</motion.span>

						{/* Animated text */}
						<motion.span
							key={`text-${config.key}`}
							initial={{opacity: 0, y: 10}}
							animate={{opacity: 1, y: 0}}
							transition={{delay: 0.15, duration: 0.3}}
							className="text-xs"
						>
							{config.text}
						</motion.span>
					</Badge>
				</motion.div>
			</AnimatePresence>
		</motion.div>
	)
}

export default SaveIndicator
