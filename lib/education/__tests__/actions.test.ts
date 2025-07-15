import {beforeEach, describe, expect, it, vi} from 'vitest'
import {addEducationToDB, deleteEducationFromDB, getEducationsFromDB, updateEducationInDB} from '../actions'
import {api} from '@/lib/config/api-client'
import {handleErrors} from '@/lib/misc/error-handler'
import {Education, EducationMutation} from '../types'

// Mock dependencies
vi.mock('@/lib/config/api-client', () => ({
	api: {
		post: vi.fn(),
		patch: vi.fn(),
		delete: vi.fn(),
		get: vi.fn()
	}
}))

vi.mock('@/lib/misc/error-handler', () => ({
	handleErrors: vi.fn().mockImplementation(() => {
		throw new Error('Mocked error')
	})
}))

// Mock the schema validation to avoid issues
vi.mock('@/lib/education/types', () => ({
	EducationSchema: {
		parse: vi.fn((data) => data)
	},
	EducationMutationSchema: {
		parse: vi.fn((data) => data)
	}
}))

// Mock Zod array parsing
vi.mock('zod', () => ({
	z: {
		array: vi.fn(() => ({
			parse: vi.fn((data) => data)
		}))
	}
}))

describe('education actions', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	describe('addEducationToDB', () => {
		it('should successfully add education to database', async () => {
			const mockEducationMutation: EducationMutation = {
				institution_name: 'Harvard University',
				field_of_study: 'Computer Science',
				degree: 'Bachelor of Science',
				country: 'USA',
				started_from_month: '9',
				started_from_year: '2018',
				finished_at_month: '5',
				finished_at_year: '2022',
				current: false,
				description: 'Studied computer science fundamentals'
			}

			const mockEducationResponse: Education = {
				id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
				user: 'user-123',
				resume_section: 'b2c3d4e5-f6g7-8901-bcde-f12345678901',
				institution_name: 'Harvard University',
				field_of_study: 'Computer Science',
				degree: 'Bachelor of Science',
				country: {
					code: 'USA',
					name: 'United States'
				},
				started_from_month: 9,
				started_from_year: 2018,
				finished_at_month: 5,
				finished_at_year: 2022,
				current: false,
				description: 'Studied computer science fundamentals',
				created_at: '2023-01-01T00:00:00Z',
				updated_at: '2023-01-01T00:00:00Z'
			}

			vi.mocked(api.post).mockResolvedValue(mockEducationResponse)

			const result = await addEducationToDB(mockEducationMutation)

			expect(api.post).toHaveBeenCalledWith('/resume/base/education/', mockEducationMutation)
			expect(result).toEqual(mockEducationResponse)
		})

		it('should handle validation errors', async () => {
			const invalidEducation: EducationMutation = {
				institution_name: 'Harvard University',
				field_of_study: 'Computer Science',
				country: 'INVALID', // Invalid country code
				started_from_month: '15', // Invalid month
				started_from_year: '1900', // Invalid year
				current: false
			}

			vi.mocked(api.post).mockRejectedValue(new Error('Validation failed'))
			vi.mocked(handleErrors).mockImplementation(() => {
				throw new Error('Handled validation error')
			})

			await expect(addEducationToDB(invalidEducation)).rejects.toThrow('Handled validation error')
		})

		it('should handle API errors through error handler', async () => {
			const mockEducationMutation: EducationMutation = {
				institution_name: 'Harvard University',
				field_of_study: 'Computer Science',
				country: 'USA',
				started_from_month: '9',
				started_from_year: '2018',
				current: false
			}

			const apiError = new Error('API Error')
			vi.mocked(api.post).mockRejectedValue(apiError)
			vi.mocked(handleErrors).mockImplementation(() => {
				throw new Error('Handled API Error')
			})

			await expect(addEducationToDB(mockEducationMutation)).rejects.toThrow('Handled API Error')
		})

		it('should handle current education (no graduation date)', async () => {
			const currentEducation: EducationMutation = {
				institution_name: 'MIT',
				field_of_study: 'Artificial Intelligence',
				degree: 'Master of Science',
				country: 'USA',
				started_from_month: '9',
				started_from_year: '2022',
				current: true,
				description: 'Currently studying AI'
			}

			const mockCurrentEducationResponse: Education = {
				id: 'c3d4e5f6-g7h8-9012-cdef-g23456789012',
				user: 'user-123',
				resume_section: 'b2c3d4e5-f6g7-8901-bcde-f12345678901',
				institution_name: 'MIT',
				field_of_study: 'Artificial Intelligence',
				degree: 'Master of Science',
				country: {
					code: 'USA',
					name: 'United States'
				},
				started_from_month: 9,
				started_from_year: 2022,
				finished_at_month: null,
				finished_at_year: null,
				current: true,
				description: 'Currently studying AI',
				created_at: '2023-01-01T00:00:00Z',
				updated_at: '2023-01-01T00:00:00Z'
			}

			vi.mocked(api.post).mockResolvedValue(mockCurrentEducationResponse)

			const result = await addEducationToDB(currentEducation)

			expect(result.current).toBe(true)
			expect(result.finished_at_month).toBeNull()
			expect(result.finished_at_year).toBeNull()
		})

		it('should handle education with custom resume ID', async () => {
			const educationWithCustomId: EducationMutation = {
				institution_name: 'Stanford University',
				field_of_study: 'Machine Learning',
				country: 'USA',
				started_from_month: '9',
				started_from_year: '2020',
				current: false
			}

			const mockResponse: Education = {
				id: 'd4e5f6g7-h8i9-0123-def0-h34567890123',
				user: 'user-123',
				resume_section: 'e5f6g7h8-i9j0-1234-e0f1-i45678901234',
				institution_name: 'Stanford University',
				field_of_study: 'Machine Learning',
				country: {
					code: 'USA',
					name: 'United States'
				},
				started_from_month: 9,
				started_from_year: 2020,
				finished_at_month: null,
				finished_at_year: null,
				current: false,
				created_at: '2023-01-01T00:00:00Z',
				updated_at: '2023-01-01T00:00:00Z'
			}

			vi.mocked(api.post).mockResolvedValue(mockResponse)

			const result = await addEducationToDB(educationWithCustomId)

			expect(api.post).toHaveBeenCalledWith('/resume/base/education/', educationWithCustomId)
			expect(result).toEqual(mockResponse)
		})
	})

	describe('updateEducationInDB', () => {
		it('should successfully update education in database', async () => {
			const mockUpdateData: Partial<EducationMutation> = {
				field_of_study: 'Data Science',
				degree: 'Master of Science',
				description: 'Updated description'
			}

			const mockUpdatedEducation: Education = {
				id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
				user: 'user-123',
				resume_section: 'b2c3d4e5-f6g7-8901-bcde-f12345678901',
				institution_name: 'Harvard University',
				field_of_study: 'Data Science',
				degree: 'Master of Science',
				country: {
					code: 'USA',
					name: 'United States'
				},
				started_from_month: 9,
				started_from_year: 2018,
				finished_at_month: 5,
				finished_at_year: 2022,
				current: false,
				description: 'Updated description',
				created_at: '2023-01-01T00:00:00Z',
				updated_at: '2023-01-01T00:00:00Z'
			}

			vi.mocked(api.patch).mockResolvedValue(mockUpdatedEducation)

			const result = await updateEducationInDB('a1b2c3d4-e5f6-7890-abcd-ef1234567890', mockUpdateData)

			expect(api.patch).toHaveBeenCalledWith('/resume/base/education/a1b2c3d4-e5f6-7890-abcd-ef1234567890/', mockUpdateData)
			expect(result).toEqual(mockUpdatedEducation)
		})

		it('should handle API errors through error handler', async () => {
			const mockUpdateData: Partial<EducationMutation> = {
				description: 'Updated description'
			}

			const apiError = new Error('Update failed')
			vi.mocked(api.patch).mockRejectedValue(apiError)
			vi.mocked(handleErrors).mockImplementation(() => {
				throw new Error('Handled update error')
			})

			await expect(updateEducationInDB('a1b2c3d4-e5f6-7890-abcd-ef1234567890', mockUpdateData)).rejects.toThrow('Handled update error')
		})

		it('should handle partial updates', async () => {
			const partialUpdate: Partial<EducationMutation> = {
				description: 'Updated description only'
			}

			const mockPartialResponse: Education = {
				id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
				user: 'user-123',
				resume_section: 'b2c3d4e5-f6g7-8901-bcde-f12345678901',
				institution_name: 'Harvard University',
				field_of_study: 'Computer Science',
				degree: 'Bachelor of Science',
				country: {
					code: 'USA',
					name: 'United States'
				},
				started_from_month: 9,
				started_from_year: 2018,
				finished_at_month: 5,
				finished_at_year: 2022,
				current: false,
				description: 'Updated description only',
				created_at: '2023-01-01T00:00:00Z',
				updated_at: '2023-01-01T00:00:00Z'
			}

			vi.mocked(api.patch).mockResolvedValue(mockPartialResponse)

			const result = await updateEducationInDB('a1b2c3d4-e5f6-7890-abcd-ef1234567890', partialUpdate)

			expect(result.description).toBe('Updated description only')
		})
	})

	describe('deleteEducationFromDB', () => {
		it('should successfully delete education from database', async () => {
			vi.mocked(api.delete).mockResolvedValue(undefined)

			await deleteEducationFromDB('a1b2c3d4-e5f6-7890-abcd-ef1234567890')

			expect(api.delete).toHaveBeenCalledWith('/resume/base/education/a1b2c3d4-e5f6-7890-abcd-ef1234567890/')
		})

		it('should handle API errors through error handler', async () => {
			const apiError = new Error('Delete failed')
			vi.mocked(api.delete).mockRejectedValue(apiError)
			vi.mocked(handleErrors).mockImplementation(() => {
				throw new Error('Handled delete error')
			})

			await expect(deleteEducationFromDB('a1b2c3d4-e5f6-7890-abcd-ef1234567890')).rejects.toThrow('Handled delete error')
		})

		it('should handle education deletion with custom resume ID', async () => {
			vi.mocked(api.delete).mockResolvedValue(undefined)

			await deleteEducationFromDB('a1b2c3d4-e5f6-7890-abcd-ef1234567890')

			expect(api.delete).toHaveBeenCalledWith('/resume/base/education/a1b2c3d4-e5f6-7890-abcd-ef1234567890/')
		})
	})

	describe('getEducationsFromDB', () => {
		it('should successfully retrieve educations from database', async () => {
			const mockEducations: Education[] = [
				{
					id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
					user: 'user-123',
					resume_section: 'b2c3d4e5-f6g7-8901-bcde-f12345678901',
					institution_name: 'Harvard University',
					field_of_study: 'Computer Science',
					degree: 'Bachelor of Science',
					country: {
						code: 'USA',
						name: 'United States'
					},
					started_from_month: 9,
					started_from_year: 2018,
					finished_at_month: 5,
					finished_at_year: 2022,
					current: false,
					description: 'Studied computer science fundamentals',
					created_at: '2023-01-01T00:00:00Z',
					updated_at: '2023-01-01T00:00:00Z'
				},
				{
					id: 'c3d4e5f6-g7h8-9012-cdef-g23456789012',
					user: 'user-123',
					resume_section: 'b2c3d4e5-f6g7-8901-bcde-f12345678901',
					institution_name: 'MIT',
					field_of_study: 'Artificial Intelligence',
					degree: 'Master of Science',
					country: {
						code: 'USA',
						name: 'United States'
					},
					started_from_month: 9,
					started_from_year: 2022,
					finished_at_month: null,
					finished_at_year: null,
					current: true,
					description: 'Currently studying AI',
					created_at: '2023-01-01T00:00:00Z',
					updated_at: '2023-01-01T00:00:00Z'
				}
			]

			vi.mocked(api.get).mockResolvedValue(mockEducations)

			const result = await getEducationsFromDB()

			expect(api.get).toHaveBeenCalledWith('/resume/base/education/')
			expect(result).toEqual(mockEducations)
		})

		it('should handle API errors through error handler', async () => {
			const apiError = new Error('Failed to fetch educations')
			vi.mocked(api.get).mockRejectedValue(apiError)
			vi.mocked(handleErrors).mockImplementation(() => {
				throw new Error('Handled fetch error')
			})

			await expect(getEducationsFromDB()).rejects.toThrow('Handled fetch error')
		})

		it('should handle mixed current and completed educations', async () => {
			const mixedEducations: Education[] = [
				{
					id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
					user: 'user-123',
					resume_section: 'b2c3d4e5-f6g7-8901-bcde-f12345678901',
					institution_name: 'Harvard University',
					field_of_study: 'Computer Science',
					degree: 'Bachelor of Science',
					country: {
						code: 'USA',
						name: 'United States'
					},
					started_from_month: 9,
					started_from_year: 2018,
					finished_at_month: 5,
					finished_at_year: 2022,
					current: false,
					description: 'Completed degree',
					created_at: '2023-01-01T00:00:00Z',
					updated_at: '2023-01-01T00:00:00Z'
				},
				{
					id: 'c3d4e5f6-g7h8-9012-cdef-g23456789012',
					user: 'user-123',
					resume_section: 'b2c3d4e5-f6g7-8901-bcde-f12345678901',
					institution_name: 'MIT',
					field_of_study: 'Artificial Intelligence',
					degree: 'PhD',
					country: {
						code: 'USA',
						name: 'United States'
					},
					started_from_month: 9,
					started_from_year: 2022,
					finished_at_month: null,
					finished_at_year: null,
					current: true,
					description: 'Currently pursuing PhD',
					created_at: '2023-01-01T00:00:00Z',
					updated_at: '2023-01-01T00:00:00Z'
				}
			]

			vi.mocked(api.get).mockResolvedValue(mixedEducations)

			const result = await getEducationsFromDB()

			expect(result).toHaveLength(2)
			expect(result[0].current).toBe(false)
			expect(result[1].current).toBe(true)
		})

		it('should handle education retrieval with custom resume ID', async () => {
			const mockEducations: Education[] = []

			vi.mocked(api.get).mockResolvedValue(mockEducations)

			const result = await getEducationsFromDB()

			expect(api.get).toHaveBeenCalledWith('/resume/base/education/')
			expect(result).toEqual(mockEducations)
		})
	})

	describe('education actions integration', () => {
		it('should handle complete CRUD lifecycle', async () => {
			// Create
			const newEducation: EducationMutation = {
				institution_name: 'Stanford University',
				field_of_study: 'Machine Learning',
				country: 'USA',
				started_from_month: '9',
				started_from_year: '2020',
				current: false,
				description: 'Studying ML fundamentals'
			}

			const createdEducation: Education = {
				id: 'd4e5f6g7-h8i9-0123-def0-h34567890123',
				user: 'user-123',
				resume_section: 'e5f6g7h8-i9j0-1234-e0f1-i45678901234',
				institution_name: 'Stanford University',
				field_of_study: 'Machine Learning',
				country: {
					code: 'USA',
					name: 'United States'
				},
				started_from_month: 9,
				started_from_year: 2020,
				finished_at_month: null,
				finished_at_year: null,
				current: false,
				description: 'Studying ML fundamentals',
				created_at: '2023-01-01T00:00:00Z',
				updated_at: '2023-01-01T00:00:00Z'
			}

			vi.mocked(api.post).mockResolvedValue(createdEducation)
			const created = await addEducationToDB(newEducation)
			expect(created.id).toBe('d4e5f6g7-h8i9-0123-def0-h34567890123')

			// Update
			const updateData: Partial<EducationMutation> = {
				description: 'Added project details'
			}

			const updatedEducation: Education = {
				...createdEducation,
				description: 'Added project details'
			}

			vi.mocked(api.patch).mockResolvedValue(updatedEducation)
			const updated = await updateEducationInDB('d4e5f6g7-h8i9-0123-def0-h34567890123', updateData)
			expect(updated.description).toBe('Added project details')

			// Delete
			vi.mocked(api.delete).mockResolvedValue(undefined)
			await deleteEducationFromDB('d4e5f6g7-h8i9-0123-def0-h34567890123')
			expect(api.delete).toHaveBeenCalledWith('/resume/base/education/d4e5f6g7-h8i9-0123-def0-h34567890123/')
		})
	})
})
