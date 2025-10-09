'use client'

import {useResumeById} from '@/lib/resume/queries'
import ResumeCard from '@/components/dashboard/ResumeCard'
import ResumeCardSkeleton from '@/components/skeletons/ResumeCardSkeleton'
import {ResumeListItem} from '@/lib/resume/types'

interface BaseResumeCardProps {
	className?: string
}

const BaseResumeCard = ({className}: BaseResumeCardProps) => {
	const {data: baseResume, isLoading: isBaseResumeLoading} = useResumeById('base') as unknown as {data: ResumeListItem, isLoading: boolean}

	if (isBaseResumeLoading) {
		return <ResumeCardSkeleton className={className} isBase />
	}

	return <ResumeCard resume={baseResume} className={className} />
}

export default BaseResumeCard

