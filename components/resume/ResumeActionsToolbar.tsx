'use client'

import {useRef, useState} from 'react'
import {useRouter} from 'next/navigation'
import {toast} from 'sonner'
import {Briefcase, ChevronDownIcon, Download, Loader2, Trash2} from 'lucide-react'
import {Button} from '@/components/ui/button'
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from '@/components/ui/dropdown-menu'
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from '@/components/ui/tooltip'
import PopConfirm from '@/components/ui/pop-confirm'
import JobDetailsModal from '@/components/resume/JobDetailsModal'
import {useDeleteResumeMutation, useExportResumeMutation} from '@/lib/resume/mutations'
import {useResumeById} from '@/lib/resume/queries'
import {Job} from '@/lib/job/types'
import {cn} from '@/lib/utils'
import {useAnalytics} from '@/lib/analytics'

interface ResumeActionsToolbarProps {
	resumeId: string
	className?: string
	isBaseResume?: boolean
	job?: Job | null
}

const ResumeActionsToolbar = ({resumeId, className, isBaseResume = false, job}: ResumeActionsToolbarProps) => {
	const {mutateAsync: exportResume, isPending: isExporting} = useExportResumeMutation()
	const {mutateAsync: deleteResume, isPending: isDeleting} = useDeleteResumeMutation()
	const {data: resume} = useResumeById(resumeId)
	const router = useRouter()
	const [showJobDetails, setShowJobDetails] = useState(false)
	const [buttonRect, setButtonRect] = useState<DOMRect | null>(null)
	const jobButtonRef = useRef<HTMLButtonElement>(null)
    const {track} = useAnalytics()

	const handleExport = async (format: 'pdf' | 'tex') => {
		// Open a stub window immediately to preserve user gesture
		const win = window.open('', '_blank', 'noopener,noreferrer')

		try {
			track('resume_export_clicked', {resume_id: resumeId, format})
			const response = await exportResume(resumeId)

			const downloadUrl = format === 'pdf' ? response.pdf_url : response.latex_url

			// Validate the URL exists
			if (!downloadUrl || typeof downloadUrl !== 'string' || downloadUrl.trim() === '') {
				if (win) win.close()
				toast.error('No download URL received from server')
				return
			}

			// Properly construct/validate the URL
			let fullUrl: string
			try {
				// Use URL constructor to handle absolute, protocol-relative, and relative URLs
				fullUrl = new URL(downloadUrl, window.location.origin).toString()
			} catch (urlError) {
				// Fallback for protocol-relative URLs or other edge cases
				try {
					fullUrl = new URL(downloadUrl, 'https:').toString()
				} catch (fallbackError) {
					if (win) win.close()
					toast.error('Invalid download URL received')
					return
				}
			}

			if (win) {
				try {
					win.opener = null
					win.location.replace(fullUrl)
				} catch {
					// Fallback if blocked
					window.open(fullUrl, '_blank', 'noopener=yes,noreferrer=yes')
				}
			} else {
				window.open(fullUrl, '_blank', 'noopener=yes,noreferrer=yes')
			}
			track('resume_export_succeeded', {resume_id: resumeId, format})
		} catch (error) {
			// Close the blank tab if we opened one and failed
			if (win) {
				try {
					win.close()
				} catch {
					// Ignore if we can't close it
				}
			}
			// Error handling is already done in the mutation
			track('resume_export_failed', {resume_id: resumeId, format})
		}
	}

	const handleDelete = async () => {
		try {
			await deleteResume(resumeId)
			track('resume_deleted', {resume_id: resumeId})
			// Navigate to dashboard after successful deletion
			router.push('/app')
		} catch (error) {
			// Error handling is already done in the mutation
		}
	}

	// Download button component (reusable) - split into two separate buttons
	const DownloadButton = () => (
		<div className="flex">
			{/* Main PDF download button */}
			<Button
				variant="default"
				size="default"
				className={cn(
					'pl-4 pr-4 gap-2 hover:translate-y-0',
					isExporting && 'pr-4',
					// Styling for standalone button when exporting, or left side of split button when not exporting
					isExporting
						? (isBaseResume ? 'rounded-full shadow-lg' : 'rounded-tl-[36px] rounded-bl-[36px] rounded-tr-[12px] rounded-br-[12px]')
						: (isBaseResume ? 'rounded-l-full rounded-r-none shadow-lg' : 'rounded-tl-[36px] rounded-bl-[36px] rounded-tr-none rounded-br-none')
				)}
				disabled={isExporting}
				onClick={() => handleExport('pdf')}
			>
				{isExporting ? (
					<>
						<div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
						<span>Exporting...</span>
					</>
				) : (
					<>
						<Download className="h-4 w-4" />
						<span>Download</span>
					</>
				)}
			</Button>

			{/* Dropdown trigger button - only show when not exporting */}
			{!isExporting && (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant="default"
							size="default"
							className={cn(
								'px-2 border-l-0',
								isBaseResume ? 'rounded-l-none rounded-r-full shadow-lg' : 'rounded-tl-none rounded-bl-none rounded-tr-[12px] rounded-br-[12px]',
								'hover:translate-y-0'
							)}
							disabled={isExporting}
						>
							<ChevronDownIcon className="h-4 w-4 fill-current" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" className="min-w-[180px]">
						<DropdownMenuItem
							onClick={() => handleExport('pdf')}
							className="cursor-pointer"
							disabled={isExporting}
						>
							Download as PDF
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={() => handleExport('tex')}
							className="cursor-pointer"
							disabled={isExporting}
						>
							Download .tex file
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			)}
		</div>
	)

	// For base resume, only show download button
	if (isBaseResume) {
		return (
			<TooltipProvider>
				<div
					className={cn(
						'fixed bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 z-50',
						className
					)}
				>
					<DownloadButton />
				</div>
			</TooltipProvider>
		)
	}

	// For non-base resumes, show all buttons
	return (
		<TooltipProvider>
			<div
				className={cn(
					'fixed bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-[#e5e5e5] rounded-full shadow-lg px-1 py-1',
					'border border-neutral-200',
					'max-w-[calc(100vw-2rem)] md:max-w-none',
					className
				)}
			>
			<DownloadButton />

			{/* Job details button */}
			<Tooltip>
				<TooltipTrigger asChild>
					<Button
						ref={jobButtonRef}
						variant="secondary"
						size="icon"
						className="rounded-lg bg-[#fbfbfb]"
						disabled={!job || job.status !== 'Success'}
						onClick={() => {
							if (jobButtonRef.current) {
								setButtonRect(jobButtonRef.current.getBoundingClientRect())
							}
							setShowJobDetails(true)
						}}
					>
						<Briefcase className="h-4 w-4" />
					</Button>
				</TooltipTrigger>
				<TooltipContent>
					{!job
						? 'No job associated with this resume'
						: job.status !== 'Success'
							? 'Job is still processing'
							: 'Job details'}
				</TooltipContent>
			</Tooltip>

			{/* Delete button */}
			<PopConfirm
				triggerElement={
					<Button
						variant="secondary"
						size="icon"
						className="rounded-lg text-black bg-[#fbfbfb]"
						disabled={isDeleting || resume?.status !== 'Success'}
					>
						{isDeleting ? (
							<Loader2 className="h-4 w-4 animate-spin" />
						) : (
							<Trash2 className="h-4 w-4" />
						)}
						<span className="sr-only">Delete resume</span>
					</Button>
				}
				message="Are you sure you want to delete this resume? This action cannot be undone."
				onYes={handleDelete}
			/>

			{/* Theme selector dropdown - hidden on mobile */}
			<Tooltip>
				<TooltipTrigger asChild>
					<div className="hidden md:inline-flex">
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant="secondary"
									size="default"
									className="rounded-tl-[12px] rounded-bl-[12px] rounded-tr-[36px] rounded-br-[36px] pl-4 pr-2 gap-2 bg-[#fbfbfb]"
									disabled
								>
									<span>Default theme</span>
									<ChevronDownIcon className="h-4 w-4 fill-current" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end" className="min-w-[180px]">
								<DropdownMenuItem disabled>
									Theme selection coming soon
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</TooltipTrigger>
				<TooltipContent>
					Coming soon
				</TooltipContent>
			</Tooltip>

			{/* Job Details Modal */}
			{job && (
				<JobDetailsModal
					isOpen={showJobDetails}
					onClose={() => setShowJobDetails(false)}
					job={job}
					buttonRect={buttonRect}
				/>
			)}
			</div>
		</TooltipProvider>
	)
}

export default ResumeActionsToolbar
