'use client'

import PersonalDetailsForm from '@/components/onboarding/PersonalDetailsForm'
import {useState} from 'react'
import ParseResume from '@/components/onboarding/ParseResume'
import {AnimatePresence, motion} from 'motion/react'

const OnboardingFlowControl = () => {
	const [showParseResume, setShowParseResume] = useState<boolean>(true)

	return (
		<AnimatePresence mode="wait">
			{showParseResume && <motion.div key="PARSE_RESUME" exit={{opacity: 0}}>
				<ParseResume toggleParseResume={() => setShowParseResume(!showParseResume)} />
			</motion.div>}
			{!showParseResume && <motion.div key="PERSONAL_DETAILS_FORM" exit={{opacity: 0}}>
				<PersonalDetailsForm toggleParseResume={() => setShowParseResume(!showParseResume)} />
			</motion.div>}
		</AnimatePresence>
	)
}

export default OnboardingFlowControl
