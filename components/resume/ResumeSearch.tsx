'use client'

import {useEffect, useMemo, useState} from 'react'
import {CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList} from '@/components/ui/command'
import {cn} from '@/lib/utils'
import {useUser} from '@clerk/nextjs'
import {algoliasearch} from 'algoliasearch'
import {InstantSearch, useInstantSearch, useHits, Configure, useSearchBox} from 'react-instantsearch-hooks-web'

// JSX type workaround
const IS: any = InstantSearch
const CFG: any = Configure

type ResumeHit = {
  objectID: string
  id?: string
  tailored_job_title?: string
  title?: string
  company?: string
  job?: { title?: string; company_name?: string }
  thumbnail?: string
  thumbnail_s3_key?: string
  user?: string
  sections?: Array<{ type?: string; data?: Record<string, any> }>
}

const DummyResults = ({query, onSelect}: {query: string; onSelect: (id: string) => void}) => {
  const data: ResumeHit[] = [
    {objectID: '1', tailored_job_title: 'Frontend Engineer', company: 'Acme'},
    {objectID: '2', tailored_job_title: 'Backend Engineer', company: 'Globex'},
    {objectID: '3', tailored_job_title: 'Fullstack Developer', company: 'Umbrella'},
  ]
  const q = query.trim().toLowerCase()
  const filtered = q ? data.filter(d => (d.tailored_job_title||'').toLowerCase().includes(q) || (d.company||'').toLowerCase().includes(q)) : data
  return (
    <CommandList>
      {filtered.length === 0 && <CommandEmpty>No results</CommandEmpty>}
      <CommandGroup heading="Resumes">
        {filtered.map(hit => (
          <CommandItem key={hit.objectID} value={(hit.tailored_job_title||'') + ' ' + (hit.company||'')} onSelect={() => onSelect(hit.id ?? hit.objectID)}>
            <div className="flex flex-col">
              <span className="text-sm text-neutral-900">{hit.tailored_job_title || 'Untitled resume'}</span>
              <span className="text-xs text-neutral-600">{hit.company || '—'}</span>
            </div>
          </CommandItem>
        ))}
      </CommandGroup>
    </CommandList>
  )
}

const getThumbnailUrl = (hit: ResumeHit): string | undefined => {
  if (hit.thumbnail) return hit.thumbnail
  if (hit.thumbnail_s3_key) {
    const key = hit.thumbnail_s3_key
    if (key.startsWith('http')) return key
    return `https://s3.amazonaws.com/${key}`
  }
  return undefined
}

const AlgoliaResults = ({onSelect, query}: {onSelect: (id: string) => void, query: string}) => {
  const {status, error} = useInstantSearch()
  const {hits} = useHits<ResumeHit>()

  if (status === 'loading') {
    return (
      <CommandList>
        <CommandEmpty>Searching…</CommandEmpty>
      </CommandList>
    )
  }

  if (status === 'error') {
    return (
      <CommandList>
        <CommandEmpty>Search failed: {String(error?.message || 'Unknown error')}</CommandEmpty>
      </CommandList>
    )
  }

  // Do not show all results on empty query
  const trimmed = query.trim()
  if (trimmed.length === 0) {
    return (
      <CommandList>
        <CommandEmpty>Type to search your resumes</CommandEmpty>
      </CommandList>
    )
  }
  const finalHits = hits

  return (
    <CommandList>
      {(!finalHits || finalHits.length === 0) && <CommandEmpty>No results</CommandEmpty>}
      <CommandGroup heading="Resumes">
        {finalHits.map(hit => {
          const resumeId = hit.id ?? hit.objectID
          const title = hit.tailored_job_title || hit.title || hit.job?.title || 'Untitled resume'
          const company = hit.company || hit.job?.company_name || '—'
          const thumb = getThumbnailUrl(hit)
          const sectionText = (hit.sections || []).map(s => {
            const d = s?.data || {}
            const names = [d.company_name, d.job_title, d.institution_name]
            const skillNames = Array.isArray(d.skills) ? d.skills.map((sk: any) => sk?.name).join(' ') : ''
            return [...names.filter(Boolean), skillNames].filter(Boolean).join(' ')
          }).join(' ')
          const itemValue = `${title} ${company} ${hit.job?.title || ''} ${hit.job?.company_name || ''} ${sectionText}`.trim()
          return (
            <CommandItem key={hit.objectID} value={itemValue} onSelect={() => onSelect(resumeId)}>
              <div className="flex items-center gap-3 w-full">
                <div className="h-8 w-6 rounded bg-neutral-200 overflow-hidden flex items-center justify-center shrink-0">
                  {thumb ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={thumb} alt={title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="text-[10px] text-neutral-500">—</div>
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-neutral-900">{title}</span>
                  <span className="text-xs text-neutral-600">{company}</span>
                </div>
              </div>
            </CommandItem>
          )
        })}
      </CommandGroup>
    </CommandList>
  )
}

const QueryBridge = ({query}: {query: string}) => {
  const {refine} = useSearchBox()
  useEffect(() => {
    refine(query)
  }, [query, refine])
  return null
}

type Props = {
  className?: string
  onSelectResume?: (resumeId: string) => void
}

const ResumeSearch = ({className, onSelectResume}: Props) => {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const {user} = useUser()

  const appId = process.env.NEXT_PUBLIC_ALGOLIA_APPLICATION_ID
  const apiKey = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_ONLY_API_KEY
  const indexName = process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME || 'resume'
  const searchClient = useMemo(() => (appId && apiKey) ? algoliasearch(appId, apiKey) : null, [appId, apiKey])

  return (
    <>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setOpen(true)}
        placeholder="Search your resumes . . ."
        className="w-full text-xl font-medium text-neutral-900 placeholder:text-neutral-400 bg-transparent border-none outline-none focus:outline-none"
      />
      <CommandDialog open={open} onOpenChange={setOpen}>
        {searchClient ? (
          <IS searchClient={searchClient} indexName={indexName} stalledSearchDelay={200}>
            {user?.id && <CFG filters={`user:"${user.id}"`} />}
            <CommandInput placeholder="Type to search…" value={query} onValueChange={setQuery} />
            <QueryBridge query={query} />
            <AlgoliaResults query={query} onSelect={(id) => {
              onSelectResume?.(id)
              setOpen(false)
            }} />
          </IS>
        ) : (
          <>
            <CommandInput placeholder="Type to search…" value={query} onValueChange={setQuery} />
            <DummyResults query={query} onSelect={(id) => {
              onSelectResume?.(id)
              setOpen(false)
            }} />
          </>
        )}
      </CommandDialog>
    </>
  )
}

export default ResumeSearch
