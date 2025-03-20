import {queryOptions, useQuery} from '@tanstack/react-query'
import {BASE_RESUME_KEYS} from '@/lib/resume/key'
import {getResumeFromDB} from '@/lib/resume/actions'

export const baseResultQueryOptions = queryOptions({
	queryKey: BASE_RESUME_KEYS,
	queryFn: () => getResumeFromDB('base')
})


export const useFetchBaseResumeQuery = () => useQuery(baseResultQueryOptions)
