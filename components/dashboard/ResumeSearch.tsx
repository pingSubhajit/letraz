'use client'

import {InstantSearch, Configure, useHits, useSearchBox, useInstantSearch} from 'react-instantsearch-hooks-web'
import {liteClient as algoliasearch} from 'algoliasearch/lite'
import {useMemo, useEffect} from 'react'
import ResumeCard from './ResumeCard'
import {ResumeListItem} from '@/lib/resume/types'

// Algolia Hit type based on the schema
interface AlgoliaResumeHit {
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
  [key: string]: any // Index signature for Algolia BaseHit compatibility
}

// JSX workaround for React 19 - proper typing
const IS = InstantSearch as any
const CFG = Configure as any

interface ResumeSearchProps {
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
function AlgoliaHits({excludeBase, searchQuery}: {excludeBase?: boolean; searchQuery: string}) {
  const {status, error} = useInstantSearch()
  const {hits} = useHits<AlgoliaResumeHit>()

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

  // Handle loading state
  if (status === 'loading' || status === 'stalled') {
    return (
      <div className="col-span-full flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Handle error state
  if (status === 'error') {
    return (
      <div className="col-span-full text-center py-12">
        <p className="text-red-500 text-lg">Search temporarily unavailable</p>
        <p className="text-neutral-400 text-sm mt-2">
          {error?.message || 'Please check your connection and try again'}
        </p>
      </div>
    )
  }

  return (
    <>
      {filtered.map((resume) => (
        <ResumeCard key={resume.id} resume={resume} searchQuery={searchQuery} />
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

export default function ResumeSearch({userId, searchQuery}: ResumeSearchProps) {
  // Algolia configuration
  const appId = process.env.NEXT_PUBLIC_ALGOLIA_APPLICATION_ID
  const apiKey = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_ONLY_API_KEY
  const indexName = process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME || 'resume'
  
  const searchClient = useMemo(() => {
    if (appId && apiKey) {
      try {
        return algoliasearch(appId, apiKey) 
      } catch (error) {
        console.error('Failed to initialize Algolia client:', error)
        return null
      }
    }
    return null
  }, [appId, apiKey])

  // If Algolia not configured, show error message
  if (!searchClient) {
    return (
      <div className="col-span-full text-center py-12">
        <p className="text-neutral-500 text-lg">Search is not configured</p>
        <p className="text-neutral-400 text-sm mt-2">Please contact support if this issue persists</p>
      </div>
    )
  }

  // Show Algolia search results (empty query returns all resumes)
  return (
    <IS searchClient={searchClient} indexName={indexName}>
      {userId && <CFG facetFilters={[`user:${userId}`]} />}
      <SearchController query={searchQuery} />
      <AlgoliaHits excludeBase searchQuery={searchQuery} />
    </IS>
  )
}