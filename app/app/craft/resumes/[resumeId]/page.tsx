import {Suspense} from 'react'
import type {Metadata} from 'next'
import ProcessingView from './processing.client'
import {notFound} from 'next/navigation'
import {getResumeFromDB} from '@/lib/resume/actions'

type PageProps = {
  params: Promise<{ resumeId: string }>
}

export const generateMetadata = async (
	props: { params: Promise<{ resumeId: string }> }
): Promise<Metadata> => {
	const {resumeId} = await props.params
	return {
		title: `Processing — ${resumeId}`,
		description: 'We are processing your resume. This can take a few moments.'
	}
}

const ResumeProcessingPage = async ({params}: PageProps) => {
	const {resumeId} = await params

	// Server-side existence check: render app/not-found.tsx if resume is missing
	try {
		await getResumeFromDB(resumeId)
	} catch (err) {
		const message = err instanceof Error ? err.message.toLowerCase() : ''
		if (message.includes('resume not found')) {
			notFound()
		}
		// For other errors, proceed to client view where generic error/processing UI handles it
	}
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
