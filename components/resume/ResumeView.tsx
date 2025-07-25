'use client'

import ResumeEditor from '@/components/resume/ResumeEditor'
import {useRef} from 'react'
import dynamic from 'next/dynamic'
import {useBaseResume} from '@/lib/resume/queries'
import {AnimatePresence, motion} from 'motion/react'
import {ANIMATE_PRESENCE_MODE, DEFAULT_FADE_ANIMATION} from '@/components/animations/DefaultFade'
import ResumeViewerSkeleton from '@/components/skeletons/ResumeViewerSkeleton'
import ResumeEditorSkeleton from '@/components/skeletons/ResumeEditorSkeleton'
import ErrorView from '@/components/utilities/ErrorView'

const ResumeViewer = dynamic(() => import('@/components/resume/ResumeViewer'), {ssr: false})

const ResumeView = () => {
	const resumeRef = useRef<HTMLDivElement>(null)

	const {data: resume, isLoading, isError} = useBaseResume()

	return (
		<div className="flex h-screen" role="main">
			<motion.div
				key="content"
				className="flex h-screen w-full"
			>
				<div className="shadow-2xl bg-neutral-50 size-a4 max-h-screen relative">
					<AnimatePresence mode={ANIMATE_PRESENCE_MODE}>
						{isLoading && !resume && (
							<motion.div {...DEFAULT_FADE_ANIMATION} key="skeleton">
								<ResumeViewerSkeleton className="max-h-screen" />
							</motion.div>
						)}
						{isError && (
							<motion.div {...DEFAULT_FADE_ANIMATION} key="error">
								<ErrorView
									title="Unable to load resume"
									description="There was an error loading your resume preview. Please try refreshing the page."
									buttonText="Refresh"
									className="scale-75 -translate-x-[40%]"
								/>
							</motion.div>
						)}
						{resume && (
							<motion.div {...DEFAULT_FADE_ANIMATION} key="content">
								<ResumeViewer resumeRef={resumeRef} resume={resume} className="max-h-screen" />
							</motion.div>
						)}
					</AnimatePresence>
				</div>

				<AnimatePresence mode={ANIMATE_PRESENCE_MODE}>
					{isLoading && !resume && (
						<motion.div key="skeleton" {...DEFAULT_FADE_ANIMATION} className="size-full">
							<ResumeEditorSkeleton className="size-full bg-neutral-50 p-12" />
						</motion.div>
					)}
					{isError && (
						<motion.div {...DEFAULT_FADE_ANIMATION} key="error-editor" className="size-full relative">
							<ErrorView
								title="Unable to load editor"
								description="There was an error loading the resume editor. Please refresh the page to try again."
								buttonText="Refresh"
								className="scale-90"
							/>
						</motion.div>
					)}
					{resume && (
						<motion.div {...DEFAULT_FADE_ANIMATION} key="content" className="size-full">
							<ResumeEditor className="size-full bg-neutral-50 p-12" />
						</motion.div>
					)}
				</AnimatePresence>
			</motion.div>
		</div>
	)
}

export default ResumeView
