'use client'

import {useResumes} from '@/lib/resume/queries'
import ResumeCard from '@/components/dashboard/ResumeCard'
import DashboardSearchContainer from '@/components/dashboard/DashboardSearchContainer'
import ResumeCardSkeleton from '@/components/skeletons/ResumeCardSkeleton'
import DashboardSearchSkeleton from '@/components/skeletons/DashboardSearchSkeleton'

interface DashboardResumesProps {
	userId?: string
	showBaseOnly?: boolean
	showSearchOnly?: boolean
}

const DashboardResumes = ({userId, showBaseOnly, showSearchOnly}: DashboardResumesProps) => {
	const {data: resumes, isLoading} = useResumes()
	
	// Show skeletons while loading
	if (isLoading) {
		if (showBaseOnly) return <ResumeCardSkeleton className="w-72" isBase />
		if (showSearchOnly) return <DashboardSearchSkeleton />
		return null
	}
	
	const baseResume = resumes?.find(r => r.base)
	
	// Show only base resume card (for placement next to input)
	if (showBaseOnly) {
		if (!baseResume) return null
		return <ResumeCard resume={baseResume} className="w-72" />
	}
	
	// Show only search section
	if (showSearchOnly) {
		if (!resumes || resumes.filter(r => !r.base).length === 0) return null
		return <DashboardSearchContainer userId={userId} />
	}
	
	// Default: show both (not used anymore but kept for compatibility)
	return (
		<>
			{baseResume && (
				<ResumeCard resume={baseResume} className="w-72" />
			)}
			{resumes && resumes.filter(r => !r.base).length > 0 && (
				<DashboardSearchContainer userId={userId} />
			)}
		</>
	)
}

export default DashboardResumes