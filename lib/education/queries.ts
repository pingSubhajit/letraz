import {queryOptions, useQuery} from '@tanstack/react-query'
import {useParams} from 'next/navigation'
import {EDUCATION_KEYS} from '@/lib/education/keys'
import {getEducationsFromDB} from '@/lib/education/actions'

export const educationOptions = (resumeId: string) => queryOptions({
    queryKey: [...EDUCATION_KEYS, resumeId],
    queryFn: () => getEducationsFromDB(resumeId)
})


export const useCurrentEducations = () => {
    const params = useParams<{ resumeId?: string }>()
    const resumeId = (params?.resumeId as string) ?? 'base'
    return useQuery(educationOptions(resumeId))
}
