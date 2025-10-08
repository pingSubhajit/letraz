'use client'

import {useResumeById} from '@/lib/resume/queries'
import ResumeEditorSkeleton from '@/components/skeletons/ResumeEditorSkeleton'
import ResumeEditor from '@/components/resume/ResumeEditor'
import dynamic from 'next/dynamic'
import ResumeAiLoading from '@/components/utilities/ResumeAiLoading'
import {ResumeHighlightProvider} from '@/components/resume/contexts/ResumeHighlightContext'
import {useEffect} from 'react'
import {useAnalytics} from '@/lib/analytics'
import useRevealOnReady from '@/components/resume/hooks/useRevealOnReady'
import useDidTransition from '@/components/resume/hooks/useDidTransition'

const ResumeViewer = dynamic(() => import('@/components/resume/ResumeViewer'), {ssr: false})

const ProcessingView = ({resumeId}: {resumeId: string}) => {
	const {data: resume, isLoading, isError} = useResumeById(resumeId)
	const {track} = useAnalytics()

	// Normalize status for consistent checks
	const status = (resume?.status || '').toLowerCase()
	// Show the processing overlay ONLY when backend reports processing.
	const processing = status === 'processing'

	// Reveal animation only when transitioning from processing -> success
	const transitionedToSuccess = useDidTransition(status, 'processing', 'success')
	const showReveal = useRevealOnReady(Boolean(transitionedToSuccess && resume))

	// Track resume_opened - re-fires when status changes
	useEffect(() => {
		if (!resume) return

		track('resume_opened', {
			resume_id: resume.id,
			base: Boolean(resume.base),
			status: status
		})
	}, [resume?.id, status, resume?.base, track])

	// Update document title dynamically based on status changes
	useEffect(() => {
		if (!resume) return

		if (resume.base) {
			document.title = 'Base Resume - Letraz'
			return
		}

		if (status === 'failed') {
			document.title = 'Resume Processing Failed - Letraz'
			return
		}

		if (status === 'processing') {
			document.title = 'Crafting Resume - Letraz'
			return
		}

		if (status === 'success' && resume.job?.title && resume.job.company_name) {
			document.title = `${resume.job.title} at ${resume.job.company_name} - Letraz`
			return
		}
	}, [resume, status])


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

	if (status === 'failed') {
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
					<ResumeViewer resume={resume} className="max-h-screen" showToolbar showAnimation={showReveal} />
				</div>
				<div className="size-full">
					<ResumeEditor className="size-full bg-neutral-50 p-12" />
				</div>
			</div>
		</ResumeHighlightProvider>
	)
}

export default ProcessingView


