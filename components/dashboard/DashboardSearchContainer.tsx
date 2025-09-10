'use client'

import {useEffect, useState} from 'react'
import {useDebouncedValue} from '@mantine/hooks'
import DashboardSearchInput from './DashboardSearchInput'
import ResumeSearch from '@/components/dashboard/ResumeSearch'
import {bucket, useAnalytics} from '@/lib/analytics'

interface DashboardSearchContainerProps {
  userId?: string
}

const DashboardSearchContainer = ({userId}: DashboardSearchContainerProps) => {
	const [searchQuery, setSearchQuery] = useState('')
	const [debouncedSearchQuery] = useDebouncedValue(searchQuery, 300)
    const {track} = useAnalytics()

	useEffect(() => {
		if (!debouncedSearchQuery) return
		track('resume_search', {query_length_bucket: bucket(debouncedSearchQuery.length)})
	}, [debouncedSearchQuery])

	return (
		<>
			{/* Search bar with margins */}
			<div className="mb-10 px-8">
				<DashboardSearchInput
					value={searchQuery}
					onChange={setSearchQuery}
					placeholder="Search your resumes . . ."
				/>
			</div>

			{/* Searchable Resume grid with Algolia */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8 px-8" data-resume-grid>
				<ResumeSearch
					userId={userId}
					searchQuery={debouncedSearchQuery}
				/>
			</div>
		</>
	)
}

export default DashboardSearchContainer
