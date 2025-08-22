'use client'

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle
} from '@/components/ui/dialog'
import {Badge} from '@/components/ui/badge'
import {Briefcase, MapPin, Building2, Link, FileText, Target, Gift} from 'lucide-react'
import {Job} from '@/lib/job/types'
import {Button} from '@/components/ui/button'

interface JobDetailsModalProps {
	isOpen: boolean
	onClose: () => void
	job: Job | null
}

const JobDetailsModal = ({isOpen, onClose, job}: JobDetailsModalProps) => {
	if (!job) return null

	const renderSection = (title: string, content: string | null, icon: React.ReactNode) => {
		if (!content) return null
		
		return (
			<div className="space-y-4 group">
				<div className="flex items-center gap-3">
					<div className="p-2 bg-flame-50 rounded-lg group-hover:bg-flame-100 transition-colors">
						{icon}
					</div>
					<h3 className="text-lg font-semibold text-gray-900">{title}</h3>
				</div>
				<div className="pl-14 space-y-2">
					{content.split('\n').filter(line => line.trim()).map((line, index) => (
						<div key={index} className="text-gray-600 leading-relaxed">
							{line.trim().startsWith('•') || line.trim().startsWith('-') ? (
								<div className="flex gap-3">
									<span className="text-flame-400 mt-1.5 text-xs">▸</span>
									<span className="flex-1">{line.replace(/^[•-]\s*/, '')}</span>
								</div>
							) : (
								<p className="text-gray-700">{line}</p>
							)}
						</div>
					))}
				</div>
			</div>
		)
	}

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white border border-gray-200 shadow-xl">
				<DialogHeader>
					<DialogTitle className="text-2xl font-bold text-gray-900">
						Job Details
					</DialogTitle>
					<DialogDescription className="sr-only">
						Details about the job position
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-8 py-6">
					{/* Job Title and Company */}
					<div className="space-y-4">
						<div className="flex items-start justify-between gap-4">
							<div className="space-y-2 flex-1">
								<h2 className="text-2xl font-bold text-gray-900">
									{job.title}
								</h2>
								<div className="flex items-center gap-6 text-sm">
									<span className="flex items-center gap-2 text-gray-700">
										<div className="p-1 bg-gray-100 rounded">
											<Building2 className="h-3.5 w-3.5 text-gray-600" />
										</div>
										<span className="font-medium">{job.company_name}</span>
									</span>
									{job.location && (
										<span className="flex items-center gap-2 text-gray-700">
											<div className="p-1 bg-gray-100 rounded">
												<MapPin className="h-3.5 w-3.5 text-gray-600" />
											</div>
											<span>{job.location}</span>
										</span>
									)}
								</div>
							</div>
							{job.status && (
								<Badge variant="secondary" className="shrink-0">
									{job.status}
								</Badge>
							)}
						</div>

						{/* Job URL */}
						{job.job_url && (
							<Button
								variant="outline"
								size="sm"
								className="w-fit"
								onClick={() => window.open(job.job_url, '_blank')}
							>
								<Link className="h-4 w-4 mr-2" />
								View Original Posting
							</Button>
						)}
					</div>

					<div className="relative my-8">
						<div className="absolute inset-0 flex items-center">
							<div className="w-full border-t border-gray-200"></div>
						</div>
						<div className="relative flex justify-center">
							<span className="px-4 bg-white text-sm text-gray-500">Details</span>
						</div>
					</div>

					{/* Job Description */}
					{renderSection(
						'Description',
						job.description,
						<FileText className="h-4 w-4 text-flame-600" />
					)}

					{/* Requirements */}
					{renderSection(
						'Requirements',
						job.requirements,
						<Target className="h-4 w-4 text-flame-600" />
					)}

					{/* Responsibilities */}
					{renderSection(
						'Responsibilities',
						job.responsibilities,
						<Briefcase className="h-4 w-4 text-flame-600" />
					)}

					{/* Benefits */}
					{renderSection(
						'Benefits',
						job.benefits,
						<Gift className="h-4 w-4 text-flame-600" />
					)}
				</div>

				<div className="flex justify-end pt-4 border-t">
					<Button variant="outline" onClick={onClose}>
						Close
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	)
}

export default JobDetailsModal