'use server'

import {z} from 'zod'
import {Certification, CertificationMutation, CertificationMutationSchema, CertificationSchema} from '@/lib/certification/types'
import {api} from '@/lib/config/api-client'
import {handleErrors} from '@/lib//misc/error-handler'
import {apiDateToDate, dateToApiFormat} from '@/lib/utils'

/**
 * Adds new certification information to the database.
 * @param {CertificationMutation} certificationValues - The certification information to add.
 * @returns {Promise<Certification>} The newly added certification object.
 * @throws {Error} If validation, authentication, or API request fails.
 */
export const addCertificationToDB = async (
	certificationValues: CertificationMutation
): Promise<Certification> => {
	try {
		const params = CertificationMutationSchema.parse(certificationValues)

		// Transform date for API compatibility
		const apiParams = {
			...params,
			issue_date: dateToApiFormat(params.issue_date as Date)
		}

		const data = await api.post<Certification>('/resume/base/certification/', apiParams)

		return CertificationSchema.parse(data)
	} catch (error) {
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

	try {
		const data = await api.get<Certification[]>(apiUrl)

		const parsedData = z.array(CertificationSchema).parse(data)
		return parsedData
	} catch (error) {
		return handleErrors(error, 'fetch certifications')
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
	try {
		// Transform date for API compatibility if present
		const apiParams = certificationValues.issue_date ? {
			...certificationValues,
			issue_date: dateToApiFormat(certificationValues.issue_date as Date)
		} : certificationValues

		const data = await api.patch<Certification>(`/resume/${resumeId}/certification/${certificationId}/`, apiParams)

		return CertificationSchema.parse(data)
	} catch (error) {
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
	try {
		await api.delete(`/resume/${resumeId}/certification/${certificationId}/`)
	} catch (error) {
		return handleErrors(error, 'delete certification')
	}
}
