import {MutationOptions, useMutation} from '@tanstack/react-query'
import {Certification, CertificationMutation} from '@/lib/certification/types'
import {deleteCertificationFromDB, addCertificationToDB, updateCertificationInDB} from '@/lib/certification/actions'

export const useAddCertificationMutation = (options?: MutationOptions<Certification|undefined, Error, CertificationMutation>) => useMutation({
	mutationFn: addCertificationToDB,
	...options
})

export const useUpdateCertificationMutation = (options?: MutationOptions<Certification|undefined, Error, {id: string, data: Partial<CertificationMutation>}>) => useMutation({
	mutationFn: ({id, data}) => updateCertificationInDB(id, data),
	...options
})

export const useDeleteCertificationMutation = (options?:MutationOptions<void, Error, string>) => useMutation({
	mutationFn: (id) => deleteCertificationFromDB(id, 'base'),
	...options
})
