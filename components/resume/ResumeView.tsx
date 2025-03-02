'use client'

import ResumeEditor from '@/components/resume/ResumeEditor'
import {useRef, useState} from 'react'
import dynamic from 'next/dynamic'
import {Resume} from '@/lib/resume/types'

const ResumeViewer = dynamic(() => import('@/components/resume/ResumeViewer'), {ssr: false})

const ResumeView = ({resume}: {resume: Resume}) => {
	const resumeRef = useRef<HTMLDivElement>(null)

	const [resumeData, setResumeData] = useState<Resume>(resume)

	return (
		<div className="flex h-screen" role="main">
			<div className="shadow-2xl bg-neutral-50 size-a4 max-h-screen relative">
				<ResumeViewer resumeRef={resumeRef} resume={resumeData} className="max-h-screen" />
			</div>
			<ResumeEditor resume={resume} className="size-full bg-neutral-50 p-12" />
		</div>
	)
}

export default ResumeView
