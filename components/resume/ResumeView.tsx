'use client'

import ResumeEditor from '@/components/resume/ResumeEditor'
import {useRef, useState} from 'react'
import {Printer} from 'lucide-react'
import {Button} from '@/components/ui/button'
import dynamic from 'next/dynamic'
import {Resume} from '@/lib/resume/types'

const ResumeViewer = dynamic(() => import('@/components/resume/ResumeViewer'), {ssr: false})

const ResumeView = ({resume}: {resume: Resume}) => {
	const resumeRef = useRef<HTMLDivElement>(null)

	const [resumeData, setResumeData] = useState<Resume>(resume)

	return (
		<div className="flex relative h-screen">
			<Button variant="secondary" size="icon" className="absolute top-2 left-2 z-20 h-8 w-8">
				<Printer className="w-4 aspect-square" />
			</Button>
			<ResumeViewer resumeRef={resumeRef} resume={resumeData} className="max-h-screen shadow-2xl bg-neutral-50" />
			<ResumeEditor resume={resume} className="h-full shadow-2xl w-full bg-neutral-50 p-12" />
		</div>
	)
}

export default ResumeView
