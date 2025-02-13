import {MutationOptions, useMutation} from '@tanstack/react-query'
import {Education, EducationMutation} from '@/lib/education/types'
import {deleteEducationFromDB, updateEducationOnDB} from '@/lib/education/actions'

export const useUpdateEducationMutation = (options?: MutationOptions<Education|undefined, Error, EducationMutation>) => useMutation({
	mutationFn: updateEducationOnDB,
	...options
})

export const useDeleteEducationMutation = (options?:MutationOptions<void, Error, string>) => useMutation({
	mutationFn: (id) => deleteEducationFromDB(id, 'base'),
	...options
})
