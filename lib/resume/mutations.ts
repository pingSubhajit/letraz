import {MutationOptions, useMutation, useQueryClient} from '@tanstack/react-query'
import {
	deleteResumeFromDB,
	exportResumeFromDB,
	parseUploadedResume,
	rearrangeResumeSections,
	replaceResume,
	tailorResumeInDB
} from '@/lib/resume/actions'
import {EnhancedResumeMutation, type GenericParsedResume} from '@/lib/resume/parser'
import {BASE_RESUME_KEYS} from '@/lib/resume/key'
import {toast} from 'sonner'
import type {TailorResumeResponse} from '@/lib/resume/types'
import {ExportResumeResponse, Resume, ResumeMutation} from '@/lib/resume/types'
import {useAnalytics} from '@/lib/analytics'

export const useRearrangeResumeSectionsMutation = () => {
	const queryClient = useQueryClient()
	const {track} = useAnalytics()

	return useMutation({
		mutationFn: ({resumeId, sectionIds}: {resumeId: string, sectionIds: string[]}) => rearrangeResumeSections(resumeId, sectionIds),
		onSuccess: () => {
			queryClient.invalidateQueries({queryKey: BASE_RESUME_KEYS})
			try {track('section_reordered')} catch {}
		},
		onError: (error) => {
			toast.error('Failed to update section order')
		}
	})
}

export const useTailorResumeMutation = (
	options?: MutationOptions<TailorResumeResponse|undefined, Error, { target: string }>
) => useMutation({
	mutationFn: (payload) => tailorResumeInDB(payload),
	...options
})

type ParseResumeParams = {
  formData: FormData
  format?: 'proprietary' | 'generic'
}

// Main mutation for proprietary format (most common use case)
export const useParseResumeMutation = () => {
	return useMutation<EnhancedResumeMutation, Error, ParseResumeParams>({
		mutationFn: async ({formData, format = 'proprietary'}) => {
			const result = await parseUploadedResume(formData, format)
			// Type guard: if format is proprietary, result should be EnhancedResumeMutation
			if (format === 'proprietary') {
				return result as EnhancedResumeMutation
			}
			throw new Error('Generic format not supported in this mutation. Use useParseGenericResumeMutation instead.')
		}
	})
}

// Separate mutation for generic format if needed
export const useParseGenericResumeMutation = () => {
	return useMutation<GenericParsedResume, Error, Omit<ParseResumeParams, 'format'>>({
		mutationFn: async ({formData}) => {
			const result = await parseUploadedResume(formData, 'generic')
			return result as GenericParsedResume
		}
	})
}

type ReplaceResumeParams = {
  payload: ResumeMutation
  resumeId?: string | 'base'
}

export const useReplaceResumeMutation = () => {
	const queryClient = useQueryClient()
	const {track} = useAnalytics()
	return useMutation<Resume, Error, ReplaceResumeParams>({
		mutationFn: async ({payload, resumeId = 'base'}) => replaceResume(payload, resumeId),
		onSuccess: (resume) => {
			queryClient.invalidateQueries({queryKey: BASE_RESUME_KEYS})
			try {
				const sections_count = Array.isArray(resume.sections) ? resume.sections.length : undefined
				track('resume_saved', {resume_id: resume.id, sections_count})
			} catch {}
		},
		onError: () => {
			toast.error('Failed to replace resume')
		}
	})
}

export const useExportResumeMutation = () => {
	return useMutation<ExportResumeResponse, Error, string>({
		mutationFn: async (resumeId: string) => exportResumeFromDB(resumeId),
		onError: () => {
			toast.error('Failed to export resume. Please try again.')
		}
	})
}

export const useDeleteResumeMutation = () => {
	const queryClient = useQueryClient()
	return useMutation<void, Error, string>({
		mutationFn: async (resumeId: string) => deleteResumeFromDB(resumeId),
		onSuccess: () => {
			queryClient.invalidateQueries({queryKey: BASE_RESUME_KEYS})
			toast.success('Resume deleted successfully')
		},
		onError: () => {
			toast.error('Failed to delete resume. Please try again.')
		}
	})
}
