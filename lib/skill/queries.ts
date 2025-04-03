import {queryOptions, useQuery} from '@tanstack/react-query'
import {fetchGlobalSkills, fetchResumeSkills} from '@/lib/skill/actions'
import {GlobalSkill, ResumeSkill} from '@/lib/skill/types'

/**
 * Query options for fetching all global skills
 */
export const globalSkillsQueryOptions = queryOptions<GlobalSkill[]>({
	queryKey: ['skills', 'global'],
	queryFn: () => fetchGlobalSkills()
})

/**
 * Query hook for fetching all global skills
 */
export const useGlobalSkills = () => {
	return useQuery<GlobalSkill[]>({
		...globalSkillsQueryOptions
	})
}

/**
 * Query options for fetching skills associated with a resume
 */
export const resumeSkillsQueryOptions = (resumeId: string = 'base') => queryOptions<ResumeSkill[]>({
	queryKey: ['skills', 'resume', resumeId],
	queryFn: () => fetchResumeSkills(resumeId)
})

/**
 * Query hook for fetching skills associated with the current resume
 */
export const useCurrentResumeSkills = () => {
	return useQuery<ResumeSkill[]>({
		...resumeSkillsQueryOptions()
	})
}
