'use client'

import ResumeEditor from '@/components/resume/ResumeEditor'
import {useRef} from 'react'
import dynamic from 'next/dynamic'
import {useBaseResume} from '@/lib/resume/queries'
import ResumeViewSkeleton from '@/components/skeletons/ResumeViewSkeleton'
import {AnimatePresence, motion} from 'motion/react'
import {
	ANIMATE_PRESENCE_MODE,
	DEFAULT_FADE_ANIMATION,
	DEFAULT_FADE_CONTENT_ANIMATION
} from '@/components/animations/DefaultFade'

const ResumeViewer = dynamic(() => import('@/components/resume/ResumeViewer'), {ssr: false})

const ResumeView = () => {
	const resumeRef = useRef<HTMLDivElement>(null)

	const {data: resume, isLoading, isError} = useBaseResume()

	return (
		<div className="flex h-screen" role="main">
			<AnimatePresence mode={ANIMATE_PRESENCE_MODE}>
				{isLoading && (
					<motion.div
						key="skeleton"
						{...DEFAULT_FADE_ANIMATION}
						className="w-full"
					>
						<ResumeViewSkeleton />
					</motion.div>
				)}

				{isError && (
					<motion.div
						key="error"
						{...DEFAULT_FADE_ANIMATION}
						className="flex h-screen items-center justify-center w-full"
					>
						<div className="text-center">
							<p className="text-red-500 mb-2">Error loading resume data</p>
							<p className="text-sm text-muted-foreground">Please try again later</p>
						</div>
					</motion.div>
				)}

				{resume && (
					<motion.div
						key="content"
						{...DEFAULT_FADE_CONTENT_ANIMATION}
						className="flex h-screen w-full"
					>
						<div className="shadow-2xl bg-neutral-50 size-a4 max-h-screen relative">
							<ResumeViewer resumeRef={resumeRef} resume={resume} className="max-h-screen" />
						</div>
						<ResumeEditor className="size-full bg-neutral-50 p-12" />
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	)
}

export default ResumeView
