'use client'

import {Resume} from '@/db/resumes.schema'
import {cn} from '@/lib/utils'
import {LegacyRef} from 'react'
import DefaultTheme from '@/components/resume/themes/DEAFULT_THEME/DefaultTheme'

type ResumeViewerProps = {
	resume: Resume
	resumeRef?: LegacyRef<any>
	className?: string
}

const ResumeViewer = ({resume, resumeRef, className}: ResumeViewerProps) => {
	return (
		<div className={cn('size-a4 relative rounded-l-2xl resume p-2', className)}>
			<DefaultTheme resumeRef={resumeRef} sections={resume.sections || []} personalInfoData={resume.personalInfo ?? undefined} />
		</div>
	)
}

export default ResumeViewer
