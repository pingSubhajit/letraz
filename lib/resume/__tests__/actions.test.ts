import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import {getResumeFromDB, rearrangeResumeSections} from '@/lib/resume/actions'
import {api} from '@/lib/config/api-client'
import {handleErrors} from '@/lib/misc/error-handler'
import {Resume} from '@/lib/resume/types'

// Mock dependencies
vi.mock('@/lib/config/api-client')
vi.mock('@/lib/misc/error-handler')

const mockApi = vi.mocked(api)
const mockHandleErrors = vi.mocked(handleErrors)

describe('Resume Actions', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	afterEach(() => {
		vi.resetAllMocks()
	})

	describe('getResumeFromDB', () => {
		const mockResume: Resume = {
			id: 'resume_123',
			base: true,
			processing: false,
			user: {
				id: 'user_123',
				title: null,
				first_name: 'John',
				last_name: 'Doe',
				email: 'john.doe@example.com',
				phone: '+1-555-0123',
				dob: null,
				nationality: null,
				address: null,
				city: null,
				postal: null,
				country: null,
				website: 'https://johndoe.dev',
				profile_text: null,
				created_at: '2024-01-01T00:00:00Z',
				updated_at: '2024-01-01T00:00:00Z'
			},
			job: {
				job_url: 'https://example.com/job/1',
				title: 'Senior Software Engineer',
				company_name: 'Tech Corp',
				location: 'San Francisco, CA',
				requirements: 'React, TypeScript, Node.js',
				description: 'We are looking for a senior software engineer.',
				responsibilities: 'Lead development projects, Mentor junior developers',
				benefits: 'Health insurance, Remote work, 401k matching',
				processing: false
			},
			sections: [
				{
					id: '123e4567-e89b-12d3-a456-426614174001',
					resume: 'resume_123',
					index: 0,
					type: 'Experience',
					data: {
						id: '123e4567-e89b-12d3-a456-426614174010',
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
						description: 'Led development of web applications.',
						created_at: '2024-01-01T00:00:00Z',
						updated_at: '2024-01-01T00:00:00Z'
					}
				},
				{
					id: '123e4567-e89b-12d3-a456-426614174002',
					resume: 'resume_123',
					index: 1,
					type: 'Education',
					data: {
						id: '123e4567-e89b-12d3-a456-426614174020',
						user: 'user_123',
						resume_section: '123e4567-e89b-12d3-a456-426614174002',
						institution_name: 'University of Technology',
						degree: 'Bachelor of Science',
						field_of_study: 'Computer Science',
						country: {
							code: 'USA',
							name: 'United States'
						},
						started_from_month: 9,
						started_from_year: 2018,
						finished_at_month: 5,
						finished_at_year: 2022,
						current: false,
						description: 'Magna Cum Laude, Dean\'s List',
						created_at: '2024-01-01T00:00:00Z',
						updated_at: '2024-01-01T00:00:00Z'
					}
				}
			]
		}

		it('should fetch resume with default resumeId', async () => {
			mockApi.get.mockResolvedValue(mockResume)

			const result = await getResumeFromDB()

			expect(mockApi.get).toHaveBeenCalledWith('/resume/base/')
			expect(result).toEqual(mockResume)
		})

		it('should fetch resume with custom resumeId', async () => {
			mockApi.get.mockResolvedValue(mockResume)

			const result = await getResumeFromDB('custom-resume-123')

			expect(mockApi.get).toHaveBeenCalledWith('/resume/custom-resume-123/')
			expect(result).toEqual(mockResume)
		})

		it('should handle base resumeId explicitly', async () => {
			mockApi.get.mockResolvedValue(mockResume)

			const result = await getResumeFromDB('base')

			expect(mockApi.get).toHaveBeenCalledWith('/resume/base/')
			expect(result).toEqual(mockResume)
		})

		it('should validate response data with schema', async () => {
			mockApi.get.mockResolvedValue(mockResume)

			const result = await getResumeFromDB()

			expect(result).toMatchObject({
				id: expect.any(String),
				base: expect.any(Boolean),
				user: expect.objectContaining({
					id: expect.any(String),
					first_name: expect.any(String),
					last_name: expect.any(String),
					email: expect.any(String)
				}),
				job: expect.objectContaining({
					job_url: expect.any(String),
					title: expect.any(String),
					company_name: expect.any(String)
				}),
				sections: expect.any(Array)
			})
		})

		it('should handle API errors', async () => {
			const error = new Error('API Error')
			mockApi.get.mockRejectedValue(error)
			vi.mocked(handleErrors).mockImplementation(() => {
				throw new Error('Failed to fetch resume: API Error')
			})

			await expect(getResumeFromDB()).rejects.toThrow('Failed to fetch resume: API Error')
			expect(mockHandleErrors).toHaveBeenCalledWith(error, 'fetch resume')
		})

		it('should return resume with all sections', async () => {
			mockApi.get.mockResolvedValue(mockResume)

			const result = await getResumeFromDB()

			expect(result.sections).toHaveLength(2)
			expect(result.sections[0].type).toBe('Experience')
			expect(result.sections[1].type).toBe('Education')
		})

		it('should handle resume with no sections', async () => {
			const resumeWithNoSections: Resume = {
				...mockResume,
				sections: []
			}

			mockApi.get.mockResolvedValue(resumeWithNoSections)

			const result = await getResumeFromDB()

			expect(result.sections).toEqual([])
		})

		it('should handle resume with null job values', async () => {
			const resumeWithNullJobValues: Resume = {
				...mockResume,
				job: {
					...mockResume.job,
					requirements: null,
					responsibilities: null,
					benefits: null
				}
			}

			mockApi.get.mockResolvedValue(resumeWithNullJobValues)

			const result = await getResumeFromDB()

			expect(result.job.requirements).toBeNull()
			expect(result.job.responsibilities).toBeNull()
			expect(result.job.benefits).toBeNull()
		})
	})

	describe('rearrangeResumeSections', () => {
		const mockUpdatedResume: Resume = {
			id: 'resume_123',
			base: true,
			processing: false,
			user: {
				id: 'user_123',
				title: null,
				first_name: 'John',
				last_name: 'Doe',
				email: 'john.doe@example.com',
				phone: '+1-555-0123',
				dob: null,
				nationality: null,
				address: null,
				city: null,
				postal: null,
				country: null,
				website: 'https://johndoe.dev',
				profile_text: null,
				created_at: '2024-01-01T00:00:00Z',
				updated_at: '2024-01-01T00:00:00Z'
			},
			job: {
				job_url: 'https://example.com/job/1',
				title: 'Senior Software Engineer',
				company_name: 'Tech Corp',
				location: 'San Francisco, CA',
				requirements: 'React, TypeScript, Node.js',
				description: 'We are looking for a senior software engineer.',
				responsibilities: 'Lead development projects, Mentor junior developers',
				benefits: 'Health insurance, Remote work, 401k matching',
				processing: false
			},
			sections: [
				{
					id: '123e4567-e89b-12d3-a456-426614174002',
					resume: 'resume_123',
					index: 0,
					type: 'Education',
					data: {
						id: '123e4567-e89b-12d3-a456-426614174020',
						user: 'user_123',
						resume_section: '123e4567-e89b-12d3-a456-426614174002',
						institution_name: 'University of Technology',
						degree: 'Bachelor of Science',
						field_of_study: 'Computer Science',
						country: {
							code: 'USA',
							name: 'United States'
						},
						started_from_month: 9,
						started_from_year: 2018,
						finished_at_month: 5,
						finished_at_year: 2022,
						current: false,
						description: 'Magna Cum Laude, Dean\'s List',
						created_at: '2024-01-01T00:00:00Z',
						updated_at: '2024-01-01T00:00:00Z'
					}
				},
				{
					id: '123e4567-e89b-12d3-a456-426614174001',
					resume: 'resume_123',
					index: 1,
					type: 'Experience',
					data: {
						id: '123e4567-e89b-12d3-a456-426614174010',
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
						description: 'Led development of web applications.',
						created_at: '2024-01-01T00:00:00Z',
						updated_at: '2024-01-01T00:00:00Z'
					}
				}
			]
		}

		it('should rearrange resume sections successfully', async () => {
			mockApi.put.mockResolvedValue(mockUpdatedResume)

			const sectionIds = ['123e4567-e89b-12d3-a456-426614174002', '123e4567-e89b-12d3-a456-426614174001']
			const result = await rearrangeResumeSections('resume_123', sectionIds)

			expect(mockApi.put).toHaveBeenCalledWith('/resume/resume_123/sections/rearrange/', {
				section_ids: sectionIds
			})
			expect(result).toEqual(mockUpdatedResume)
		})

		it('should handle empty section IDs array', async () => {
			mockApi.put.mockResolvedValue(mockUpdatedResume)

			const sectionIds: string[] = []
			const result = await rearrangeResumeSections('resume_123', sectionIds)

			expect(mockApi.put).toHaveBeenCalledWith('/resume/resume_123/sections/rearrange/', {
				section_ids: []
			})
			expect(result).toEqual(mockUpdatedResume)
		})

		it('should handle single section ID', async () => {
			mockApi.put.mockResolvedValue(mockUpdatedResume)

			const sectionIds = ['123e4567-e89b-12d3-a456-426614174001']
			await rearrangeResumeSections('resume_123', sectionIds)

			expect(mockApi.put).toHaveBeenCalledWith('/resume/resume_123/sections/rearrange/', {
				section_ids: ['123e4567-e89b-12d3-a456-426614174001']
			})
		})

		it('should handle multiple section IDs', async () => {
			mockApi.put.mockResolvedValue(mockUpdatedResume)

			const sectionIds = ['123e4567-e89b-12d3-a456-426614174003', '123e4567-e89b-12d3-a456-426614174001', '123e4567-e89b-12d3-a456-426614174002', '123e4567-e89b-12d3-a456-426614174004']
			await rearrangeResumeSections('resume_123', sectionIds)

			expect(mockApi.put).toHaveBeenCalledWith('/resume/resume_123/sections/rearrange/', {
				section_ids: sectionIds
			})
		})

		it('should validate response data with schema', async () => {
			mockApi.put.mockResolvedValue(mockUpdatedResume)

			const result = await rearrangeResumeSections('resume_123', ['123e4567-e89b-12d3-a456-426614174002', '123e4567-e89b-12d3-a456-426614174001'])

			expect(result).toMatchObject({
				id: expect.any(String),
				base: expect.any(Boolean),
				user: expect.objectContaining({
					id: expect.any(String),
					first_name: expect.any(String),
					last_name: expect.any(String)
				}),
				job: expect.objectContaining({
					job_url: expect.any(String),
					title: expect.any(String),
					company_name: expect.any(String)
				}),
				sections: expect.any(Array)
			})
		})

		it('should handle API errors', async () => {
			const error = new Error('API Error')
			mockApi.put.mockRejectedValue(error)
			vi.mocked(handleErrors).mockImplementation(() => {
				throw new Error('Failed to rearrange resume sections: API Error')
			})

			await expect(rearrangeResumeSections('resume_123', ['123e4567-e89b-12d3-a456-426614174001']))
				.rejects.toThrow('Failed to rearrange resume sections: API Error')
			expect(mockHandleErrors).toHaveBeenCalledWith(error, 'rearrange resume sections')
		})

		it('should preserve section order in response', async () => {
			mockApi.put.mockResolvedValue(mockUpdatedResume)

			const result = await rearrangeResumeSections('resume_123', ['123e4567-e89b-12d3-a456-426614174002', '123e4567-e89b-12d3-a456-426614174001'])

			// Verify that the returned resume has sections in the new order
			expect(result.sections[0].id).toBe('123e4567-e89b-12d3-a456-426614174002')
			expect(result.sections[0].index).toBe(0)
			expect(result.sections[1].id).toBe('123e4567-e89b-12d3-a456-426614174001')
			expect(result.sections[1].index).toBe(1)
		})

		it('should handle different resume IDs', async () => {
			mockApi.put.mockResolvedValue(mockUpdatedResume)

			await rearrangeResumeSections('different-resume-456', ['123e4567-e89b-12d3-a456-426614174001'])

			expect(mockApi.put).toHaveBeenCalledWith('/resume/different-resume-456/sections/rearrange/', {
				section_ids: ['123e4567-e89b-12d3-a456-426614174001']
			})
		})

		it('should handle 404 errors gracefully', async () => {
			const notFoundError = new Error('Resume not found')
			mockApi.put.mockRejectedValue(notFoundError)
			vi.mocked(handleErrors).mockImplementation(() => {
				throw new Error('Failed to rearrange resume sections: Resume not found')
			})

			await expect(rearrangeResumeSections('non-existent-resume', ['123e4567-e89b-12d3-a456-426614174001']))
				.rejects.toThrow('Failed to rearrange resume sections: Resume not found')
			expect(mockHandleErrors).toHaveBeenCalledWith(notFoundError, 'rearrange resume sections')
		})

		it('should handle validation errors', async () => {
			const validationError = new Error('Invalid section IDs')
			mockApi.put.mockRejectedValue(validationError)
			vi.mocked(handleErrors).mockImplementation(() => {
				throw new Error('Failed to rearrange resume sections: Invalid section IDs')
			})

			await expect(rearrangeResumeSections('resume_123', ['invalid-section']))
				.rejects.toThrow('Failed to rearrange resume sections: Invalid section IDs')
			expect(mockHandleErrors).toHaveBeenCalledWith(validationError, 'rearrange resume sections')
		})
	})
})
