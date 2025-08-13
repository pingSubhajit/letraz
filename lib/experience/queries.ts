import {queryOptions, useQuery} from '@tanstack/react-query'
import {useParams} from 'next/navigation'
import {EXPERIENCE_KEYS} from '@/lib/experience/keys'
import {getExperiencesFromDB} from '@/lib/experience/actions'

export const experienceQueryOptions = (resumeId: string) => queryOptions({
    queryKey: [...EXPERIENCE_KEYS, resumeId],
    queryFn: () => getExperiencesFromDB(resumeId)
})


export const useCurrentExperiences = () => {
    const params = useParams<{ resumeId?: string }>()
    const resumeId = (params?.resumeId as string) ?? 'base'
    return useQuery(experienceQueryOptions(resumeId))
}
