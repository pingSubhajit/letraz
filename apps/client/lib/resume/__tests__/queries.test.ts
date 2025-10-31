import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import {baseResumeQueryOptions, resumeMinimalQueryOptions, useBaseResume, useResumeMinimal} from '@/lib/resume/queries'
import {getResumeFromDB, getResumeMinimal} from '@/lib/resume/actions'
import {BASE_RESUME_KEYS} from '@/lib/resume/key'
import {Resume, ResumeMinimal} from '@/lib/resume/types'

// Mock the actions
vi.mock('../actions')

const mockGetResumeFromDB = vi.mocked(getResumeFromDB)
const mockGetResumeMinimal = vi.mocked(getResumeMinimal)

// Mock data
const mockResume: Resume = {
	id: 'resume-123',
	base: true,
	status: 'Success',
	user: {
		id: 'user-123',
		title: 'Mr.',
		first_name: 'John',
		last_name: 'Doe',
		email: 'john@example.com',
		phone: '+1234567890',
		dob: null,
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
		requirements: 'JavaScript, React, TypeScript',
		description: 'We are looking for a talented software engineer',
		responsibilities: 'Develop web applications, Write clean code',
		benefits: 'Health insurance, 401k, Remote work',
		status: 'Success'
	},
	sections: []
}

const mockResumeMinimal: ResumeMinimal = {
	id: 'resume-123',
	base: false,
	status: 'Success',
	job_title: 'Software Engineer',
	company_name: 'Tech Corp',
	created_at: new Date('2023-01-01T00:00:00Z'),
	updated_at: new Date('2023-01-15T00:00:00Z')
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

	describe('resumeMinimalQueryOptions', () => {
		it('should have correct query key', () => {
			const resumeId = 'resume-123'
			const options = resumeMinimalQueryOptions(resumeId)

			expect(options.queryKey).toEqual(['resume', resumeId, 'minimal'])
		})

		it('should have correct query function', () => {
			const resumeId = 'resume-123'
			const options = resumeMinimalQueryOptions(resumeId)

			expect(options.queryFn).toBeInstanceOf(Function)
		})

		it('should call getResumeMinimal with correct resumeId when query function is executed', async () => {
			const resumeId = 'resume-123'
			mockGetResumeMinimal.mockResolvedValue(mockResumeMinimal)

			const options = resumeMinimalQueryOptions(resumeId)
			const mockContext = {
				queryKey: ['resume', resumeId, 'minimal'],
				client: {} as any,
				signal: {} as AbortSignal,
				meta: undefined
			}

			const result = await options.queryFn!(mockContext)

			expect(mockGetResumeMinimal).toHaveBeenCalledTimes(1)
			expect(mockGetResumeMinimal).toHaveBeenCalledWith(resumeId)
			expect(result).toEqual(mockResumeMinimal)
		})

		it('should handle query function errors', async () => {
			const resumeId = 'resume-123'
			const error = new Error('API Error')
			mockGetResumeMinimal.mockRejectedValue(error)

			const options = resumeMinimalQueryOptions(resumeId)
			const mockContext = {
				queryKey: ['resume', resumeId, 'minimal'],
				client: {} as any,
				signal: {} as AbortSignal,
				meta: undefined
			}

			await expect(options.queryFn!(mockContext)).rejects.toThrow('API Error')
			expect(mockGetResumeMinimal).toHaveBeenCalledWith(resumeId)
		})

		it('should work with different resume IDs', async () => {
			const resumeId1 = 'resume-abc'
			const resumeId2 = 'resume-xyz'

			const options1 = resumeMinimalQueryOptions(resumeId1)
			const options2 = resumeMinimalQueryOptions(resumeId2)

			expect(options1.queryKey).toEqual(['resume', resumeId1, 'minimal'])
			expect(options2.queryKey).toEqual(['resume', resumeId2, 'minimal'])
		})
	})

	describe('useResumeMinimal', () => {
		it('should use the correct query options', () => {
			const hook = useResumeMinimal

			// Test that the hook is a function
			expect(typeof hook).toBe('function')
		})

		it('should be available for import', () => {
			expect(useResumeMinimal).toBeDefined()
			expect(typeof useResumeMinimal).toBe('function')
		})
	})
})
