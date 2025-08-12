'use client'

import {useEffect, useMemo, useState} from 'react'
import {AnimatePresence, motion} from 'motion/react'
import {cn} from '@/lib/utils'
import AiLoading from '@/components/utilities/AiLoading'

type Stage = {
	id: string
	title: string
	messages: string[]
}

const DEFAULT_STAGES: Stage[] = [
	{
		id: 'analyzing_opportunity',
		title: 'Analyzing the Opportunity',
		messages: [
			'Reading the job description like a recruiter on espresso...',
			'Pinpointing what this company is really asking for.',
			'Scanning the job post for subtle cues and must-haves.',
			'Breaking down the buzzwords to find what matters.',
			'Extracting core expectations from corporate jargon.',
			'Interpreting job lingo into real-world demands.'
		]
	},
	{
		id: 'understanding_you',
		title: 'Understanding You',
		messages: [
			'Mapping your experience to match the job’s heartbeat.',
			'Digging through your story to find the hidden gems.',
			'Reading between the lines of your achievements.',
			'Aligning your strengths with what recruiters crave.',
			'Searching for your career-defining moments.',
			'Highlighting what makes your journey unique.'
		]
	},
	{
		id: 'finding_fit',
		title: 'Finding the Perfect Fit',
		messages: [
			'Weaving your skills into the job’s DNA.',
			'Matching career puzzle pieces for the perfect fit.',
			'Making your resume feel like it was made for this job.',
			'Strategizing a seamless alignment between you and them.',
			'Connecting dots between your past and their future.',
			'Customizing your message to resonate instantly.'
		]
	},
	{
		id: 'crafting_resume',
		title: 'Crafting the Resume',
		messages: [
			'Rewriting your resume like a seasoned storyteller.',
			'Crafting impactful bullet points with purpose.',
			'Choosing words that make hiring managers pause.',
			'Restructuring your pitch for clarity and punch.',
			'Engineering the layout for quick, confident scans.',
			'Drafting with the elegance of a well-written novel.'
		]
	},
	{
		id: 'final_polish',
		title: 'Final Polish',
		messages: [
			'Checking for grammar, flow, and finesse.',
			'Ensuring the resume passes the 6-second scan test.',
			'Optimizing for ATS bots and humans.',
			'Tightening language, trimming fluff.',
			'Replacing "responsible for" with action-packed verbs.',
			'Adding a layer of clarity and polish.'
		]
	},
	{
		id: 'preparing_preview',
		title: 'Preparing the Preview',
		messages: [
			'Loading your tailored masterpiece...',
			'Putting the finishing touches in place.',
			'Preparing your resume for the spotlight.',
			'One final sweep before the grand reveal.',
			'Sealing it with confidence and clarity.',
			'Your resume is almost ready to shine.'
		]
	}
]

const STAGE_DURATION_MS = 5000

const ResumeAiLoading = ({
	stages = DEFAULT_STAGES,
	className
}: {
	stages?: Stage[]
	className?: string
}) => {
	const [stageIndex, setStageIndex] = useState(0)
	const [messageKey, setMessageKey] = useState(0)

	const stage = stages[stageIndex % stages.length]

	const message = useMemo(() => {
		const msgs = stage?.messages ?? []
		if (msgs.length === 0) return ''
		const idx = Math.floor(Math.random() * msgs.length)
		return msgs[idx]
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [stageIndex, messageKey])

	useEffect(() => {
		const id = setInterval(() => {
			setStageIndex(prev => prev + 1)
			setMessageKey(prev => prev + 1)
		}, STAGE_DURATION_MS)
		return () => clearInterval(id)
	}, [])

	return (
		<div className={cn('absolute inset-0', className)}>
			{/* Ball video */}
			<AiLoading loading text="" centered videoClass="scale-[1.8] blur-lg" textClass="hidden" />

			{/* Stage title (subtle) */}
			<div className="absolute top-[18%] left-1/2 -translate-x-1/2 text-sm tracking-wide text-neutral-600/80 z-20">
				{stage?.title}
			</div>

			{/* Stage message with smooth blur/fade vertical animation */}
			<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] max-w-[720px] text-center z-20">
				<AnimatePresence mode="wait">
					<motion.div
						key={`${stage?.id}-${messageKey}`}
						initial={{opacity: 0, y: 24, filter: 'blur(6px)'}}
						animate={{opacity: 1, y: 0, filter: 'blur(0px)'}}
						exit={{opacity: 0, y: -24, filter: 'blur(6px)'}}
						transition={{duration: 0.5, ease: 'easeOut'}}
						className="text-[18px] sm:text-[22px] md:text-[26px] leading-snug font-medium text-neutral-600 drop-shadow-[0_2px_8px_rgba(0,0,0,0.12)]"
					>
						{message}
					</motion.div>
				</AnimatePresence>
			</div>
		</div>
	)
}

export default ResumeAiLoading


