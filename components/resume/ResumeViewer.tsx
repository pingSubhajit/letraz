'use client'

import {cn} from '@/lib/utils'
import {RefObject} from 'react'
import DefaultTheme from '@/components/resume/themes/DEFAULT_THEME/DefaultTheme'
import {Resume} from '@/lib/resume/types'
import {motion} from 'motion/react'
import ResumeActionsToolbar from '@/components/resume/ResumeActionsToolbar'

type ResumeViewerProps = {
	resume: Resume
	resumeRef?: RefObject<HTMLDivElement | null>
	className?: string
	showAnimation?: boolean
	showToolbar?: boolean
}

const ResumeViewer = ({resume, resumeRef, className, showAnimation = true, showToolbar = false}: ResumeViewerProps) => {
	return (
		<>
			<div className={cn('size-a4 resume relative overflow-y-hidden', className)}>
			{showAnimation && (
				<>
					<motion.div
						className="absolute inset-0 bg-neutral-50 z-10 pointer-events-none"
						initial={{top: '-20%', left: 0, right: 0, bottom: 0}}
						animate={{top: '135%', left: 0, right: 0, bottom: 0}}
						transition={{duration: 4, ease: 'easeInOut'}}
					/>

					<motion.div
						className="absolute inset-0 bg-transparent backdrop-blur-sm z-10 pointer-events-none"
						initial={{top: '-20%', left: 0, right: 0, bottom: 0}}
						animate={{top: '135%', left: 0, right: 0, bottom: 0}}
						transition={{duration: 4, ease: 'easeInOut', delay: 0.05}}
					/>

					<motion.div
						className="absolute inset-0 pointer-events-none"
						initial={{top: '-20%', left: 0, right: 0, bottom: 0}}
						animate={{top: '120%', left: 0, right: 0, bottom: 0}}
						transition={{duration: 4, ease: 'easeInOut', delay: 0.02}}
					>
						<div className="w-[150px] h-[65px] absolute bg-rose-500/70 rounded-[50%] z-10 top-0 left-0 blur-[75px] opacity-65"/>
						<div className="w-[600px] h-[75px] absolute bg-flame-500/70 rounded-[50%] z-10 top-0 right-16 blur-[75px] opacity-65"/>
						<div className="w-[200px] h-[85px] absolute bg-amber-300/70 rounded-[50%] z-10 top-0 right-0 blur-[75px] opacity-65"/>
					</motion.div>
				</>
			)}

			<DefaultTheme
				resumeRef={resumeRef}
				sections={resume.sections || []}
				personalInfoData={resume.user}
				resumeId={resume.id}
				aria-label="Resume preview"
				data-prefers-reduced-motion={
					typeof window !== 'undefined'
					&& window.matchMedia('(prefers-reduced-motion: reduce)').matches
				}
			/>
		</div>
		{showToolbar && <ResumeActionsToolbar resumeId={resume.id} />}
		</>
	)
}

export default ResumeViewer
