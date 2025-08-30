'use client'


import {Badge} from '@/components/ui/badge'
import {cn} from '@/lib/utils'
import {motion} from 'framer-motion'
import {Plus} from 'lucide-react'

    interface AddSectionButtonProps {
    sectionType: string
}

const AddSectionButton = ({sectionType}: AddSectionButtonProps) => {


	return (
		<motion.div

			initial={{opacity: 0, scale: 0.5}}
			animate={{opacity: 1, scale: 1}}
			exit={{opacity: 0, scale: 0.8}}
			transition={{
				type: 'spring',
				stiffness: 400,
				damping: 25
			}}
			onClick={() => {
				console.log('AddSectionButton clicked', sectionType)
			}}
		>
			<Badge
				className={cn(
					'bg-flame-50/90 text-flame-600 border-flame-200 hover:bg-flame-100 cursor-pointer',
					'!p-2 rounded-full border transition-colors duration-200'
				)}
			>
				<motion.span
					whileHover={{rotate: 90}}
					transition={{duration: 0.2}}
				>
					<Plus size={16} />
				</motion.span>
			</Badge>
		</motion.div>
	)
}

export default AddSectionButton
