'use client'

import {useResumes} from '@/lib/resume/queries'
import DashboardSearchContainer from '@/components/dashboard/DashboardSearchContainer'
import DashboardSearchSkeleton from '@/components/skeletons/DashboardSearchSkeleton'
import {useUser} from '@clerk/nextjs'

const DashboardResumesGrid = () => {
	const {user} = useUser()
	const {data: resumes, isLoading} = useResumes(true) // Exclude base resumes

	if (isLoading) {
		return <DashboardSearchSkeleton />
	}

	// Don't render if there are no non-base resumes
	if (!resumes || resumes.length === 0) {
		return null
	}

	return <DashboardSearchContainer userId={user?.id} />
}

export default DashboardResumesGrid

