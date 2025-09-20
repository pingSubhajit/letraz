'use client'

import type {InstantSearchProps} from 'react-instantsearch'
import {Configure, InstantSearch, useHits, useInstantSearch, useSearchBox} from 'react-instantsearch'
import {liteClient as algoliasearch} from 'algoliasearch/lite'
import type {ComponentType} from 'react'
import {useEffect, useLayoutEffect, useMemo, useRef, useState} from 'react'
import {normalizeThumbnailUrl, ResumeListItem} from '@/lib/resume/types'
import ResumeCard from '@/components/dashboard/ResumeCard'
import {resultsBucket, useAnalytics} from '@/lib/analytics'

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

// Initialize search client once at module level
const initializeSearchClient = () => {
  const appId = process.env.NEXT_PUBLIC_ALGOLIA_APPLICATION_ID
  const apiKey = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_ONLY_API_KEY
  
  if (!appId || !apiKey) {
    return null
  }
  
  try {
    return algoliasearch(appId, apiKey)
  } catch (error) {
    console.error('[Algolia] Failed to initialize client:', error)
    return null
  }
}

// Single instance created at module load
const searchClient = initializeSearchClient()
const indexName = process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME || 'resume'

// JSX typing for React 19 compatibility
const IS = InstantSearch as unknown as ComponentType<InstantSearchProps>

const SearchController = ({query}: {query: string}) => {
  const {refine} = useSearchBox({queryHook: (q, r) => r(q)})
  
  useEffect(() => {
    refine(query)
  }, [query, refine])

  return null
}

// Component to render Algolia search results
const AlgoliaHits = ({excludeBase, searchQuery}: {excludeBase?: boolean; searchQuery: string}) => {
  const {status} = useInstantSearch({catchError: true})
  const {items} = useHits<AlgoliaResumeHit>()
  const [cachedResults, setCachedResults] = useState<ResumeListItem[]>([])
  const [hasInitialized, setHasInitialized] = useState(false)
  const hasScrolledRef = useRef(false)
  const {track} = useAnalytics()

  // Convert Algolia hits to ResumeListItem format and filter
  const filtered = useMemo(() => {
    const resumes: ResumeListItem[] = items.map(hit => {
      const baseFields = {
        id: hit.id ?? hit.objectID,
        user: hit.user,
        thumbnail: normalizeThumbnailUrl(hit.thumbnail) ?? undefined,
        status: hit.status ?? undefined
      }
      // Check if it's a base resume - base resumes typically have empty job fields
      const isBase = Boolean(hit.base) || (!hit.job?.id && !hit.job?.title && !hit.job?.company_name)

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
    filtered = filtered.filter((r) => {
      // Base resumes are always visible (unless excluded)
      if (r.base) return !excludeBase

      // For non-base resumes, check job status
      const jobStatus = r.job?.status
      if (!jobStatus || jobStatus !== 'Success') return false

      // Check resume status
      const resumeStatus = r.status
      return resumeStatus === 'Success' || resumeStatus === 'Processing'
    })

    return filtered
  }, [items, excludeBase])

  // Cache results and track analytics
  useEffect(() => {
    if (status === 'idle' && filtered.length > 0) {
      setCachedResults(filtered)
      setHasInitialized(true)
      try {
        track('resume_search', {
          query_length_bucket: searchQuery ? `${searchQuery.length}` : '0',
          results_count_bucket: resultsBucket(filtered.length)
        })
      } catch {}
    } else if (status === 'idle' && !hasInitialized) {
      // First load with no results
      setHasInitialized(true)
    }
  }, [status, filtered, searchQuery, track, hasInitialized])

  // Smart scroll to first match
  useLayoutEffect(() => {
    if (hasScrolledRef.current || !searchQuery) return
    
    const grid = document.querySelector('[data-resume-grid]')
    const firstLink = grid?.querySelector('a[href^="/app/craft/resumes/"]') as HTMLAnchorElement | null
    if (firstLink) {
      firstLink.scrollIntoView({behavior: 'smooth', block: 'center'})
      hasScrolledRef.current = true
    }
  }, [searchQuery, filtered])

  // Reset scroll flag when search query changes
  useEffect(() => {
    hasScrolledRef.current = false
  }, [searchQuery])

  // Don't show anything during initial load (it's very fast)
  if (!hasInitialized && (status === 'loading' || status === 'stalled')) {
    return null
  }

  // Handle error state
  if (status === 'error') {
    return (
      <div className="col-span-full text-center py-12">
        <p className="text-neutral-500 text-lg">Failed to load search results</p>
        <p className="text-neutral-400 text-sm mt-2">
          Please check your connection and try again
        </p>
      </div>
    )
  }

  // Determine which results to display
  const displayResults = filtered.length > 0 ? filtered : cachedResults

  return (
    <>
      {displayResults.map((resume) => (
        <ResumeCard
          key={resume.id}
          resume={resume}
          searchQuery={searchQuery}
        />
      ))}
      {displayResults.length === 0 && hasInitialized && (
        <div className="col-span-full text-center py-12">
          <p className="text-neutral-500 text-lg">No resumes found</p>
          <p className="text-neutral-400 text-sm mt-2">
            {searchQuery ? 'Try searching with different keywords' : 'Start by creating your first resume'}
          </p>
        </div>
      )}
    </>
  )
}

interface ResumeSearchProps {
  userId?: string
  searchQuery: string
}

const CFG = Configure as unknown as ({facetFilters}: {facetFilters: any}) => JSX.Element

const ResumeSearch = ({userId, searchQuery}: ResumeSearchProps) => {
  // Early return if no userId
  if (!userId) {
    return null
  }

  // Check if Algolia client is available
  if (!searchClient) {
    return (
      <div className="col-span-full text-center py-12">
        <p className="text-neutral-500 text-lg">Search is not configured</p>
        <p className="text-neutral-400 text-sm mt-2">Please contact support if this issue persists</p>
      </div>
    )
  }

  return (
    <IS 
      searchClient={searchClient} 
      indexName={indexName}
      future={{
        preserveSharedStateOnUnmount: true
      }}
    >
      <CFG facetFilters={[`user:${userId}`]} />
      <SearchController query={searchQuery} />
      <AlgoliaHits excludeBase searchQuery={searchQuery} />
    </IS>
  )
}

export default ResumeSearch