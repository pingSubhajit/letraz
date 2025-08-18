'use client'

import type {InstantSearchProps} from 'react-instantsearch'
import {Configure, InstantSearch, useHits, useInstantSearch, useSearchBox} from 'react-instantsearch'
import {liteClient as algoliasearch} from 'algoliasearch/lite'
import type {ComponentType} from 'react'
import {useEffect, useLayoutEffect, useMemo, useRef, useState} from 'react'
import {normalizeThumbnailUrl, ResumeListItem} from '@/lib/resume/types'
import ResumeCard from "@/components/dashboard/ResumeCard";

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

// JSX typing for React 19 compatibility
const IS: ComponentType<InstantSearchProps> = InstantSearch as unknown as ComponentType<InstantSearchProps>
const CFG = Configure

interface ResumeSearchProps {
  userId?: string
  searchQuery: string
}

// Component to sync search query with InstantSearch
const SearchController = ({query}: {query: string}) => {
	const {refine} = useSearchBox()

	useEffect(() => {
		refine(query)
	}, [query, refine])

	return null
}

// Component to render Algolia search results
const AlgoliaHits = ({excludeBase, searchQuery}: {excludeBase?: boolean; searchQuery: string}) => {
	const {status} = useInstantSearch({ catchError: true })
	const {items} = useHits<AlgoliaResumeHit>() // 'hits' is deprecated, use 'items'
	const [cachedResults, setCachedResults] = useState<ResumeListItem[]>([])
	const [isInitialLoad, setIsInitialLoad] = useState(true)
	const hasScrolledRef = useRef(false)
	const lastQueryRef = useRef<string>('')

	// Convert Algolia hits to ResumeListItem format
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

	// Cache latest results once search is idle to avoid flicker during loading
	useEffect(() => {
		if (status === 'idle') {
			setCachedResults(filtered)
		}
	}, [status, filtered])

	// Mark initial load complete after the first non-loading state
	useEffect(() => {
		if (isInitialLoad && status !== 'loading' && status !== 'stalled') {
			setIsInitialLoad(false)
		}
	}, [status, isInitialLoad])

	// Smart scroll to first match
	useLayoutEffect(() => {
		// Reset scroll flag when query changes
		if (searchQuery !== lastQueryRef.current) {
			hasScrolledRef.current = false
			lastQueryRef.current = searchQuery
		}

		// Only scroll if we have a search query and haven't scrolled yet for this query
		if (searchQuery && filtered.length > 0 && !hasScrolledRef.current) {
			// Small delay to ensure DOM is ready
			const timer = setTimeout(() => {
				// Find the grid container in the parent
				const gridContainer = document.querySelector('[data-resume-grid]')
				if (gridContainer) {
					const firstCard = gridContainer.querySelector('a') // ResumeCard is wrapped in Link
					if (firstCard) {
						const rect = firstCard.getBoundingClientRect()
						const isInViewport = rect.top >= 0 && rect.bottom <= window.innerHeight
						
						// Only scroll if the element is not already in viewport
						if (!isInViewport) {
							firstCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
						}
					}
				}
				// Mark as scrolled after attempting (whether it scrolled or not)
				hasScrolledRef.current = true
			}, 100)

			return () => clearTimeout(timer)
		}
	}, [searchQuery, filtered.length])

	// Use cached results during loading to prevent blinking
	const displayResults = (status === 'loading' || status === 'stalled') && cachedResults.length > 0 
		? cachedResults 
		: filtered

	// Handle loading state only on initial load
	if ((status === 'loading' || status === 'stalled') && isInitialLoad) {
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
					Please check your connection and try again
				</p>
			</div>
		)
	}

	return (
		<>
			{displayResults.map((resume) => (
				<ResumeCard 
					key={resume.id} 
					resume={resume} 
					searchQuery={searchQuery}
				/>
			))}
			{displayResults.length === 0 && (
				<div className="col-span-full text-center py-12">
					<p className="text-neutral-500 text-lg">No resumes found</p>
					<p className="text-neutral-400 text-sm mt-2">Try searching with different keywords</p>
				</div>
			)}
		</>
	)
}

const ResumeSearch = ({userId, searchQuery}: ResumeSearchProps) => {
	// Algolia configuration
	const appId = process.env.NEXT_PUBLIC_ALGOLIA_APPLICATION_ID
	const apiKey = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_ONLY_API_KEY
	const indexName = process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME || 'resume'

	const searchClient = useMemo(() => {
		if (appId && apiKey) {
			try {
				return algoliasearch(appId, apiKey)
			} catch (error) {
				// Silently fail - error will be handled by showing fallback UI
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
	if (!userId) {
		return null
	}

	return (
		<IS searchClient={searchClient} indexName={indexName}>
			<CFG facetFilters={[`user:${userId}`]} />
			<SearchController query={searchQuery} />
			<AlgoliaHits excludeBase searchQuery={searchQuery} />
		</IS>
	)
}

export default ResumeSearch
