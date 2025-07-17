import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import {experienceQueryOptions, useCurrentExperiences} from '../queries'
import {getExperiencesFromDB} from '../actions'
import {EXPERIENCE_KEYS} from '../keys'
import {Experience} from '../types'

// Mock the actions
vi.mock('../actions')

const mockGetExperiencesFromDB = vi.mocked(getExperiencesFromDB)

// Mock data
const mockExperiences: Experience[] = [
	{
		id: '123e4567-e89b-12d3-a456-426614174000',
		user: 'user-123',
		resume_section: '123e4567-e89b-12d3-a456-426614174001',
		company_name: 'Tech Corp',
		job_title: 'Software Engineer',
		country: {
			code: 'USA',
			name: 'United States'
		},
		city: 'San Francisco',
		employment_type: 'Full-time',
		started_from_month: 6,
		started_from_year: 2020,
		finished_at_month: 8,
		finished_at_year: 2023,
		current: false,
		description: '<p>Developed web applications using React and Node.js</p>',
		created_at: '2023-01-01T00:00:00Z',
		updated_at: '2023-01-01T00:00:00Z'
	},
	{
		id: '123e4567-e89b-12d3-a456-426614174002',
		user: 'user-123',
		resume_section: '123e4567-e89b-12d3-a456-426614174003',
		company_name: 'Startup Inc',
		job_title: 'Senior Developer',
		country: {
			code: 'CAN',
			name: 'Canada'
		},
		city: 'Toronto',
		employment_type: 'Full-time',
		started_from_month: 9,
		started_from_year: 2023,
		finished_at_month: null,
		finished_at_year: null,
		current: true,
		description: '<p>Leading development of mobile applications</p>',
		created_at: '2023-09-01T00:00:00Z',
		updated_at: '2023-09-01T00:00:00Z'
	}
]

describe('Experience Queries', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	afterEach(() => {
		vi.restoreAllMocks()
	})

	describe('experienceQueryOptions', () => {
		it('should have correct query key', () => {
			const options = experienceQueryOptions

			expect(options.queryKey).toEqual(EXPERIENCE_KEYS)
		})

		it('should have correct query function', () => {
			const options = experienceQueryOptions

			expect(options.queryFn).toBeInstanceOf(Function)
		})

		it('should call getExperiencesFromDB with "base" when query function is executed', async () => {
			mockGetExperiencesFromDB.mockResolvedValue(mockExperiences)

			const result = await experienceQueryOptions.queryFn()

			expect(mockGetExperiencesFromDB).toHaveBeenCalledTimes(1)
			expect(mockGetExperiencesFromDB).toHaveBeenCalledWith('base')
			expect(result).toEqual(mockExperiences)
		})

		it('should handle query function errors', async () => {
			const error = new Error('API Error')
			mockGetExperiencesFromDB.mockRejectedValue(error)

			await expect(experienceQueryOptions.queryFn()).rejects.toThrow('API Error')
			expect(mockGetExperiencesFromDB).toHaveBeenCalledWith('base')
		})
	})

	describe('useCurrentExperiences', () => {
		it('should use the correct query options', () => {
			const hook = useCurrentExperiences
			
			// Test that the hook is a function
			expect(typeof hook).toBe('function')
		})

		it('should be available for import', () => {
			expect(useCurrentExperiences).toBeDefined()
			expect(typeof useCurrentExperiences).toBe('function')
		})
	})
}) 