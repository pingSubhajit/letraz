'use server'

import {z} from 'zod'
import {Certification, CertificationMutation, CertificationMutationSchema, CertificationSchema} from '@/lib/certification/types'
import {api} from '@/lib/config/api-client'
import {handleErrors} from '@/lib//misc/error-handler'

/**
 * Adds new certification information to the database.
 * @param {CertificationMutation} certificationValues - The certification information to add.
 * @returns {Promise<Certification>} The newly added certification object.
 * @throws {Error} If validation, authentication, or API request fails.
 */
export const addCertificationToDB = async (
	certificationValues: CertificationMutation
): Promise<Certification> => {
	console.log('🔍 [CERTIFICATION API] Adding certification:', certificationValues)
	console.log('🔍 [CERTIFICATION API] Adding to resume: base')
	
	try {
		const params = CertificationMutationSchema.parse(certificationValues)
		console.log('🔍 [CERTIFICATION API] Parsed params:', params)
		
		const data = await api.post<Certification>('/resume/base/certification/', params)
		console.log('✅ [CERTIFICATION API] Successfully added certification:', data)
		
		return CertificationSchema.parse(data)
	} catch (error) {
		console.error('❌ [CERTIFICATION API] Failed to add certification:', error)
		return handleErrors(error, 'add certification')
	}
}

/**
 * Retrieves all certification entries for a specific resume from the database.
 * @param {string} [resumeId='base'] - The ID of the resume to retrieve certification entries for. Defaults to 'base'.
 * @returns {Promise<Certification[]>} An array of certification objects.
 * @throws {Error} If authentication or API request fails.
 */
export const getCertificationsFromDB = async (
	resumeId: string = 'base'
): Promise<Certification[] > => {
	const apiUrl = `/resume/${resumeId}/certification/`
	console.log('🔍 [CERTIFICATION API] Attempting to fetch certifications from:', apiUrl)
	console.log('🔍 [CERTIFICATION API] Full URL will be:', `${process.env.API_URL}${apiUrl}`)
	console.log('🔍 [CERTIFICATION API] Resume ID being used:', resumeId)
	
	try {
		console.log('🔍 [CERTIFICATION API] Making GET request...')
		const data = await api.get<Certification[]>(apiUrl)
		console.log('✅ [CERTIFICATION API] Successfully fetched certifications:', data)
		
		const parsedData = z.array(CertificationSchema).parse(data)
		console.log('✅ [CERTIFICATION API] Successfully parsed certifications:', parsedData)
		return parsedData
	} catch (error) {
		console.error('❌ [CERTIFICATION API] Failed to fetch certifications')
		console.error('❌ [CERTIFICATION API] Error type:', error?.constructor?.name)
		console.error('❌ [CERTIFICATION API] Error message:', (error as any)?.message)
		console.error('❌ [CERTIFICATION API] Full error object:', error)
		
		if (error instanceof Error) {
			console.error('❌ [CERTIFICATION API] Error stack:', error.stack)
		}
		
		// Return empty array as fallback instead of throwing
		console.warn('⚠️ [CERTIFICATION API] Returning empty array as fallback')
		return []
	}
}

/**
 * Updates an existing certification entry in the database.
 * @param {string} certificationId - The ID of the certification entry to update.
 * @param {Partial<CertificationMutation>} certificationValues - The updated certification information.
 * @param {string} [resumeId='base'] - The ID of the resume the certification entry belongs to. Defaults to 'base'.
 * @returns {Promise<Certification>} The updated certification object.
 * @throws {Error} If validation, authentication, or API request fails.
 */
export const updateCertificationInDB = async (
	certificationId: string,
	certificationValues: Partial<CertificationMutation>,
	resumeId: string = 'base'
): Promise<Certification> => {
	console.log('🔍 [CERTIFICATION API] Updating certification:', { certificationId, certificationValues, resumeId })
	
	try {
		const data = await api.patch<Certification>(`/resume/${resumeId}/certification/${certificationId}/`, certificationValues)
		console.log('✅ [CERTIFICATION API] Successfully updated certification:', data)
		
		return CertificationSchema.parse(data)
	} catch (error) {
		console.error('❌ [CERTIFICATION API] Failed to update certification:', error)
		return handleErrors(error, 'update certification')
	}
}

/**
 * Deletes a specific certification entry from the database.
 * @param {string} certificationId - The ID of the certification entry to delete.
 * @param {string} [resumeId='base'] - The ID of the resume the certification entry belongs to. Defaults to 'base'.
 * @throws {Error} If authentication or API request fails.
 */
export const deleteCertificationFromDB = async (
	certificationId: string,
	resumeId: string = 'base'
): Promise<void> => {
	console.log('🔍 [CERTIFICATION API] Deleting certification:', { certificationId, resumeId })
	
	try {
		await api.delete(`/resume/${resumeId}/certification/${certificationId}/`)
		console.log('✅ [CERTIFICATION API] Successfully deleted certification')
	} catch (error) {
		console.error('❌ [CERTIFICATION API] Failed to delete certification:', error)
		return handleErrors(error, 'delete certification')
	}
}
