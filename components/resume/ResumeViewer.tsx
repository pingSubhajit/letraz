'use client'

import {Resume} from '@/db/resumes.schema'
import {cn} from '@/lib/utils'
import DefaultTheme from '@/components/resume/themes/DefaultTheme'
import {LegacyRef} from 'react'
import {PDFViewer} from '@react-pdf/renderer'

type ResumeViewerProps = {
	resume: Resume
	resumeRef?: LegacyRef<any>
	className?: string
}

const ResumeViewer = ({resume, resumeRef, className}: ResumeViewerProps) => {
	return (
		<div className={cn('size-a4 relative rounded-l-2xl resume p-2', className)}>
			<PDFViewer
				showToolbar={false}
				style={{width: '100%', height: '100%', borderTopLeftRadius: '1rem', borderBottomLeftRadius: '1rem'}}
			>
				<DefaultTheme resumeRef={resumeRef} sections={resume.sections || []} personalInfoData={resume.personalInfo ?? undefined} />
			</PDFViewer>
		</div>
	)
}

export default ResumeViewer
