'use client'

import {useResumeById} from '@/lib/resume/queries'
import ResumeEditorSkeleton from '@/components/skeletons/ResumeEditorSkeleton'
import ResumeEditor from '@/components/resume/ResumeEditor'
import dynamic from 'next/dynamic'
import ResumeAiLoading from '@/components/utilities/ResumeAiLoading'

const ResumeViewer = dynamic(() => import('@/components/resume/ResumeViewer'), {ssr: false})

import {ResumeHighlightProvider} from '@/components/resume/contexts/ResumeHighlightContext'


const ProcessingView = ({resumeId}: {resumeId: string}) => {
	const {data: resume, isLoading, isError} = useResumeById(resumeId)

	// Compute status flags
	const status = resume?.status
	const isProcessingStatus = (status || '').toLowerCase() === 'processing'

	// Show the processing overlay ONLY when backend reports processing.
	const processing = isProcessingStatus


	// Initial load or transient errors: show neutral placeholders without the processing overlay
	if (!resume && (isLoading || isError)) {
		return (
			<ResumeHighlightProvider>
				<div className="flex h-screen w-full" role="main">
					<div className="shadow-2xl bg-neutral-50 size-a4 max-h-screen relative overflow-hidden shrink-0" />
					<div className="flex-1 min-w-0">
						<ResumeEditorSkeleton className="size-full bg-neutral-50 p-12" />
					</div>
				</div>
			</ResumeHighlightProvider>
		)
	}

	if (processing) {
		return (
			<ResumeHighlightProvider>
				<div className="flex h-screen w-full" role="main">
					<div className="shadow-2xl bg-neutral-50 size-a4 max-h-screen relative overflow-hidden shrink-0">
						{processing && <ResumeAiLoading />}
					</div>
					<div className="flex-1 min-w-0">
						<ResumeEditorSkeleton className="size-full bg-neutral-50 p-12" />
					</div>
				</div>
			</ResumeHighlightProvider>
		)
	}

	if (resume?.status === 'failed') {
		return (
			<div className="min-h-dvh flex items-center justify-center">
				<div className="text-center max-w-md">
					<p className="text-xl font-semibold mb-2">We couldn’t tailor your resume</p>
					<p className="text-sm text-neutral-600 mb-6">Please retry or contact support if the issue persists.</p>
					{/* Placeholder for retry button; depends on backend API */}
				</div>
			</div>
		)
	}

	if (!resume) return null

	return (
		<ResumeHighlightProvider>
			<div className="flex h-screen w-full" role="main">
				<div className="shadow-2xl bg-neutral-50 size-a4 max-h-screen relative">
					<ResumeViewer resume={resume} className="max-h-screen" />
				</div>
				<div className="size-full">
					<ResumeEditor className="size-full bg-neutral-50 p-12" />
				</div>
			</div>
		</ResumeHighlightProvider>
	)
}

export default ProcessingView


