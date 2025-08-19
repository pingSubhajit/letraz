'use client'

import {Button} from '@/components/ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {ChevronDownIcon, Download, Briefcase, Trash2} from 'lucide-react'
import {useExportResumeMutation} from '@/lib/resume/mutations'
import {toast} from 'sonner'
import {cn} from '@/lib/utils'

interface ResumeActionsToolbarProps {
	resumeId: string
	className?: string
	isBaseResume?: boolean
}

const ResumeActionsToolbar = ({resumeId, className, isBaseResume = false}: ResumeActionsToolbarProps) => {
	const {mutateAsync: exportResume, isPending: isExporting} = useExportResumeMutation()

	const handleExport = async (format: 'pdf' | 'tex') => {
		try {
			const response = await exportResume(resumeId)
			
			const downloadUrl = format === 'pdf' ? response.pdf_url : response.latex_url
			const fileExtension = format === 'pdf' ? 'pdf' : 'tex'
			
			// Add https:// to the URL if it doesn't start with http
			const fullUrl = downloadUrl.startsWith('http') ? downloadUrl : `https://${downloadUrl}`
			
			// Create a temporary anchor element to trigger download
			const link = document.createElement('a')
			link.href = fullUrl
			link.download = `resume.${fileExtension}`
			link.target = '_blank'
			document.body.appendChild(link)
			link.click()
			document.body.removeChild(link)
			
			toast.success(`Resume exported as ${format.toUpperCase()} successfully`)
		} catch (error) {
			// Error handling is already done in the mutation
			console.error('Export failed:', error)
		}
	}

	// Download button component (reusable)
	const DownloadButton = () => (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="default"
					size="default"
					className={isBaseResume ? "rounded-full pl-4 pr-2 gap-2 shadow-lg" : "rounded-tl-[36px] rounded-bl-[36px] rounded-tr-[12px] rounded-br-[12px] pl-4 pr-2 gap-2"}
					disabled={isExporting}
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
							<ChevronDownIcon className="h-4 w-4 fill-current" />
						</>
					)}
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
	)

	// For base resume, only show download button
	if (isBaseResume) {
		return (
			<div 
				className={cn(
					'fixed bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 z-50',
					className
				)}
			>
				<DownloadButton />
			</div>
		)
	}

	// For non-base resumes, show all buttons
	return (
		<div 
			className={cn(
				'fixed bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-[#e5e5e5] rounded-full shadow-lg px-1 py-1',
				'border border-gray-200',
				'max-w-[calc(100vw-2rem)] md:max-w-none overflow-x-auto',
				className
			)}
		>
			<DownloadButton />

			{/* Job details button - disabled */}
			<Button
				variant="secondary"
				size="icon"
				className="rounded-lg bg-[#fbfbfb]"
				disabled
				title="Coming soon"
			>
				<Briefcase className="h-4 w-4" />
			</Button>

			{/* Delete button - disabled */}
			<Button
				variant="secondary"
				size="icon"
				className="rounded-lg text-black bg-[#fbfbfb]"
				disabled
				title="Coming soon"

			>
				<Trash2 className="h-4 w-4" />
			</Button>

			{/* Theme selector dropdown - hidden on mobile */}
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						variant="secondary"
						size="default"
						className="rounded-tl-[12px] rounded-bl-[12px] rounded-tr-[36px] rounded-br-[36px] pl-4 pr-2 gap-2 bg-[#fbfbfb] hidden md:inline-flex"
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
	)
}

export default ResumeActionsToolbar