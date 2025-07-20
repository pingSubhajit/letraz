import {MutationOptions, useMutation} from '@tanstack/react-query'
import {ResumeSkill, SkillMutation, NewSkill, GlobalSkill} from '@/lib/skill/types'
import {addSkillToResume, removeSkillFromResume, updateResumeSkill, createGlobalSkill} from '@/lib/skill/actions'

/**
 * Mutation hook for adding a skill to the resume
 */
export const useAddSkillMutation = (options?: MutationOptions<ResumeSkill, Error, SkillMutation>) => {
	return useMutation({
		mutationFn: (skillData: SkillMutation) => addSkillToResume(skillData),
		...options
	})
}

/**
 * Mutation hook for updating a skill in the resume
 */
export const useUpdateSkillMutation = (options?: MutationOptions<ResumeSkill, Error, { id: string, data: Partial<SkillMutation> }>) => {
	return useMutation({
		mutationFn: ({id, data}) => updateResumeSkill(id, data),
		...options
	})
}

/**
 * Mutation hook for removing a skill from the resume
 */
export const useRemoveSkillMutation = (options?: MutationOptions<void, Error, string>) => {
	return useMutation({
		mutationFn: (skillId: string) => removeSkillFromResume(skillId),
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
