'use client'

import { ResumeListItem } from '@/lib/resume/types'
import ResumeCard from '@/components/dashboard/ResumeCard'
import { useMemo } from 'react'

type Props = {
	resumes: ResumeListItem[]
	isLoading: boolean
	searchQuery?: string
	excludeBase?: boolean
}

const DashboardResumeGrid = ({ resumes, isLoading, searchQuery = '', excludeBase = false }: Props) => {
	const filteredResumes = useMemo(() => {
		if (!resumes) return []

		let filtered = resumes

		// First apply visibility filtering
		// Exclude base resume if requested
		if (excludeBase) {
			filtered = filtered.filter(r => !r.base)
		}

		// Filter by visibility criteria with clearer status check
		filtered = filtered.filter(r => {
			// Base resumes are always visible (unless excluded)
			if (r.base && !excludeBase) return true
			
			// For non-base resumes, check job status
			const jobStatus = r.job?.status
			if (jobStatus !== 'Success') return false
			
			// Check resume status - use explicit OR for clarity
			const resumeStatus = r.status
			return resumeStatus === 'Processing' || resumeStatus === 'Success'
		})

		// Then apply search filtering if query exists
		const trimmedQuery = searchQuery?.trim()
		if (trimmedQuery?.length > 0) {
			const query = trimmedQuery.toLowerCase()
			filtered = filtered.filter(r => {
				// Search in job title, company name, and location
				const jobTitle = r.job?.title?.toLowerCase() || ''
				const companyName = r.job?.company_name?.toLowerCase() || ''
				const location = r.job?.location?.toLowerCase() || ''
				
				return jobTitle.includes(query) || 
					   companyName.includes(query) || 
					   location.includes(query)
			})
		}

		return filtered
	}, [resumes, excludeBase, searchQuery])

	return (
		<>
			{isLoading && Array.from({ length: 8 }).map((_, i) => (
				<div key={`skeleton-${i}`} className="h-96 w-full rounded-lg border animate-pulse bg-neutral-100" />
			))}
			
			{!isLoading && filteredResumes.length > 0 && 
				filteredResumes.map((resume) => (
					<ResumeCard key={resume.id} resume={resume} />
				))
			}
			
			{!isLoading && filteredResumes.length === 0 && (
				<div className="col-span-full text-center py-12">
					{searchQuery?.trim().length > 0 ? (
						<>
							<p className="text-neutral-500 text-lg">
								No resumes found matching "{searchQuery}"
							</p>
							<p className="text-neutral-400 text-sm mt-2">
								Try searching with different keywords
							</p>
						</>
					) : resumes.length === 0 ? (
						<>
							<p className="text-neutral-500 text-lg">No resumes yet</p>
							<p className="text-neutral-400 text-sm mt-2">Create your first resume to get started</p>
						</>
					) : (
						<>
							<p className="text-neutral-500 text-lg">No resumes to display</p>
							<p className="text-neutral-400 text-sm mt-2">
								Create your first tailored resume using the input box above
							</p>
						</>
					)}
				</div>
			)}
		</>
	)
}

export default DashboardResumeGrid