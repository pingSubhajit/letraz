'use client'

import {InstantSearch, Configure, useHits, useSearchBox} from 'react-instantsearch-hooks-web'
import {liteClient as algoliasearch} from 'algoliasearch/lite'
import {useMemo, useEffect} from 'react'
import DashboardResumeGrid from './DashboardResumeGrid'
import ResumeCard from './ResumeCard'
import {ResumeListItem} from '@/lib/resume/types'
import {useResumes} from '@/lib/resume/queries'

// JSX workaround for React 19
const IS: any = InstantSearch
const CFG: any = Configure

interface SearchableResumeGridProps {
  userId?: string
  searchQuery: string
}

// Component to sync search query with InstantSearch
function SearchController({query}: {query: string}) {
  const {refine} = useSearchBox()
  
  useEffect(() => {
    refine(query)
  }, [query, refine])
  
  return null
}

// Component to render Algolia search results
function AlgoliaHits({excludeBase}: {excludeBase?: boolean}) {
  const {hits} = useHits<{
    objectID: string
    id: string
    user: string
    base?: boolean
    thumbnail?: string
    status?: string | null
    job?: {
      id?: string
      job_url?: string
      title?: string
      company_name?: string
      location?: string
      description?: string
      status?: string
    }
    sections?: Array<{
      type?: string
      data?: Record<string, any>
    }>
  }>()

  // Convert Algolia hits to ResumeListItem format
  const resumes: ResumeListItem[] = hits.map(hit => {
    const baseFields = {
      id: hit.id ?? hit.objectID,
      user: hit.user,
      thumbnail: hit.thumbnail ?? undefined,
      status: hit.status ?? undefined,
    }
    // Check if it's a base resume - base resumes typically have empty job fields
    const isBase = hit.base === true || (!hit.job?.id && !hit.job?.title && !hit.job?.company_name)

    if (isBase) {
      return {
        ...baseFields,
        base: true as const,
        job: {
          job_url: hit.job?.job_url || '',
          title: hit.job?.title || '',
          company_name: hit.job?.company_name || '',
          location: hit.job?.location || '',
          description: hit.job?.description || '',
          ...(hit.job?.status && {status: hit.job.status})
        }
      }
    } else {
      return {
        ...baseFields,
        base: false as const,
        job: {
          ...(hit.job?.id && {id: hit.job.id}),
          job_url: hit.job?.job_url || '',
          title: hit.job?.title || '',
          company_name: hit.job?.company_name || '',
          location: hit.job?.location || '',
          description: hit.job?.description || '',
          ...(hit.job?.status && {status: hit.job.status})
        }
      }
    }
  })

  // Filter resumes
  let filtered = resumes
  if (excludeBase) {
    filtered = filtered.filter(r => !r.base)
  }
  
  // Filter by visibility criteria
  filtered = filtered.filter(r => {
    // Base resumes are always visible (unless excluded)
    if (r.base) return !excludeBase
    
    // For non-base resumes, check job status
    const jobStatus = r.job?.status
    if (!jobStatus || jobStatus !== 'Success') return false
    
    // Check resume status
    const resumeStatus = r.status
    return resumeStatus === 'Success' || resumeStatus === 'Processing'
  })

  return (
    <>
      {filtered.map((resume) => (
        <ResumeCard key={resume.id} resume={resume} />
      ))}
      {filtered.length === 0 && (
        <div className="col-span-full text-center py-12">
          <p className="text-neutral-500 text-lg">No resumes found</p>
          <p className="text-neutral-400 text-sm mt-2">Try searching with different keywords</p>
        </div>
      )}
    </>
  )
}

export default function SearchableResumeGrid({userId, searchQuery}: SearchableResumeGridProps) {
  const {data: apiResumes, isLoading} = useResumes()
  const hasSearchQuery = searchQuery.trim().length > 0

  // Algolia configuration
  const appId = process.env.NEXT_PUBLIC_ALGOLIA_APPLICATION_ID
  const apiKey = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_ONLY_API_KEY
  const indexName = process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME || 'resume'
  
  const searchClient = useMemo(() => {
    if (appId && apiKey) {
      return algoliasearch(appId, apiKey)
    }
    return null
  }, [appId, apiKey])

  // If no search query, show API results
  if (!hasSearchQuery) {
    return (
      <DashboardResumeGrid
        resumes={apiResumes || []}
        isLoading={isLoading}
        excludeBase
      />
    )
  }

  // If Algolia not configured, show filtered API results
  if (!searchClient) {
    return (
      <DashboardResumeGrid
        resumes={apiResumes || []}
        isLoading={isLoading}
        searchQuery={searchQuery}
        excludeBase
      />
    )
  }

  // Show Algolia search results
  return (
    <IS searchClient={searchClient} indexName={indexName}>
      {userId && <CFG facetFilters={[`user:${userId}`]} />}
      <SearchController query={searchQuery} />
      <AlgoliaHits excludeBase />
    </IS>
  )
}