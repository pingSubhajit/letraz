'use client'

import {Badge} from '@/components/ui/badge'
import {cn} from '@/lib/utils'
import {motion, AnimatePresence} from 'framer-motion'
import {Loader2, Check, Edit3} from 'lucide-react'

import {Tooltip, TooltipContent, TooltipTrigger} from '@/components/ui/tooltip'

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
				icon: <Loader2 size={16} />,
				className: 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100'
			}
		}

		if (hasUnsavedChanges) {
			return {
				key: 'editing',
				icon: <Edit3 size={16} />,
				className: 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100'
			}
		}

		return {
			key: 'saved',
			icon: <Check size={16} />,
			className: 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100'
		}
	}

	const config = getStateConfig()

	return (
		<motion.div

			layoutId="save-indicator"
			layout="position"
			initial={{opacity: 0, scale: 0.5}}
			animate={{opacity: 1, scale: 1}}
			exit={{opacity: 0, scale: 0.8}}
			transition={{
				type: 'spring',
				stiffness: 400,
				damping: 25
			}}
		>
			<AnimatePresence mode="wait">
				<Tooltip>
					<TooltipTrigger>
						<motion.div
							key={config.key}
							layoutId="save-indicator-badge"
							layout="position"
							initial={{rotate: -90, scale: 0}}
							animate={{rotate: 0, scale: 1}}
							exit={{rotate: 90, scale: 0}}
							transition={{duration: 0.15}}
						>
							<Badge
								className={cn(
									config.className,
									'!p-2 rounded-full border transition-colors duration-200 cursor-default'
								)}
							>
								<motion.span
									className={cn(isUpdating && 'animate-spin')}
								>
									{config.icon}
								</motion.span>
							</Badge>
						</motion.div>
					</TooltipTrigger>
					<TooltipContent>
						<motion.span 
							initial={{opacity: 0, y: -10}}
							animate={{opacity: 1, y: 0}}
							exit={{opacity: 0, y: -10}}
							transition={{duration: 0.2}}
							className="text-xs font-medium !p-2 bg-background rounded-full"
						>
							{config.key === 'saved' ? 'Saved' : config.key === 'editing' ? 'Editing' : 'Saving'}
						</motion.span>
					</TooltipContent>
				</Tooltip>
			</AnimatePresence>
		</motion.div>
	)
}

export default SaveIndicator
