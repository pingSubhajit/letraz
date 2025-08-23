'use client'

import {useEffect, useState} from 'react'
import type {ReactNode} from 'react'
import {createPortal} from 'react-dom'
import {motion, AnimatePresence} from 'framer-motion'
import {Briefcase, MapPin, Building2, Link, FileText, Target, Gift, X} from 'lucide-react'
import {Badge} from '@/components/ui/badge'
import {Button} from '@/components/ui/button'
import {Job} from '@/lib/job/types'

interface JobDetailsModalProps {
	isOpen: boolean
	onClose: () => void
	job: Job | null
	buttonRect?: DOMRect | null
}

const JobDetailsModal = ({isOpen, onClose, job, buttonRect}: JobDetailsModalProps) => {
	// Hooks must be called before any early returns
	const [mounted, setMounted] = useState(false)

	useEffect(() => {
		setMounted(true)
	}, [])

	// Helper functions
	const renderSection = (title: string, content: string | null, icon: ReactNode) => {
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

	// Calculate initial position based on button rect
	const getInitialPosition = () => {
		if (!buttonRect) return { x: 0, y: 0, scale: 0.3 }
		
		const modalWidth = 768 // max-w-3xl
		const modalHeight = window.innerHeight * 0.9
		
		const centerX = window.innerWidth / 2 - modalWidth / 2
		const centerY = window.innerHeight / 2 - modalHeight / 2
		
		const buttonCenterX = buttonRect.left + buttonRect.width / 2
		const buttonCenterY = buttonRect.top + buttonRect.height / 2
		
		return {
			x: buttonCenterX - centerX - modalWidth / 2,
			y: buttonCenterY - centerY - modalHeight / 2,
			scale: 0.05
		}
	}

	// Early returns after hooks
	if (!job) return null
	if (!mounted) return null

	return createPortal(
		<AnimatePresence>
			{isOpen && (
				<>
					{/* Backdrop */}
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.2 }}
						className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
						onClick={onClose}
					/>
					
					{/* Modal */}
					<motion.div
						className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
					>
						<motion.div
							initial={getInitialPosition()}
							animate={{ x: 0, y: 0, scale: 1 }}
							exit={getInitialPosition()}
							transition={{
								type: "spring",
								damping: 25,
								stiffness: 300,
								duration: 0.4
							}}
							className="max-w-3xl w-full max-h-[90vh] bg-white rounded-2xl shadow-2xl pointer-events-auto overflow-hidden"
						>
							{/* Custom Dialog Content */}
							<div className="relative bg-white rounded-2xl overflow-y-auto max-h-[90vh]">
								{/* Close Button */}
								<button
									onClick={onClose}
									className="absolute right-4 top-4 rounded-full bg-gray-100 p-2 opacity-70 hover:opacity-100 hover:bg-gray-200 transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 z-10"
								>
									<X className="h-4 w-4" />
									<span className="sr-only">Close</span>
								</button>
								
								{/* Header */}
								<div className="px-6 py-4 border-b">
									<h2 className="text-2xl font-bold text-gray-900">Job Details</h2>
								</div>

								{/* Content */}
								<div className="px-6 space-y-8 py-6">
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
								asChild
							>
								<a href={job.job_url} target="_blank" rel="noopener noreferrer">
									<Link className="h-4 w-4 mr-2" />
									View Original Posting
								</a>
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

								{/* Footer */}
								<div className="flex justify-end px-6 py-4 border-t">
									<Button variant="outline" onClick={onClose}>
										Close
									</Button>
								</div>
							</div>
						</motion.div>
					</motion.div>
				</>
			)}
		</AnimatePresence>,
		document.body
	)
}

export default JobDetailsModal
