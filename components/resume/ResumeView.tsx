'use client'

import ResumeEditor from '@/components/resume/ResumeEditor'
import {useRef} from 'react'
import dynamic from 'next/dynamic'
import {useFetchBaseResumeQuery} from '@/lib/resume/queries'

const ResumeViewer = dynamic(() => import('@/components/resume/ResumeViewer'), {ssr: false})

const ResumeView = () => {
	const resumeRef = useRef<HTMLDivElement>(null)

	const {data: resume, isLoading, isError} = useFetchBaseResumeQuery()


	return (
		<div className="flex h-screen" role="main">

			{/* TODO component for loading and error handing */}
			{isLoading && <p>loading</p>}
			{isError && <p>loading</p>}
			{ resume && <> <div className="shadow-2xl bg-neutral-50 size-a4 max-h-screen relative">
				<ResumeViewer resumeRef={resumeRef} resume={resume} className="max-h-screen" />
			</div>
			<ResumeEditor resume={resume} className="size-full bg-neutral-50 p-12" />
			</>
			}
		</div>
	)
}

export default ResumeView
