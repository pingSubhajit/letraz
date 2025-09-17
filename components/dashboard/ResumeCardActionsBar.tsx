'use client'

import {useRef, useState} from 'react'
import {ResumeListItem} from '@/lib/resume/types'
import {cn} from '@/lib/utils'
import {Button} from '@/components/ui/button'
import {Briefcase, Download, Share2, Trash2} from 'lucide-react'
import {AnimatePresence, motion} from 'motion/react'
import type {Job} from '@/lib/job/types'
import {useResumeDeleteHandler, useResumeExportHandler} from '@/lib/resume/ui-actions'
import PopConfirm from '@/components/ui/pop-confirm'
import JobDetailsModal from '@/components/resume/JobDetailsModal'

const ResumeCardActionsBar = ({resumeId, isProcessing, className, isBaseResume = false, job, visible = false, onEnter, onLeave}: {
	resumeId: string
	isProcessing: boolean
	className?: string
	isBaseResume?: boolean
	job?: ResumeListItem['job'] | null
	visible?: boolean
	onEnter?: () => void
	onLeave?: () => void
}) => {
	const {exportPdf, isExporting} = useResumeExportHandler()
	const {deleteResumeById, isDeleting} = useResumeDeleteHandler()
	const [showJobDetails, setShowJobDetails] = useState(false)
	const [buttonRect, setButtonRect] = useState<DOMRect | null>(null)
	const jobButtonRef = useRef<HTMLButtonElement>(null)

	const stopEvent = (e: React.MouseEvent) => {
		e.preventDefault()
		e.stopPropagation()
	}

	const normalizedJob: Job | null = job ? ({
		...job,
		requirements: (job as any).requirements ?? null,
		responsibilities: (job as any).responsibilities ?? null,
		benefits: (job as any).benefits ?? null
	} as Job) : null

	return (
		<AnimatePresence>
			{visible && (
				<motion.div
					onPointerEnter={onEnter}
					onPointerLeave={onLeave}
					initial={{opacity: 0, scale: 0.95, translateX: '120%'}}
					animate={{opacity: 1, scale: 1, translateX: '120%'}}
					exit={{opacity: 0, scale: 0.95, translateX: '120%'}}
					transition={{duration: 0.08, ease: 'easeOut'}}
					className={cn(
						'py-8 w-10 h-full absolute right-0 translate-x-[120%] top-0 z-10 flex flex-col items-center justify-start gap-4',
						className
					)}
				>
					{/* Only show download button if the resume is not a base resume and under process */}
					{!(!isBaseResume && isProcessing) && <Button
						variant="secondary"
						className="w-full aspect-square rounded-full h-auto p-0 shadow-lg"
						disabled={isExporting}
						onClick={async (e) => {stopEvent(e); await exportPdf(resumeId)}}
					>
						<Download className="h-4 w-4" />
					</Button>}

					{/* Only show job button if job is available and process is successful */}
					{!(!job || job.status !== 'Success') && <Button
						ref={jobButtonRef}
						variant="secondary"
						className="w-full aspect-square rounded-full h-auto p-0 shadow-lg"
						onClick={(e) => {
							stopEvent(e)
							if (jobButtonRef.current) setButtonRect(jobButtonRef.current.getBoundingClientRect())
							setShowJobDetails(true)
						}}
					>
						<Briefcase className="h-4 w-4" />
					</Button>}

					<Button disabled variant="secondary" className="w-full aspect-square rounded-full h-auto p-0 shadow-lg">
						<Share2 className="h-4 w-4" />
					</Button>

					{!isBaseResume && <PopConfirm
						triggerElement={
							<Button
								variant="secondary"
								className="w-full aspect-square rounded-full h-auto p-0 shadow-lg"
								disabled={isDeleting}
							>
								{isDeleting ? (
									<div className="h-4 w-4 animate-spin rounded-full border-2 border-black/70 border-t-transparent" />
								) : (
									<Trash2 className="h-4 w-4" />
								)}
							</Button>
						}
						message="Are you sure you want to delete this resume? This action cannot be undone."
						onYes={() => deleteResumeById(resumeId)}
					/>}

					{/* Job Details Modal */}
					{normalizedJob && (
						<JobDetailsModal
							isOpen={showJobDetails}
							onClose={() => {setShowJobDetails(false); if (onLeave) onLeave()}}
							job={normalizedJob}
							buttonRect={buttonRect}
						/>
					)}
				</motion.div>
			)}
		</AnimatePresence>
	)
}

export default ResumeCardActionsBar
