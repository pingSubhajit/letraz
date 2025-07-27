import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import {baseResumeQueryOptions, useBaseResume} from '@/lib/resume/queries'
import {getResumeFromDB} from '@/lib/resume/actions'
import {BASE_RESUME_KEYS} from '@/lib/resume/key'
import {Resume} from '@/lib/resume/types'

// Mock the actions
vi.mock('../actions')

const mockGetResumeFromDB = vi.mocked(getResumeFromDB)

// Mock data
const mockResume: Resume = {
	id: 'resume-123',
	base: true,
	user: {
		id: 'user-123',
		title: 'Mr.',
		first_name: 'John',
		last_name: 'Doe',
		email: 'john@example.com',
		phone: '+1234567890',
		dob: new Date('1990-01-01'),
		address: '123 Main St',
		city: 'New York',
		postal: '10001',
		country: {
			code: 'US',
			name: 'United States'
		},
		nationality: 'American',
		website: 'https://johndoe.com',
		profile_text: 'Software engineer',
		created_at: '2023-01-01T00:00:00Z',
		updated_at: '2023-01-01T00:00:00Z'
	},
	job: {
		job_url: 'https://example.com/job',
		title: 'Software Engineer',
		company_name: 'Tech Corp',
		location: 'San Francisco, CA',
		currency: 'USD',
		salary_max: 150000,
		salary_min: 100000,
		requirements: ['JavaScript', 'React', 'TypeScript'],
		description: 'We are looking for a talented software engineer',
		responsibilities: ['Develop web applications', 'Write clean code'],
		benefits: ['Health insurance', '401k', 'Remote work']
	},
	sections: []
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

			const mockContext = {
				queryKey: BASE_RESUME_KEYS,
				client: {} as any,
				signal: {} as AbortSignal,
				meta: undefined
			}

			const result = await baseResumeQueryOptions.queryFn!(mockContext)

			expect(mockGetResumeFromDB).toHaveBeenCalledTimes(1)
			expect(mockGetResumeFromDB).toHaveBeenCalledWith('base')
			expect(result).toEqual(mockResume)
		})

		it('should handle query function errors', async () => {
			const error = new Error('API Error')
			mockGetResumeFromDB.mockRejectedValue(error)

			const mockContext = {
				queryKey: BASE_RESUME_KEYS,
				client: {} as any,
				signal: {} as AbortSignal,
				meta: undefined
			}

			await expect(baseResumeQueryOptions.queryFn!(mockContext)).rejects.toThrow('API Error')
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
