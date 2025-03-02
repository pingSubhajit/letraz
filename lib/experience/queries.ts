import {queryOptions, useQuery} from '@tanstack/react-query'
import {EXPERIENCE_KEYS} from './keys'
import {getExperiencesFromDB} from './actions'

export const experienceQueryOptions = queryOptions({
	queryKey: EXPERIENCE_KEYS,
	queryFn: () => getExperiencesFromDB('base')
})


export const useCurrentExperiences = () => useQuery(experienceQueryOptions)
