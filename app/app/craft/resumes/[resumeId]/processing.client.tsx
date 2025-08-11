'use client'

import {useMemo, useState} from 'react'
import {useResumeById} from '@/lib/resume/queries'
import AiLoading from '@/components/utilities/AiLoading'
import ResumeEditorSkeleton from '@/components/skeletons/ResumeEditorSkeleton'
import ResumeEditor from '@/components/resume/ResumeEditor'
import ResumeViewer from '@/components/resume/ResumeViewer'
import {ResumeHighlightProvider} from '@/components/resume/contexts/ResumeHighlightContext'

const LOADING_MESSAGES = [
	'Analyzing keywords…',
	'Crafting your unique profile…',
	'Optimizing bullet points…',
	'Aligning achievements with the job…',
	'Tailoring highlights for recruiters…'
]

const ProcessingView = ({resumeId}: {resumeId: string}) => {
	const {data: resume, isLoading, isError, error} = useResumeById(resumeId)
	const [messageIndex] = useState(() => Math.floor(Math.random() * LOADING_MESSAGES.length))
	const message = useMemo(() => LOADING_MESSAGES[messageIndex], [messageIndex])

	if (isError) {
		return (
			<div className="min-h-dvh flex items-center justify-center">
				<div className="text-center">
					<p className="text-lg font-semibold mb-2">Failed to load resume status</p>
					<p className="text-sm text-neutral-600">{(error as Error)?.message || 'Please try again.'}</p>
				</div>
			</div>
		)
	}

	const doneStatuses = new Set(['completed', 'success', 'failed'])
	const status = resume?.status
	const isProcessingStatus = status === 'processing'
	const processing = isProcessingStatus || (!resume && isLoading)

	if (processing) {
		return (
			<ResumeHighlightProvider>
				<div className="flex h-screen w-full" role="main">
					<div className="shadow-2xl bg-neutral-50 size-a4 max-h-screen relative">
						{isProcessingStatus && (
							<AiLoading
								loading
								text={message}
								className="absolute inset-0"
								videoClass="opacity-50"
								textClass="text-xl"
							/>
						)}
					</div>
					<div className="size-full">
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


