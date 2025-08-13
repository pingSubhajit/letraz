import {queryOptions, useQuery} from '@tanstack/react-query'
import {CERTIFICATION_KEYS} from '@/lib/certification/keys'
import {getCertificationsFromDB} from '@/lib/certification/actions'

export const certificationOptions = (resumeId: string) => queryOptions({
	queryKey: [...CERTIFICATION_KEYS, resumeId],
	queryFn: () => getCertificationsFromDB(resumeId)
})


export const useCurrentCertifications = (resumeId: string) => {
	return useQuery(certificationOptions(resumeId))
}
