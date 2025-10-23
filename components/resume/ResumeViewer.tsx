'use client'

import {cn} from '@/lib/utils'
import {RefObject} from 'react'
import DefaultTheme from '@/components/resume/themes/DEFAULT_THEME/DefaultTheme'
import {Resume} from '@/lib/resume/types'
import ResumeRevealOverlay from '@/components/resume/ResumeRevealOverlay'
import ResumeActionsToolbar from '@/components/resume/ResumeActionsToolbar'

type ResumeViewerProps = {
	resume: Resume
	resumeRef?: RefObject<HTMLDivElement | null>
	className?: string
	showAnimation?: boolean
	showToolbar?: boolean
}

const ResumeViewer = ({resume, resumeRef, className, showAnimation = false, showToolbar = false}: ResumeViewerProps) => {
	return (
		<>
			<div className={cn('size-a4 resume relative overflow-y-hidden', className)}>
				{showAnimation && <ResumeRevealOverlay />}

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
			{showToolbar && <ResumeActionsToolbar resumeId={resume.id} isBaseResume={resume.base} job={resume.job} />}
		</>
	)
}

export default ResumeViewer
