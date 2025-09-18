'use client'

import {useCallback} from 'react'
import {useDeleteResumeMutation, useExportResumeMutation} from '@/lib/resume/mutations'
import {useAnalytics} from '@/lib/analytics'

export const openDownloadInNewTab = (downloadUrl: string) => {
	// Validate the URL exists
	if (!downloadUrl || typeof downloadUrl !== 'string' || downloadUrl.trim() === '') {
		throw new Error('No download URL received from server')
	}

	let finalUrl = downloadUrl.trim()

	// Normalize to https for protocol-relative or http URLs
	if (finalUrl.startsWith('//')) {
		finalUrl = `https:${finalUrl}`
	} else if (finalUrl.startsWith('http://')) {
		finalUrl = finalUrl.replace(/^http:\/\//, 'https://')
	}

	try {
		// If not absolute, this will throw
		const parsed = new URL(finalUrl)
		finalUrl = parsed.toString()
	} catch {
		// As a last resort, assume it's an absolute host without protocol
		finalUrl = `https://${finalUrl.replace(/^\/*/, '')}`
	}

	window.open(finalUrl, '_blank', 'noopener,noreferrer')
}

export const useResumeExportHandler = () => {
	const {mutateAsync: exportResume, isPending: isExporting} = useExportResumeMutation()
	const {track} = useAnalytics()

	const exportPdf = useCallback(async (resumeId: string) => {
		try {
			track('resume_export_clicked', {resume_id: resumeId, format: 'pdf'})
			const response = await exportResume(resumeId)
			const downloadUrl = response.pdf_url
			openDownloadInNewTab(downloadUrl)
			track('resume_export_succeeded', {resume_id: resumeId, format: 'pdf'})
		} catch (error) {
			track('resume_export_failed', {resume_id: resumeId, format: 'pdf'})
			throw error
		}
	}, [exportResume, track])

	const exportTex = useCallback(async (resumeId: string) => {
		try {
			track('resume_export_clicked', {resume_id: resumeId, format: 'tex'})
			const response = await exportResume(resumeId)
			const downloadUrl = response.latex_url
			openDownloadInNewTab(downloadUrl)
			track('resume_export_succeeded', {resume_id: resumeId, format: 'tex'})
		} catch (error) {
			track('resume_export_failed', {resume_id: resumeId, format: 'tex'})
			throw error
		}
	}, [exportResume, track])

	return {exportPdf, exportTex, isExporting}
}

export const useResumeDeleteHandler = () => {
	const {mutateAsync: deleteResume, isPending: isDeleting} = useDeleteResumeMutation()
	const {track} = useAnalytics()

	const deleteResumeById = useCallback(async (resumeId: string, onSuccess?: () => void) => {
		await deleteResume(resumeId)
		try {track('resume_deleted', {resume_id: resumeId})} catch {}
		if (onSuccess) onSuccess()
	}, [deleteResume, track])

	return {deleteResumeById, isDeleting}
}
