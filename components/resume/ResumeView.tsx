'use client'

import ResumeEditor from '@/components/resume/ResumeEditor'
import {useRef} from 'react'
import dynamic from 'next/dynamic'
import {useBaseResume} from '@/lib/resume/queries'
import {Divider} from '@/components/resume/themes/DEAFULT_THEME/shared/Components'
import {Skeleton} from '@/components/ui/skeleton'
import {AnimatePresence, motion} from 'motion/react'

const ResumeViewer = dynamic(() => import('@/components/resume/ResumeViewer'), {ssr: false})

const ResumeSkeleton = () => {
	return (
		<div className="h-full p-12 overflow-y-auto">
			<div className="flex flex-col gap-3 items-center">
				{/* NAME */}
				<Skeleton className="h-9 w-72" />

				{/* CONTACT INFO */}
				<div className="w-full flex flex-wrap gap-x-4 gap-y-2 justify-center text-sm">
					<div className="flex items-center">
						<Skeleton className="w-4 h-4 rounded-full mr-1"/>
						<Skeleton className="h-5 w-32" />
					</div>

					<div className="flex items-center">
						<Skeleton className="w-4 h-4 rounded-full mr-1"/>
						<Skeleton className="h-5 w-32" />
					</div>

					<div className="flex items-center gap-1">
						<Skeleton className="w-4 h-4 rounded-full mr-1"/>
						<Skeleton className="h-5 w-32" />
					</div>

					<div className="flex items-center">
						<Skeleton className="w-4 h-4 rounded-full mr-1"/>
						<Skeleton className="h-5 w-32" />
					</div>

					<div className="flex items-center">
						<Skeleton className="w-4 h-4 rounded-full mr-1"/>
						<Skeleton className="h-5 w-32" />
					</div>
				</div>

				{/* PROFILE */}
				<div className="w-full">
					{/* TITLE */}
					<div>
						<Skeleton className="h-[18px] w-24 mb-1" />

						{/* DIVIDER */}
						<Divider className="mb-1.5" />
					</div>
					<Skeleton className="w-full h-24" />
				</div>
			</div>
		</div>
	)
}

const ResumeView = () => {
	const resumeRef = useRef<HTMLDivElement>(null)

	const {data: resume, isLoading, isError} = useBaseResume()

	return (
		<div className="flex h-screen" role="main">

			{/* TODO component for loading and error handing */}
			{/* View of the finalized resume */}
			<div className="shadow-2xl bg-neutral-50 size-a4 max-h-screen relative">
				<AnimatePresence mode="wait">
					{isLoading && <motion.div
						className="size-a4 resume relative overflow-y-hidden max-h-screen"
						initial={{opacity: 0}}
						animate={{opacity: 1}}
						exit={{opacity: 0, transition: {delay: 0.6}}}
					>
						<ResumeSkeleton />
					</motion.div>}
				</AnimatePresence>

				{resume && <ResumeViewer resumeRef={resumeRef} resume={resume} className="max-h-screen" />}
			</div>

			{/* Editor section for the resume */}
			<ResumeEditor className="size-full bg-neutral-50 p-12" />
		</div>
	)
}

export default ResumeView
