import {Suspense} from 'react'
import ProcessingView from './processing.client'

type PageProps = {
  params: Promise<{ resumeId: string }>
}

const ResumeProcessingPage = async ({params}: PageProps) => {
	const {resumeId} = await params
	return (
		<Suspense fallback={<div className="flex h-screen w-full" role="main">
			<div className="shadow-2xl bg-neutral-50 size-a4 max-h-screen relative" />
			<div className="size-full bg-neutral-50" />
		</div>}>
			<ProcessingView resumeId={resumeId} />
		</Suspense>
	)
}

export default ResumeProcessingPage


