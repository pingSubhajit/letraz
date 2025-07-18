import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import {
	addExperienceToDB,
	deleteExperienceFromDB,
	getExperiencesFromDB,
	updateExperienceInDB
} from '@/lib/experience/actions'
import {api} from '@/lib/config/api-client'
import {handleErrors} from '@/lib/misc/error-handler'
import {Experience, ExperienceMutation} from '@/lib/experience/types'

// Mock dependencies
vi.mock('@/lib/config/api-client')
vi.mock('@/lib/misc/error-handler')

const mockApi = vi.mocked(api)
const mockHandleErrors = vi.mocked(handleErrors)

describe('Experience Actions', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	afterEach(() => {
		vi.resetAllMocks()
	})

	describe('addExperienceToDB', () => {
		const mockExperienceData: ExperienceMutation = {
			company_name: 'Tech Corp',
			job_title: 'Senior Software Engineer',
			country: 'USA',
			city: 'San Francisco',
			employment_type: 'flt',
			started_from_month: '1',
			started_from_year: '2022',
			finished_at_month: '12',
			finished_at_year: '2023',
			current: false,
			description: '<p>Led development of web applications using React and Node.js.</p>'
		}

		const mockCreatedExperience: Experience = {
			id: '123e4567-e89b-12d3-a456-426614174000',
			user: 'user_123',
			resume_section: '123e4567-e89b-12d3-a456-426614174001',
			company_name: 'Tech Corp',
			job_title: 'Senior Software Engineer',
			country: {
				code: 'USA',
				name: 'United States'
			},
			city: 'San Francisco',
			employment_type: 'flt',
			started_from_month: 1,
			started_from_year: 2022,
			finished_at_month: 12,
			finished_at_year: 2023,
			current: false,
			description: '<p>Led development of web applications using React and Node.js.</p>',
			created_at: '2024-01-01T00:00:00Z',
			updated_at: '2024-01-01T00:00:00Z'
		}

		it('should add experience to database successfully', async () => {
			mockApi.post.mockResolvedValue(mockCreatedExperience)

			const result = await addExperienceToDB(mockExperienceData)

			expect(mockApi.post).toHaveBeenCalledWith('/resume/base/experience/', mockExperienceData)
			expect(result).toEqual(mockCreatedExperience)
		})

		it('should validate input data with schema', async () => {
			const invalidData: ExperienceMutation = {
				company_name: '', // Invalid: empty string
				job_title: 'Engineer',
				country: 'US', // Invalid: should be 3-letter code
				current: false,
				employment_type: 'flt'
			}

			mockApi.post.mockResolvedValue(mockCreatedExperience)
			vi.mocked(handleErrors).mockImplementation(() => {
				throw new Error('Handled validation error')
			})

			// The schema validation should catch this before API call
			await expect(addExperienceToDB(invalidData)).rejects.toThrow('Handled validation error')
		})

		it('should handle API errors', async () => {
			const error = new Error('API Error')
			mockApi.post.mockRejectedValue(error)
			mockHandleErrors.mockImplementation(() => {
				throw new Error('Failed to add experience: API Error')
			})

			await expect(addExperienceToDB(mockExperienceData)).rejects.toThrow('Failed to add experience: API Error')
			expect(mockHandleErrors).toHaveBeenCalledWith(error, 'add experience')
		})

		it('should handle current job (no end date)', async () => {
			const currentJobData: ExperienceMutation = {
				...mockExperienceData,
				current: true,
				finished_at_month: null,
				finished_at_year: null
			}

			const currentJobResponse: Experience = {
				...mockCreatedExperience,
				current: true,
				finished_at_month: null,
				finished_at_year: null
			}

			mockApi.post.mockResolvedValue(currentJobResponse)

			const result = await addExperienceToDB(currentJobData)

			expect(result.current).toBe(true)
			expect(result.finished_at_month).toBeNull()
			expect(result.finished_at_year).toBeNull()
		})

		it('should handle different employment types', async () => {
			const contractData: ExperienceMutation = {
				...mockExperienceData,
				employment_type: 'con'
			}

			const contractResponse: Experience = {
				...mockCreatedExperience,
				employment_type: 'con'
			}

			mockApi.post.mockResolvedValue(contractResponse)

			const result = await addExperienceToDB(contractData)

			expect(result.employment_type).toBe('con')
		})

		it('should handle optional fields', async () => {
			const minimalData: ExperienceMutation = {
				company_name: 'Startup Inc',
				job_title: 'Developer',
				country: 'CAN',
				employment_type: 'flt',
				current: true,
				city: null,
				description: null,
				started_from_month: null,
				started_from_year: null,
				finished_at_month: null,
				finished_at_year: null
			}

			const minimalResponse: Experience = {
				...mockCreatedExperience,
				company_name: 'Startup Inc',
				job_title: 'Developer',
				country: {
					code: 'CAN',
					name: 'Canada'
				},
				city: null,
				description: null,
				current: true,
				started_from_month: null,
				started_from_year: null,
				finished_at_month: null,
				finished_at_year: null
			}

			mockApi.post.mockResolvedValue(minimalResponse)

			const result = await addExperienceToDB(minimalData)

			expect(result.city).toBeNull()
			expect(result.description).toBeNull()
		})
	})

	describe('getExperiencesFromDB', () => {
		const mockExperiences: Experience[] = [
			{
				id: '123e4567-e89b-12d3-a456-426614174000',
				user: 'user_123',
				resume_section: '123e4567-e89b-12d3-a456-426614174001',
				company_name: 'Tech Corp',
				job_title: 'Senior Software Engineer',
				country: {
					code: 'USA',
					name: 'United States'
				},
				city: 'San Francisco',
				employment_type: 'flt',
				started_from_month: 1,
				started_from_year: 2022,
				finished_at_month: 12,
				finished_at_year: 2023,
				current: false,
				description: '<p>Led development of web applications.</p>',
				created_at: '2024-01-01T00:00:00Z',
				updated_at: '2024-01-01T00:00:00Z'
			},
			{
				id: '123e4567-e89b-12d3-a456-426614174002',
				user: 'user_123',
				resume_section: '123e4567-e89b-12d3-a456-426614174001',
				company_name: 'Startup Inc',
				job_title: 'Full Stack Developer',
				country: {
					code: 'CAN',
					name: 'Canada'
				},
				city: 'Toronto',
				employment_type: 'con',
				started_from_month: 6,
				started_from_year: 2021,
				finished_at_month: 12,
				finished_at_year: 2021,
				current: false,
				description: '<p>Built mobile applications.</p>',
				created_at: '2024-01-01T00:00:00Z',
				updated_at: '2024-01-01T00:00:00Z'
			}
		]

		it('should fetch experiences with default resumeId', async () => {
			mockApi.get.mockResolvedValue(mockExperiences)

			const result = await getExperiencesFromDB()

			expect(mockApi.get).toHaveBeenCalledWith('/resume/base/experience/')
			expect(result).toEqual(mockExperiences)
		})

		it('should fetch experiences with custom resumeId', async () => {
			mockApi.get.mockResolvedValue(mockExperiences)

			const result = await getExperiencesFromDB('custom-resume-id')

			expect(mockApi.get).toHaveBeenCalledWith('/resume/custom-resume-id/experience/')
			expect(result).toEqual(mockExperiences)
		})

		it('should return empty array when no experiences found', async () => {
			mockApi.get.mockResolvedValue([])

			const result = await getExperiencesFromDB()

			expect(result).toEqual([])
			expect(Array.isArray(result)).toBe(true)
		})

		it('should validate response data with schema', async () => {
			mockApi.get.mockResolvedValue(mockExperiences)

			const result = await getExperiencesFromDB()

			expect(result).toHaveLength(2)
			expect(result[0]).toMatchObject({
				id: expect.any(String),
				company_name: expect.any(String),
				job_title: expect.any(String),
				country: expect.objectContaining({
					code: expect.any(String),
					name: expect.any(String)
				}),
				employment_type: expect.any(String),
				current: expect.any(Boolean)
			})
		})

		it('should handle API errors', async () => {
			const error = new Error('API Error')
			mockApi.get.mockRejectedValue(error)
			mockHandleErrors.mockImplementation(() => {
				throw new Error('Failed to fetch experiences: API Error')
			})

			await expect(getExperiencesFromDB()).rejects.toThrow('Failed to fetch experiences: API Error')
			expect(mockHandleErrors).toHaveBeenCalledWith(error, 'fetch experiences')
		})
	})

	describe('updateExperienceInDB', () => {
		const mockUpdatedExperience: Experience = {
			id: '123e4567-e89b-12d3-a456-426614174000',
			user: 'user_123',
			resume_section: '123e4567-e89b-12d3-a456-426614174001',
			company_name: 'Updated Tech Corp',
			job_title: 'Lead Software Engineer',
			country: {
				code: 'USA',
				name: 'United States'
			},
			city: 'Seattle',
			employment_type: 'flt',
			started_from_month: 1,
			started_from_year: 2022,
			finished_at_month: null,
			finished_at_year: null,
			current: true,
			description: '<p>Updated description with new responsibilities.</p>',
			created_at: '2024-01-01T00:00:00Z',
			updated_at: '2024-01-02T00:00:00Z'
		}

		it('should update experience with partial data', async () => {
			const updateData: Partial<ExperienceMutation> = {
				job_title: 'Lead Software Engineer',
				city: 'Seattle',
				current: true
			}

			mockApi.patch.mockResolvedValue(mockUpdatedExperience)

			const result = await updateExperienceInDB('experience-id', updateData)

			expect(mockApi.patch).toHaveBeenCalledWith('/resume/base/experience/experience-id/', updateData)
			expect(result).toEqual(mockUpdatedExperience)
		})

		it('should update experience with custom resumeId', async () => {
			const updateData: Partial<ExperienceMutation> = {
				company_name: 'Updated Tech Corp'
			}

			mockApi.patch.mockResolvedValue(mockUpdatedExperience)

			const result = await updateExperienceInDB('experience-id', updateData, 'custom-resume-id')

			expect(mockApi.patch).toHaveBeenCalledWith('/resume/custom-resume-id/experience/experience-id/', updateData)
			expect(result).toEqual(mockUpdatedExperience)
		})

		it('should update employment type', async () => {
			const updateData: Partial<ExperienceMutation> = {
				employment_type: 'prt'
			}

			const partTimeResponse: Experience = {
				...mockUpdatedExperience,
				employment_type: 'prt'
			}

			mockApi.patch.mockResolvedValue(partTimeResponse)

			const result = await updateExperienceInDB('experience-id', updateData)

			expect(result.employment_type).toBe('prt')
		})

		it('should update date fields', async () => {
			const updateData: Partial<ExperienceMutation> = {
				started_from_month: '6',
				started_from_year: '2023',
				finished_at_month: '12',
				finished_at_year: '2023',
				current: false
			}

			const dateUpdatedResponse: Experience = {
				...mockUpdatedExperience,
				started_from_month: 6,
				started_from_year: 2023,
				finished_at_month: 12,
				finished_at_year: 2023,
				current: false
			}

			mockApi.patch.mockResolvedValue(dateUpdatedResponse)

			const result = await updateExperienceInDB('experience-id', updateData)

			expect(result.started_from_month).toBe(6)
			expect(result.started_from_year).toBe(2023)
			expect(result.current).toBe(false)
		})

		it('should clear end dates when setting current to true', async () => {
			const updateData: Partial<ExperienceMutation> = {
				current: true,
				finished_at_month: null,
				finished_at_year: null
			}

			const currentJobResponse: Experience = {
				...mockUpdatedExperience,
				current: true,
				finished_at_month: null,
				finished_at_year: null
			}

			mockApi.patch.mockResolvedValue(currentJobResponse)

			const result = await updateExperienceInDB('experience-id', updateData)

			expect(result.current).toBe(true)
			expect(result.finished_at_month).toBeNull()
			expect(result.finished_at_year).toBeNull()
		})

		it('should update description with rich text', async () => {
			const updateData: Partial<ExperienceMutation> = {
				description: '<p>New description with <strong>bold</strong> text and <ul><li>bullet points</li></ul></p>'
			}

			const richTextResponse: Experience = {
				...mockUpdatedExperience,
				description: '<p>New description with <strong>bold</strong> text and <ul><li>bullet points</li></ul></p>'
			}

			mockApi.patch.mockResolvedValue(richTextResponse)

			const result = await updateExperienceInDB('experience-id', updateData)

			expect(result.description).toContain('<strong>bold</strong>')
			expect(result.description).toContain('<ul><li>bullet points</li></ul>')
		})

		it('should handle API errors', async () => {
			const updateData: Partial<ExperienceMutation> = {
				job_title: 'Updated Title'
			}

			const error = new Error('API Error')
			mockApi.patch.mockRejectedValue(error)
			mockHandleErrors.mockImplementation(() => {
				throw new Error('Failed to update experience: API Error')
			})

			await expect(updateExperienceInDB('experience-id', updateData)).rejects.toThrow('Failed to update experience: API Error')
			expect(mockHandleErrors).toHaveBeenCalledWith(error, 'update experience')
		})

		it('should validate response data with schema', async () => {
			const updateData: Partial<ExperienceMutation> = {
				job_title: 'Lead Engineer'
			}

			mockApi.patch.mockResolvedValue(mockUpdatedExperience)

			const result = await updateExperienceInDB('experience-id', updateData)

			expect(result).toMatchObject({
				id: expect.any(String),
				company_name: expect.any(String),
				job_title: expect.any(String),
				country: expect.objectContaining({
					code: expect.any(String),
					name: expect.any(String)
				}),
				employment_type: expect.any(String),
				current: expect.any(Boolean),
				created_at: expect.any(String),
				updated_at: expect.any(String)
			})
		})
	})

	describe('deleteExperienceFromDB', () => {
		it('should delete experience with default resumeId', async () => {
			mockApi.delete.mockResolvedValue(undefined)

			await deleteExperienceFromDB('experience-id')

			expect(mockApi.delete).toHaveBeenCalledWith('/resume/base/experience/experience-id/')
		})

		it('should delete experience with custom resumeId', async () => {
			mockApi.delete.mockResolvedValue(undefined)

			await deleteExperienceFromDB('experience-id', 'custom-resume-id')

			expect(mockApi.delete).toHaveBeenCalledWith('/resume/custom-resume-id/experience/experience-id/')
		})

		it('should handle API errors', async () => {
			const error = new Error('API Error')
			mockApi.delete.mockRejectedValue(error)
			mockHandleErrors.mockImplementation(() => {
				throw new Error('Failed to delete experience: API Error')
			})

			await expect(deleteExperienceFromDB('experience-id')).rejects.toThrow('Failed to delete experience: API Error')
			expect(mockHandleErrors).toHaveBeenCalledWith(error, 'delete experience')
		})

		it('should handle 404 errors gracefully', async () => {
			const notFoundError = new Error('Experience not found')
			mockApi.delete.mockRejectedValue(notFoundError)
			mockHandleErrors.mockImplementation(() => {
				throw new Error('Failed to delete experience: Experience not found')
			})

			await expect(deleteExperienceFromDB('non-existent-id')).rejects.toThrow('Failed to delete experience: Experience not found')
			expect(mockHandleErrors).toHaveBeenCalledWith(notFoundError, 'delete experience')
		})

		it('should not return any value on successful deletion', async () => {
			mockApi.delete.mockResolvedValue(undefined)

			const result = await deleteExperienceFromDB('experience-id')

			expect(result).toBeUndefined()
		})
	})
})
