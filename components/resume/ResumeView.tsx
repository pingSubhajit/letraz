'use client'

import {Resume} from '@/db/resumes.schema'
import ResumeEditor from '@/components/resume/ResumeEditor'
import ResumeViewer from '@/components/resume/ResumeViewer'
import {useRef, useState} from 'react'
import {Printer} from 'lucide-react'
import {Button} from '@/components/ui/button'

const ResumeView = ({resume}: {resume: Resume}) => {
	const resumeRef = useRef()

	const [resumeData, setResumeData] = useState<Resume>(resume)
	
	return (
		<div className="flex relative pb-8">
			<Button variant="secondary" size="icon" className="absolute top-2 left-2 z-20 h-8 w-8">
				<Printer className="w-4 aspect-square" />
			</Button>
			<ResumeViewer resumeRef={resumeRef} resume={resumeData} className="shadow-2xl relative z-10 rounded-l-2xl bg-white" />
			<ResumeEditor resume={resume} className="h-full shadow-2xl sticky top-0 w-full rounded-r-2xl bg-white" />
		</div>
	)
}

export default ResumeView
