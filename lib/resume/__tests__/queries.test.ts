import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import {baseResumeQueryOptions, useBaseResume} from '../queries'
import {getResumeFromDB} from '../actions'
import {BASE_RESUME_KEYS} from '../key'
import {Resume} from '../types'

// Mock the actions
vi.mock('../actions')

const mockGetResumeFromDB = vi.mocked(getResumeFromDB)

// Mock data
const mockResume: Resume = {
	id: '123e4567-e89b-12d3-a456-426614174000',
	base: true,
	user: {
		id: 'user-123',
		first_name: 'John',
		last_name: 'Doe',
		email: 'john.doe@example.com',
		phone: '+1234567890',
		country: {
			code: 'USA',
			name: 'United States'
		},
		city: 'San Francisco',
		linkedin_url: 'https://linkedin.com/in/johndoe',
		github_url: 'https://github.com/johndoe',
		website_url: 'https://johndoe.com',
		created_at: '2023-01-01T00:00:00Z',
		updated_at: '2023-01-01T00:00:00Z'
	},
	job: {
		id: 'job-123',
		title: 'Software Engineer',
		company: 'Tech Corp',
		description: 'We are looking for a skilled software engineer',
		requirements: ['React', 'Node.js', 'TypeScript'],
		created_at: '2023-01-01T00:00:00Z',
		updated_at: '2023-01-01T00:00:00Z'
	},
	sections: [
		{
			id: 'section-1',
			resume: '123e4567-e89b-12d3-a456-426614174000',
			index: 0,
			type: 'Experience',
			data: {
				id: 'exp-1',
				user: 'user-123',
				resume_section: 'section-1',
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
			}
		},
		{
			id: 'section-2',
			resume: '123e4567-e89b-12d3-a456-426614174000',
			index: 1,
			type: 'Education',
			data: {
				id: 'edu-1',
				user: 'user-123',
				resume_section: 'section-2',
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
			}
		}
	]
}

describe('Resume Queries', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	afterEach(() => {
		vi.restoreAllMocks()
	})

	describe('baseResumeQueryOptions', () => {
		it('should have correct query key', () => {
			const options = baseResumeQueryOptions

			expect(options.queryKey).toEqual(BASE_RESUME_KEYS)
		})

		it('should have correct query function', () => {
			const options = baseResumeQueryOptions

			expect(options.queryFn).toBeInstanceOf(Function)
		})

		it('should call getResumeFromDB with "base" when query function is executed', async () => {
			mockGetResumeFromDB.mockResolvedValue(mockResume)

			const result = await baseResumeQueryOptions.queryFn()

			expect(mockGetResumeFromDB).toHaveBeenCalledTimes(1)
			expect(mockGetResumeFromDB).toHaveBeenCalledWith('base')
			expect(result).toEqual(mockResume)
		})

		it('should handle query function errors', async () => {
			const error = new Error('API Error')
			mockGetResumeFromDB.mockRejectedValue(error)

			await expect(baseResumeQueryOptions.queryFn()).rejects.toThrow('API Error')
			expect(mockGetResumeFromDB).toHaveBeenCalledWith('base')
		})
	})

	describe('useBaseResume', () => {
		it('should use the correct query options', () => {
			const hook = useBaseResume

			// Test that the hook is a function
			expect(typeof hook).toBe('function')
		})

		it('should be available for import', () => {
			expect(useBaseResume).toBeDefined()
			expect(typeof useBaseResume).toBe('function')
		})
	})
})
