import {queryOptions, useQuery} from '@tanstack/react-query'
import {CERTIFICATION_KEYS} from '@/lib/certification/keys'
import {getCertificationsFromDB} from '@/lib/certification/actions'

export const certificationQueryOptions = queryOptions({
	queryKey: CERTIFICATION_KEYS,
	queryFn: () => getCertificationsFromDB('base')
})


export const useCurrentCertifications = () => useQuery(certificationQueryOptions)
