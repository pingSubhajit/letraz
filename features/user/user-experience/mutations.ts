import {Experience, ExperienceMutation} from '@/lib/experience/types'
import {MutationOptions, useMutation} from '@tanstack/react-query'
import {updateUserExperienceAction} from './actions'

export const useUpdateUserExperienceMutation = (options?: MutationOptions<Experience, Error, ExperienceMutation>) => useMutation(
	{
		mutationFn: updateUserExperienceAction,
		...options
	}
)
