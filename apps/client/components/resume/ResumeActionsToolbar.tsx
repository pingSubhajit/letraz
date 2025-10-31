'use client'

import {useRef, useState} from 'react'
import {createPortal} from 'react-dom'
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
import {useIsMobile} from '@/components/resume/hooks/useIsMobile'

interface ResumeActionsToolbarProps {
	resumeId: string
	className?: string
	isBaseResume?: boolean
	job?: Job | null
	isBottomSheetExpanded?: boolean
}

const ResumeActionsToolbar = ({resumeId, className, isBaseResume = false, job, isBottomSheetExpanded = false}: ResumeActionsToolbarProps) => {
	const {mutateAsync: exportResume, isPending: isExporting} = useExportResumeMutation()
	const {mutateAsync: deleteResume, isPending: isDeleting} = useDeleteResumeMutation()
	const {data: resume} = useResumeById(resumeId)
	const router = useRouter()
	const [showJobDetails, setShowJobDetails] = useState(false)
	const [buttonRect, setButtonRect] = useState<DOMRect | null>(null)
	const jobButtonRef = useRef<HTMLButtonElement>(null)
	const {track} = useAnalytics()
	const isMobile = useIsMobile(1024)

	const handleExport = async (format: 'pdf' | 'tex') => {
		try {
			track('resume_export_clicked', {resume_id: resumeId, format})

			// Fetch export URLs from API
			const response = await exportResume(resumeId)
			const downloadUrl = format === 'pdf' ? response.pdf_url : response.latex_url

			// Validate response
			if (!downloadUrl?.trim()) {
				toast.error('No download URL received from server')
				return
			}

			// Construct full URL with protocol if needed
			const fullUrl = downloadUrl.toLowerCase().startsWith('http')
				? downloadUrl
				: `https://${downloadUrl}`

			// Open PDF in new tab
			window.open(fullUrl, '_blank', 'noopener,noreferrer')
		} catch {
			toast.error('Failed to download resume, please try again.')
		}
	}

	const handleDelete = async () => {
		try {
			await deleteResume(resumeId)
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
		const content = (
			<TooltipProvider>
				<div
					className={cn(
						'lg:fixed lg:bottom-4 lg:left-1/2 lg:-translate-x-1/2 lg:z-[60]',
						'transition-opacity duration-300 lg:scale-75 xl:scale-90 2xl:scale-100',
						isBottomSheetExpanded && 'opacity-0 pointer-events-none lg:opacity-100 lg:pointer-events-auto',
						className
					)}
				>
					<DownloadButton />
				</div>
			</TooltipProvider>
		)
		// On desktop, render in a portal to avoid transformed ancestor context
		if (!isMobile && typeof document !== 'undefined') {
			return createPortal(content, document.body)
		}
		return content
	}

	// For non-base resumes, show all buttons
	const content = (
		<TooltipProvider>
			<div
				className={cn(
					'flex items-center gap-2 bg-[#e5e5e5] rounded-tl-[36px] rounded-bl-[36px] rounded-tr-[12px] rounded-br-[12px] md:rounded-full shadow-lg px-1 py-1',
					'border border-neutral-200',
					'transition-opacity duration-300',
					'max-w-[calc(100vw-2rem)] md:max-w-none',
					'lg:fixed lg:bottom-4 lg:left-1/2 lg:-translate-x-1/2 lg:z-[60]',
					'lg:scale-75 xl:scale-80 2xl:scale-100',
					isBottomSheetExpanded && 'opacity-0 pointer-events-none lg:opacity-100 lg:pointer-events-auto',
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

	// On desktop, render in a portal to avoid transformed ancestor context
	if (!isMobile && typeof document !== 'undefined') {
		return createPortal(content, document.body)
	}

	return content
}

export default ResumeActionsToolbar
