import {MutationOptions, useMutation} from '@tanstack/react-query'
import {Education, EducationMutation} from '@/lib/education/types'
import {deleteEducationFromDB, addEducationToDB} from '@/lib/education/actions'

export const useAddEducationMutation = (options?: MutationOptions<Education|undefined, Error, EducationMutation>) => useMutation({
	mutationFn: addEducationToDB,
	...options
})

export const useDeleteEducationMutation = (options?:MutationOptions<void, Error, string>) => useMutation({
	mutationFn: (id) => deleteEducationFromDB(id, 'base'),
	...options
})
