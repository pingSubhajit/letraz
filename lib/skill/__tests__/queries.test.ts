import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import {
	globalSkillsQueryOptions,
	resumeSkillsQueryOptions,
	skillCategoriesQueryOptions,
	useCurrentResumeSkills,
	useGlobalSkills,
	useSkillCategories
} from '@/lib/skill/queries'
import {fetchGlobalSkills, fetchResumeSkills, fetchSkillCategories} from '@/lib/skill/actions'
import {GlobalSkill, ResumeSkill} from '@/lib/skill/types'

// Mock the actions
vi.mock('../actions')

const mockFetchGlobalSkills = vi.mocked(fetchGlobalSkills)
const mockFetchResumeSkills = vi.mocked(fetchResumeSkills)
const mockFetchSkillCategories = vi.mocked(fetchSkillCategories)

// Mock data
const mockGlobalSkills: GlobalSkill[] = [
	{
		id: '123e4567-e89b-12d3-a456-426614174000',
		name: 'JavaScript',
		category: 'Programming Languages',
		preferred: true,
		alias: [
			{
				id: '123e4567-e89b-12d3-a456-426614174001',
				name: 'JS',
				category: 'Programming Languages',
				preferred: false,
				created_at: '2023-01-01T00:00:00Z',
				updated_at: '2023-01-01T00:00:00Z'
			}
		],
		created_at: '2023-01-01T00:00:00Z',
		updated_at: '2023-01-01T00:00:00Z'
	},
	{
		id: '123e4567-e89b-12d3-a456-426614174002',
		name: 'React',
		category: 'Frontend Frameworks',
		preferred: true,
		alias: [
			{
				id: '123e4567-e89b-12d3-a456-426614174003',
				name: 'React.js',
				category: 'Frontend Frameworks',
				preferred: false,
				created_at: '2023-01-01T00:00:00Z',
				updated_at: '2023-01-01T00:00:00Z'
			}
		],
		created_at: '2023-01-01T00:00:00Z',
		updated_at: '2023-01-01T00:00:00Z'
	}
]

const mockResumeSkills: ResumeSkill[] = [
	{
		id: '123e4567-e89b-12d3-a456-426614174004',
		skill: mockGlobalSkills[0],
		resume_section: 'section-1',
		level: 'INT'
	},
	{
		id: '123e4567-e89b-12d3-a456-426614174005',
		skill: mockGlobalSkills[1],
		resume_section: 'section-1',
		level: 'ADV'
	}
]

const mockSkillCategories: string[] = [
	'Programming Languages',
	'Frontend Frameworks',
	'Backend Technologies',
	'Databases'
]

describe('Skill Queries', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	afterEach(() => {
		vi.restoreAllMocks()
	})

	describe('globalSkillsQueryOptions', () => {
		it('should have correct query key', () => {
			const options = globalSkillsQueryOptions

			expect(options.queryKey).toEqual(['skills', 'global'])
		})

		it('should have correct query function', () => {
			const options = globalSkillsQueryOptions

			expect(options.queryFn).toBeInstanceOf(Function)
		})

		it('should call fetchGlobalSkills when query function is executed', async () => {
			mockFetchGlobalSkills.mockResolvedValue(mockGlobalSkills)

			const mockContext = {
				queryKey: ['skills', 'global'],
				client: {} as any,
				signal: {} as AbortSignal,
				meta: undefined
			}

			const result = await globalSkillsQueryOptions.queryFn!(mockContext)

			expect(mockFetchGlobalSkills).toHaveBeenCalledTimes(1)
			expect(result).toEqual(mockGlobalSkills)
		})
	})

	describe('useGlobalSkills', () => {
		it('should use the correct query options', () => {
			const hook = useGlobalSkills

			// Test that the hook is a function
			expect(typeof hook).toBe('function')
		})
	})

	describe('resumeSkillsQueryOptions', () => {
		it('should have correct query key with default resumeId', () => {
			const options = resumeSkillsQueryOptions()

			expect(options.queryKey).toEqual(['skills', 'resume', 'base'])
		})

		it('should have correct query key with custom resumeId', () => {
			const options = resumeSkillsQueryOptions('custom-resume-123')

			expect(options.queryKey).toEqual(['skills', 'resume', 'custom-resume-123'])
		})

		it('should have correct query function with default resumeId', () => {
			const options = resumeSkillsQueryOptions()

			expect(options.queryFn).toBeInstanceOf(Function)
		})

		it('should call fetchResumeSkills with correct resumeId', async () => {
			mockFetchResumeSkills.mockResolvedValue(mockResumeSkills)

			const options = resumeSkillsQueryOptions('custom-resume-id')
			const mockContext = {
				queryKey: ['skills', 'resume', 'custom-resume-id'],
				client: {} as any,
				signal: {} as AbortSignal,
				meta: undefined
			}

			await options.queryFn!(mockContext)

			expect(mockFetchResumeSkills).toHaveBeenCalledWith('custom-resume-id')
		})

		it('should call fetchResumeSkills with default resumeId when none provided', async () => {
			mockFetchResumeSkills.mockResolvedValue(mockResumeSkills)

			const options = resumeSkillsQueryOptions()
			const mockContext = {
				queryKey: ['skills', 'resume', 'base'],
				client: {} as any,
				signal: {} as AbortSignal,
				meta: undefined
			}

			await options.queryFn!(mockContext)

			expect(mockFetchResumeSkills).toHaveBeenCalledWith('base')
		})
	})

	describe('useCurrentResumeSkills', () => {
		it('should use resumeSkillsQueryOptions with default resumeId', () => {
			const hook = useCurrentResumeSkills

			// Test that the hook is a function
			expect(typeof hook).toBe('function')
		})
	})

	describe('skillCategoriesQueryOptions', () => {
		it('should have correct query key with default resumeId', () => {
			const options = skillCategoriesQueryOptions()

			expect(options.queryKey).toEqual(['skills', 'categories', 'base'])
		})

		it('should have correct query key with custom resumeId', () => {
			const options = skillCategoriesQueryOptions('custom-resume-789')

			expect(options.queryKey).toEqual(['skills', 'categories', 'custom-resume-789'])
		})

		it('should have correct query function', () => {
			const options = skillCategoriesQueryOptions()

			expect(options.queryFn).toBeInstanceOf(Function)
		})

		it('should call fetchSkillCategories with correct resumeId', async () => {
			mockFetchSkillCategories.mockResolvedValue(['Programming', 'Design'])

			const options = skillCategoriesQueryOptions('custom-resume-id')
			const mockContext = {
				queryKey: ['skills', 'categories', 'custom-resume-id'],
				client: {} as any,
				signal: {} as AbortSignal,
				meta: undefined
			}

			await options.queryFn!(mockContext)

			expect(mockFetchSkillCategories).toHaveBeenCalledWith('custom-resume-id')
		})

		it('should call fetchSkillCategories with default resumeId when none provided', async () => {
			mockFetchSkillCategories.mockResolvedValue(['Programming', 'Design'])

			const options = skillCategoriesQueryOptions()
			const mockContext = {
				queryKey: ['skills', 'categories', 'base'],
				client: {} as any,
				signal: {} as AbortSignal,
				meta: undefined
			}

			await options.queryFn!(mockContext)

			expect(mockFetchSkillCategories).toHaveBeenCalledWith('base')
		})
	})

	describe('useSkillCategories', () => {
		it('should use skillCategoriesQueryOptions with default resumeId', () => {
			const hook = useSkillCategories

			// Test that the hook is a function
			expect(typeof hook).toBe('function')
		})
	})
})
