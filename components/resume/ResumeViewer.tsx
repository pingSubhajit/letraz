'use client'

import {cn} from '@/lib/utils'
import {RefObject} from 'react'
import DefaultTheme from '@/components/resume/themes/DEAFULT_THEME/DefaultTheme'
import {Resume} from '@/lib/resume/types'

type ResumeViewerProps = {
	resume: Resume
	resumeRef?: RefObject<HTMLDivElement | null>
	className?: string
}

const ResumeViewer = ({resume, resumeRef, className}: ResumeViewerProps) => {
	return (
		<div className={cn('size-a4 relative rounded-l-2xl resume p-2', className)}>
			<DefaultTheme resumeRef={resumeRef} sections={resume.sections || []} personalInfoData={resume.user} />
		</div>
	)
}

export default ResumeViewer
