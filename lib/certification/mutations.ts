import {MutationOptions, useMutation} from '@tanstack/react-query'
import {Certification, CertificationMutation} from '@/lib/certification/types'
import {addCertificationToDB, deleteCertificationFromDB, updateCertificationInDB} from '@/lib/certification/actions'

export const useAddCertificationMutation = (options?: MutationOptions<Certification|undefined, Error, {data: CertificationMutation, resumeId?: string}>) => useMutation({
	mutationFn: ({data, resumeId}) => addCertificationToDB(data, resumeId || 'base'),
	...options
})

export const useUpdateCertificationMutation = (options?: MutationOptions<Certification|undefined, Error, {id: string, data: Partial<CertificationMutation>, resumeId?: string}>) => useMutation({
	mutationFn: ({id, data, resumeId}) => updateCertificationInDB(id, data, resumeId || 'base'),
	...options
})

export const useDeleteCertificationMutation = (options?:MutationOptions<void, Error, {id: string, resumeId?: string}>) => useMutation({
	mutationFn: ({id, resumeId}) => deleteCertificationFromDB(id, resumeId || 'base'),
	...options
})
