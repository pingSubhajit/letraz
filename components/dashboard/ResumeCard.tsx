'use client'

import Link from 'next/link'
import {cn} from '@/lib/utils'
import {ResumeListItem} from '@/lib/resume/types'
import LoadingDots from '@/components/ui/loading-dots'
import {highlightText} from '@/components/ui/highlight'
import {useAnalytics} from '@/lib/analytics'
import ResumeCardActionsBar from '@/components/dashboard/ResumeCardActionsBar'
import type {Job} from '@/lib/job/types'
import {useEffect, useRef, useState} from 'react'

type ResumeCardProps = {
  resume: ResumeListItem
  className?: string
  searchQuery?: string
}

const ResumeCard = ({resume, className, searchQuery = ''}: ResumeCardProps) => {
	const isProcessing = !resume.base && resume.status === 'Processing'
	const {track} = useAnalytics()
	const [showActions, setShowActions] = useState(false)
	const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

	const clearHideTimer = () => {
		if (hideTimerRef.current) {
			clearTimeout(hideTimerRef.current)
			hideTimerRef.current = null
		}
	}

	const openActions = () => {
		clearHideTimer()
		setShowActions(true)
	}

	const scheduleHideActions = () => {
		clearHideTimer()
		hideTimerRef.current = setTimeout(() => setShowActions(false), 150)
	}

	useEffect(() => () => clearHideTimer(), [])

	return (
		<div className="group hover:z-20 relative" onPointerEnter={openActions} onPointerLeave={scheduleHideActions}>
			<Link
				href={`/app/craft/resumes/${encodeURIComponent(resume.id)}`}
				className={cn(isProcessing && 'processing-border rounded-lg', 'relative group')}
				onClick={() => track('resume_opened', {resume_id: resume.id, base: Boolean(resume.base), status: resume.status})}
			>
				<div className={cn(
					'h-96 w-full rounded-lg transition group-hover:shadow-2xl focus-within:shadow-2xl overflow-hidden border bg-white flex flex-col',
					resume.base && 'border-2 border-flame-400',
					isProcessing && 'border-2 border-transparent',
					className
				)}>
					<div className="flex-1 bg-white flex items-center justify-center overflow-hidden">
						{isProcessing && (
							<div className={cn('flex flex-col items-center justify-center')}>
								<LoadingDots className="space-x-1" dotClassName="w-2 h-2 bg-flame-500" />
								<p className="mt-2 font-jakarta font-semibold">One moment</p>
								<p className="text-xs leading-normal opacity-80">We're crafting this one for you</p>
							</div>
						)}

						{!isProcessing && (resume.thumbnail ? (
							<img
								src={resume.thumbnail}
								alt={`${resume.job.title} at ${resume.job.company_name}`}
								className="h-full w-full object-cover object-top"
								onError={(e) => {(e.currentTarget as HTMLImageElement).style.display = 'none'}}
							/>
						) : (
							<div className="text-sm text-neutral-500">No preview</div>
						))}
					</div>
					<div className={cn('p-3 border-t bg-white', resume.base && 'bg-flame-500 text-white')}>
						{!resume.base && (
							<div className="flex items-center gap-2 justify-between">
								<div className="text-sm flex flex-col min-w-0">
									<p className="truncate flex-1 font-medium text-base">{highlightText(resume.job.title, searchQuery)}</p>
									<p className="text-xs text-neutral-500 truncate">
										<span>{highlightText(resume.job.company_name, searchQuery)}</span>
										{resume.job.location && <span>, {highlightText(resume.job.location, searchQuery)}</span>}
									</p>
								</div>
							</div>
						)}

						{resume.base && (
							<div className="flex items-center gap-2 justify-between">
								<div className="text-sm flex flex-col min-w-0">
									<p className="truncate flex-1 font-semibold text-base">Base resume</p>
									<p className="text-xs text-white/70 truncate">Master resume for tailoring</p>
								</div>
							</div>
						)}
					</div>
				</div>
			</Link>

			<ResumeCardActionsBar
				resumeId={resume.id}
				isProcessing={isProcessing}
				job={resume.job as unknown as Job}
				isBaseResume={resume.base}
				visible={showActions}
				onEnter={openActions}
				onLeave={scheduleHideActions}
			/>
		</div>
	)
}

export default ResumeCard
