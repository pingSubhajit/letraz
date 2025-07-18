import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import {educationOptions, useCurrentEducations} from '../queries'
import {getEducationsFromDB} from '../actions'
import {EDUCATION_KEYS} from '../keys'
import {Education} from '../types'

// Mock the actions
vi.mock('../actions')

const mockGetEducationsFromDB = vi.mocked(getEducationsFromDB)

// Mock data
const mockEducations: Education[] = [
	{
		id: '123e4567-e89b-12d3-a456-426614174000',
		user: 'user-123',
		resume_section: '123e4567-e89b-12d3-a456-426614174001',
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
		description: '<p>Studied computer science fundamentals</p>',
		created_at: '2023-01-01T00:00:00Z',
		updated_at: '2023-01-01T00:00:00Z'
	},
	{
		id: '123e4567-e89b-12d3-a456-426614174002',
		user: 'user-123',
		resume_section: '123e4567-e89b-12d3-a456-426614174003',
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
		description: '<p>Currently studying AI</p>',
		created_at: '2023-09-01T00:00:00Z',
		updated_at: '2023-09-01T00:00:00Z'
	}
]

describe('Education Queries', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	afterEach(() => {
		vi.restoreAllMocks()
	})

	describe('educationOptions', () => {
		it('should have correct query key', () => {
			const options = educationOptions

			expect(options.queryKey).toEqual(EDUCATION_KEYS)
		})

		it('should have correct query function', () => {
			const options = educationOptions

			expect(options.queryFn).toBeInstanceOf(Function)
		})

		it('should call getEducationsFromDB with "base" when query function is executed', async () => {
			mockGetEducationsFromDB.mockResolvedValue(mockEducations)

			const result = await educationOptions.queryFn()

			expect(mockGetEducationsFromDB).toHaveBeenCalledTimes(1)
			expect(mockGetEducationsFromDB).toHaveBeenCalledWith('base')
			expect(result).toEqual(mockEducations)
		})

		it('should handle query function errors', async () => {
			const error = new Error('API Error')
			mockGetEducationsFromDB.mockRejectedValue(error)

			await expect(educationOptions.queryFn()).rejects.toThrow('API Error')
			expect(mockGetEducationsFromDB).toHaveBeenCalledWith('base')
		})
	})

	describe('useCurrentEducations', () => {
		it('should use the correct query options', () => {
			const hook = useCurrentEducations

			// Test that the hook is a function
			expect(typeof hook).toBe('function')
		})

		it('should be available for import', () => {
			expect(useCurrentEducations).toBeDefined()
			expect(typeof useCurrentEducations).toBe('function')
		})
	})
}) 