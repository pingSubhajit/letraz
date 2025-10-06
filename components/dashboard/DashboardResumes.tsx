'use client'

import {useResumeById, useResumes} from '@/lib/resume/queries'
import ResumeCard from '@/components/dashboard/ResumeCard'
import DashboardSearchContainer from '@/components/dashboard/DashboardSearchContainer'
import ResumeCardSkeleton from '@/components/skeletons/ResumeCardSkeleton'
import DashboardSearchSkeleton from '@/components/skeletons/DashboardSearchSkeleton'
import {useUser} from "@clerk/nextjs";
import {ResumeListItem} from "@/lib/resume/types";

interface DashboardResumesProps {
	showBaseOnly?: boolean
	showSearchOnly?: boolean
}

const DashboardResumes = ({showBaseOnly, showSearchOnly}: DashboardResumesProps) => {
	const {user, isLoaded} = useUser()
	const {data: resumes, isLoading} = useResumes()
	const {data: baseResume, isLoading: isBaseResumeLoading} = useResumeById('base') as unknown as {data: ResumeListItem, isLoading: boolean}

	// Show skeletons while loading
	if (isLoading || isBaseResumeLoading) {
		if (showBaseOnly) return <ResumeCardSkeleton className="w-72" isBase />
		if (showSearchOnly) return <DashboardSearchSkeleton />
		return null
	}
	
	// Show only base resume card (for placement next to input)
	if (showBaseOnly) {
		if (!baseResume) return null
		return <ResumeCard resume={baseResume} className="w-72" />
	}
	
	// Show only search section
	if (showSearchOnly && isLoaded) {
		if (!resumes || resumes.filter(r => !r.base).length === 0) return null
		return <DashboardSearchContainer userId={user?.id} />
	}
	
	// Default: show both (not used anymore but kept for compatibility)
	return (
		<>
			{baseResume && (
				<ResumeCard resume={baseResume} className="w-72" />
			)}
			{isLoaded && resumes && resumes.filter(r => !r.base).length > 0 && (
				<DashboardSearchContainer userId={user?.id} />
			)}
		</>
	)
}

export default DashboardResumes