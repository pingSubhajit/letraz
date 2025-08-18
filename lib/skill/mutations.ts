import {MutationOptions, useMutation} from '@tanstack/react-query'
import {GlobalSkill, NewSkill, ResumeSkill, SkillMutation} from '@/lib/skill/types'
import {addSkillToResume, createGlobalSkill, removeSkillFromResume, updateResumeSkill} from '@/lib/skill/actions'

/**
 * Mutation hook for adding a skill to the resume
 */
export const useAddSkillMutation = (options?: MutationOptions<ResumeSkill, Error, { data: SkillMutation, resumeId?: string }>) => {
	return useMutation({
		mutationFn: ({data, resumeId}) => addSkillToResume(data, resumeId || 'base'),
		...options
	})
}

/**
 * Mutation hook for updating a skill in the resume
 */
export const useUpdateSkillMutation = (options?: MutationOptions<ResumeSkill, Error, { id: string, data: Partial<SkillMutation>, resumeId?: string }>) => {
	return useMutation({
		mutationFn: ({id, data, resumeId}) => updateResumeSkill(id, data, resumeId || 'base'),
		...options
	})
}

/**
 * Mutation hook for removing a skill from the resume
 */
export const useRemoveSkillMutation = (options?: MutationOptions<void, Error, { id: string, resumeId?: string }>) => {
	return useMutation({
		mutationFn: ({id, resumeId}) => removeSkillFromResume(id, resumeId || 'base'),
		...options
	})
}

/**
 * Mutation hook for creating a new global skill
 */
export const useCreateGlobalSkillMutation = (options?: MutationOptions<GlobalSkill, Error, NewSkill>) => {
	return useMutation({
		mutationFn: (skillData: NewSkill) => createGlobalSkill(skillData),
		...options
	})
}
