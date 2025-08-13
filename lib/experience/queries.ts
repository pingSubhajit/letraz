import {queryOptions, useQuery} from '@tanstack/react-query'
import {EXPERIENCE_KEYS} from '@/lib/experience/keys'
import {getExperiencesFromDB} from '@/lib/experience/actions'

export const experienceQueryOptions = (resumeId: string) => queryOptions({
	queryKey: [...EXPERIENCE_KEYS, resumeId],
	queryFn: () => getExperiencesFromDB(resumeId)
})


export const useCurrentExperiences = (resumeId: string) => {
    return useQuery(experienceQueryOptions(resumeId))
}
