'use client'

import {useResumes} from '@/lib/resume/queries'
import {ResumeListItem} from '@/lib/resume/types'
import ResumeCard from '@/components/dashboard/ResumeCard'

const DashboardResumeGrid = () => {
	const {data: resumes, isLoading} = useResumes()

	return (
		<>
			{isLoading && Array.from({length: 8}).map((_, i) => (
				<div key={`skeleton-${i}`} className="h-96 w-full rounded-lg border animate-pulse bg-neutral-100" />
			))}
			{!isLoading && resumes && (() => {
				const baseResume = resumes.find(r => r.base)
				const otherResumes = resumes.filter(r => !r.base)
				const ordered = [baseResume, ...otherResumes].filter(Boolean) as ResumeListItem[]

				const visible = ordered.filter(r => {
					if (r.base) return true
					const jobStatus = r.job?.status || null
					if (jobStatus !== 'Success') return false
					const resumeStatus = r.status || null
					return !(resumeStatus !== 'Processing' && resumeStatus !== 'Success')
				})

				return visible.map((resume) => (
					<ResumeCard key={resume.id} resume={resume} />
				))
			})()}
		</>
	)
}

export default DashboardResumeGrid


