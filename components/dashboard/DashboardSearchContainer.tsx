'use client'

import {useState} from 'react'
import {useDebouncedValue} from '@mantine/hooks'
import DashboardSearchInput from './DashboardSearchInput'
import SearchableResumeGrid from './SearchableResumeGrid'

interface DashboardSearchContainerProps {
  userId?: string
}

export default function DashboardSearchContainer({userId}: DashboardSearchContainerProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearchQuery] = useDebouncedValue(searchQuery, 300)

  return (
    <>
      {/* Search bar with margins */}
      <div className="mb-12 px-16">
        <DashboardSearchInput 
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search your resumes . . ."
        />
      </div>

      {/* Resume grid with search */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8 px-8">
        <SearchableResumeGrid 
          userId={userId}
          searchQuery={debouncedSearchQuery}
        />
      </div>
    </>
  )
}