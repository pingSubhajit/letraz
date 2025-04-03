import {MutationOptions, useMutation} from '@tanstack/react-query'
import {ResumeSkill, SkillMutation} from '@/lib/skill/types'
import {addSkillToResume, removeSkillFromResume, updateResumeSkill} from '@/lib/skill/actions'

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

// Add a mutation for creating a new global skill
export const useCreateGlobalSkillMutation = (options: any = {}) => {
	return useMutation({
		mutationFn: async (data: { name: string; category?: string; preferred?: boolean }) => {
			const response = await fetch('/api/v1/skill/', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(data)
			})

			if (!response.ok) {
				const errorData = await response.json()
				throw new Error(errorData.message || 'Failed to create skill')
			}

			return response.json()
		},
		...options
	})
}
