import {MutationOptions, useMutation} from '@tanstack/react-query'
import {Education, EducationMutation} from '@/lib/education/types'
import {updateUserEducationAction} from './actions'

export const useUpdateUserEducationMutation = (options?: MutationOptions<Education, Error, EducationMutation>) => useMutation({
	mutationFn: updateUserEducationAction,
	...options
})

