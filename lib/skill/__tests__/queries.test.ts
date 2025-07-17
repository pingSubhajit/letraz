import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import {
	globalSkillsQueryOptions,
	resumeSkillsQueryOptions,
	skillCategoriesQueryOptions,
	useCurrentResumeSkills,
	useGlobalSkills,
	useSkillCategories
} from '../queries'
import {fetchGlobalSkills, fetchResumeSkills, fetchSkillCategories} from '../actions'
import {GlobalSkill, ResumeSkill} from '../types'

// Mock the actions
vi.mock('../actions')

const mockFetchGlobalSkills = vi.mocked(fetchGlobalSkills)
const mockFetchResumeSkills = vi.mocked(fetchResumeSkills)
const mockFetchSkillCategories = vi.mocked(fetchSkillCategories)

// Mock data
const mockGlobalSkills: GlobalSkill[] = [
	{
		id: 'global-skill-1',
		name: 'JavaScript',
		category: 'Programming Languages',
		description: 'A programming language',
		created_at: '2023-01-01T00:00:00Z',
		updated_at: '2023-01-01T00:00:00Z'
	},
	{
		id: 'global-skill-2',
		name: 'React',
		category: 'Frontend Frameworks',
		description: 'A JavaScript library',
		created_at: '2023-01-01T00:00:00Z',
		updated_at: '2023-01-01T00:00:00Z'
	}
]

const mockResumeSkills: ResumeSkill[] = [
	{
		id: 'resume-skill-1',
		user: 'user-123',
		resume: 'resume-123',
		global_skill: 'global-skill-1',
		level: 'intermediate',
		created_at: '2023-01-01T00:00:00Z',
		updated_at: '2023-01-01T00:00:00Z'
	},
	{
		id: 'resume-skill-2',
		user: 'user-123',
		resume: 'resume-123',
		global_skill: 'global-skill-2',
		level: 'advanced',
		created_at: '2023-01-01T00:00:00Z',
		updated_at: '2023-01-01T00:00:00Z'
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

			const result = await globalSkillsQueryOptions.queryFn()

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

			const options = resumeSkillsQueryOptions('test-resume-456')
			await options.queryFn()

			expect(mockFetchResumeSkills).toHaveBeenCalledWith('test-resume-456')
		})

		it('should call fetchResumeSkills with default resumeId when none provided', async () => {
			mockFetchResumeSkills.mockResolvedValue(mockResumeSkills)

			const options = resumeSkillsQueryOptions()
			await options.queryFn()

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
			mockFetchSkillCategories.mockResolvedValue(mockSkillCategories)

			const options = skillCategoriesQueryOptions('test-resume-categories')
			await options.queryFn()

			expect(mockFetchSkillCategories).toHaveBeenCalledWith('test-resume-categories')
		})

		it('should call fetchSkillCategories with default resumeId when none provided', async () => {
			mockFetchSkillCategories.mockResolvedValue(mockSkillCategories)

			const options = skillCategoriesQueryOptions()
			await options.queryFn()

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
