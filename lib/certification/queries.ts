import {queryOptions, useQuery} from '@tanstack/react-query'
import {useParams} from 'next/navigation'
import {CERTIFICATION_KEYS} from '@/lib/certification/keys'
import {getCertificationsFromDB} from '@/lib/certification/actions'

export const certificationOptions = (resumeId: string) => queryOptions({
	queryKey: [...CERTIFICATION_KEYS, resumeId],
	queryFn: () => getCertificationsFromDB(resumeId)
})


export const useCurrentCertifications = () => {
	const params = useParams<{ resumeId?: string }>()
	const resumeId = (params?.resumeId as string) ?? 'base'
	return useQuery(certificationOptions(resumeId))
}
