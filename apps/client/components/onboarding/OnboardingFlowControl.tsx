'use client'

import PersonalDetailsForm from '@/components/onboarding/PersonalDetailsForm'
import {useCallback, useState} from 'react'
import ParseResume from '@/components/onboarding/ParseResume'
import {AnimatePresence, motion} from 'motion/react'

const OnboardingFlowControl = () => {
	const [showParseResume, setShowParseResume] = useState<boolean>(true)

	const toggleParseResume = useCallback(() => {
		setShowParseResume(prev => !prev)
	}, [])

	return (
		<AnimatePresence mode="wait">
			{showParseResume && <motion.div key="PARSE_RESUME" exit={{opacity: 0}}>
				<ParseResume toggleParseResume={toggleParseResume} />
			</motion.div>}
			{!showParseResume && <motion.div key="PERSONAL_DETAILS_FORM" exit={{opacity: 0}}>
				<PersonalDetailsForm toggleParseResume={toggleParseResume} />
			</motion.div>}
		</AnimatePresence>
	)
}

export default OnboardingFlowControl
