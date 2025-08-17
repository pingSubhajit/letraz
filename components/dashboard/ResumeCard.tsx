'use client'

import Link from 'next/link'
import {cn} from '@/lib/utils'
import {ResumeListItem} from '@/lib/resume/types'
import LoadingDots from '@/components/ui/loading-dots'
import {Button} from '@/components/ui/button'
import {Download} from 'lucide-react'
import {highlightText} from '@/components/ui/highlight'

type ResumeCardProps = {
  resume: ResumeListItem
  className?: string
  searchQuery?: string
}

const ResumeCard = ({resume, className, searchQuery = ''}: ResumeCardProps) => {
	const isProcessing = !resume.base && resume.status === 'Processing'

	return (
		<Link href={`/app/craft?jobId=${encodeURIComponent(resume.id)}`} className="group">
			<div className={cn(isProcessing && 'processing-border rounded-lg')}>
				<div className={cn(
					'h-96 w-full rounded-lg transition hover:shadow-2xl focus-within:shadow-2xl overflow-hidden border bg-white flex flex-col',
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
										{resume.job.location && <span>, {resume.job.location}</span>}
									</p>
								</div>

								{!isProcessing && (
									<Button className="h-full opacity-0 group-hover:opacity-100" variant="outline">
										<Download />
									</Button>
								)}
							</div>
						)}

						{resume.base && (
							<div className="flex items-center gap-2 justify-between">
								<div className="text-sm flex flex-col min-w-0">
									<p className="truncate flex-1 font-semibold text-base">Base resume</p>
									<p className="text-xs text-white/70 truncate">Master resume for tailoring</p>
								</div>

								<Button className="h-full opacity-0 group-hover:opacity-100" variant="outline">
									<Download />
								</Button>
							</div>
						)}
					</div>
				</div>
			</div>
		</Link>
	)
}

export default ResumeCard
