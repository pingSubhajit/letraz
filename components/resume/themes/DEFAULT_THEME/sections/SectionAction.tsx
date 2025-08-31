'use client'

import {motion} from 'motion/react'
import React from 'react'
import SaveIndicator from './SaveIndicator'
import AddSectionButton from './AddSectionButton'

interface SectionActionProps {
	isEditing: boolean
	isUpdating: boolean
	isSaving: boolean
	sectionType: string
	hasUnsavedChanges: boolean
}


const SectionAction = ({
	isEditing, isUpdating, isSaving, hasUnsavedChanges, sectionType}: SectionActionProps) => {
	return (
		<motion.div
			initial={{opacity: 0, scale: 0.9}}
			animate={{opacity: 1, scale: 1}}
			exit={{opacity: 0, scale: 0.9}}
			layoutId="section-container"
			layout="position"
			className="absolute -top-12 right-0 z-50 flex gap-2 items-center"
		>
			<AddSectionButton
				sectionType={sectionType}
			/>
			<SaveIndicator
				isEditing={isEditing}
				isUpdating={isUpdating || isSaving}
				hasUnsavedChanges={hasUnsavedChanges}
			/>
		</motion.div>
	)
}

export default SectionAction
