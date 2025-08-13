import {queryOptions, useQuery} from '@tanstack/react-query'
import {useParams} from 'next/navigation'
import {getGlobalSkills, getProjectsFromDB} from './actions'
import {PROJECT_KEYS} from './keys'

export const projectQueryOptions = (resumeId: string) => queryOptions({
    queryKey: [...PROJECT_KEYS, resumeId],
    queryFn: () => getProjectsFromDB(resumeId)
})

export const globalSkillsQueryOptions = queryOptions({
	queryKey: [...PROJECT_KEYS, 'globalSkills'],
	queryFn: getGlobalSkills
})

export const useCurrentProjects = () => {
    const params = useParams<{ resumeId?: string }>()
    const resumeId = (params?.resumeId as string) ?? 'base'
    return useQuery(projectQueryOptions(resumeId))
}

export const useGlobalSkills = () => useQuery(globalSkillsQueryOptions)
