import {queryOptions, useQuery} from '@tanstack/react-query'
import {EXPERIENCE_KEYS} from '@/lib/experience/keys'
import {getExperiencesFromDB} from '@/lib/experience/actions'

export const experienceQueryOptions = queryOptions({
	queryKey: EXPERIENCE_KEYS,
	queryFn: () => getExperiencesFromDB('base')
})


export const useCurrentExperiences = () => useQuery(experienceQueryOptions)
