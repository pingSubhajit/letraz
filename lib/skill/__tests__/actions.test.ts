import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import {
	addSkillToResume,
	createGlobalSkill,
	fetchGlobalSkills,
	fetchResumeSkills,
	fetchSkillCategories,
	removeSkillFromResume,
	updateResumeSkill
} from '../actions'
import {api} from '@/lib/config/api-client'
import {handleErrors} from '@/lib/misc/error-handler'
import {GlobalSkill, NewSkill, ResumeSkill, SkillMutation} from '../types'

// Mock dependencies
vi.mock('@/lib/config/api-client')
vi.mock('@/lib/misc/error-handler')

const mockApi = vi.mocked(api)
const mockHandleErrors = vi.mocked(handleErrors)

describe('Skill Actions', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	afterEach(() => {
		vi.resetAllMocks()
	})

	describe('fetchGlobalSkills', () => {
		const mockGlobalSkills: GlobalSkill[] = [
			{
				id: '123e4567-e89b-12d3-a456-426614174000',
				name: 'JavaScript',
				category: 'Programming',
				preferred: true,
				alias: [],
				created_at: '2024-01-01T00:00:00Z',
				updated_at: '2024-01-01T00:00:00Z'
			},
			{
				id: '123e4567-e89b-12d3-a456-426614174001',
				name: 'React',
				category: 'Frontend',
				preferred: true,
				alias: [],
				created_at: '2024-01-01T00:00:00Z',
				updated_at: '2024-01-01T00:00:00Z'
			}
		]

		it('should fetch global skills successfully', async () => {
			mockApi.get.mockResolvedValue(mockGlobalSkills)

			const result = await fetchGlobalSkills()

			expect(mockApi.get).toHaveBeenCalledWith('/skill/')
			expect(result).toEqual(mockGlobalSkills)
		})

		it('should handle API errors', async () => {
			const error = new Error('API Error')
			mockApi.get.mockRejectedValue(error)
			mockHandleErrors.mockImplementation(() => {
				throw new Error('Failed to fetch global skills: API Error')
			})

			await expect(fetchGlobalSkills()).rejects.toThrow('Failed to fetch global skills: API Error')
			expect(mockHandleErrors).toHaveBeenCalledWith(error, 'fetch global skills')
		})

		it('should parse each skill with schema validation', async () => {
			mockApi.get.mockResolvedValue(mockGlobalSkills)

			const result = await fetchGlobalSkills()

			expect(result).toHaveLength(2)
			expect(result[0]).toMatchObject({
				id: expect.any(String),
				name: expect.any(String),
				category: expect.any(String),
				preferred: expect.any(Boolean)
			})
		})
	})

	describe('fetchResumeSkills', () => {
		const mockResumeSkills: ResumeSkill[] = [
			{
				id: '123e4567-e89b-12d3-a456-426614174002',
				skill: {
					id: '123e4567-e89b-12d3-a456-426614174000',
					name: 'JavaScript',
					category: 'Programming',
					preferred: true,
					alias: [],
					created_at: '2024-01-01T00:00:00Z',
					updated_at: '2024-01-01T00:00:00Z'
				},
				resume_section: '123e4567-e89b-12d3-a456-426614174003',
				level: 'ADV'
			}
		]

		it('should fetch resume skills with default resumeId', async () => {
			mockApi.get.mockResolvedValue(mockResumeSkills)

			const result = await fetchResumeSkills()

			expect(mockApi.get).toHaveBeenCalledWith('/resume/base/skill/')
			expect(result).toEqual(mockResumeSkills)
		})

		it('should fetch resume skills with custom resumeId', async () => {
			mockApi.get.mockResolvedValue(mockResumeSkills)

			const result = await fetchResumeSkills('custom-resume-id')

			expect(mockApi.get).toHaveBeenCalledWith('/resume/custom-resume-id/skill/')
			expect(result).toEqual(mockResumeSkills)
		})

		it('should handle API errors', async () => {
			const error = new Error('API Error')
			mockApi.get.mockRejectedValue(error)
			mockHandleErrors.mockImplementation(() => {
				throw new Error('Failed to fetch resume skills: API Error')
			})

			await expect(fetchResumeSkills()).rejects.toThrow('Failed to fetch resume skills: API Error')
			expect(mockHandleErrors).toHaveBeenCalledWith(error, 'fetch resume skills')
		})
	})

	describe('addSkillToResume', () => {
		const mockResumeSkill: ResumeSkill = {
			id: '123e4567-e89b-12d3-a456-426614174002',
			skill: {
				id: '123e4567-e89b-12d3-a456-426614174000',
				name: 'JavaScript',
				category: 'Programming',
				preferred: true,
				alias: [],
				created_at: '2024-01-01T00:00:00Z',
				updated_at: '2024-01-01T00:00:00Z'
			},
			resume_section: '123e4567-e89b-12d3-a456-426614174003',
			level: 'ADV'
		}

		it('should add existing skill to resume', async () => {
			const skillData: SkillMutation = {
				skill_id: '123e4567-e89b-12d3-a456-426614174000',
				level: 'ADV',
				category: 'Programming'
			}

			const mockGlobalSkill: GlobalSkill = {
				id: '123e4567-e89b-12d3-a456-426614174000',
				name: 'JavaScript',
				category: 'Programming',
				preferred: true,
				alias: [],
				created_at: '2024-01-01T00:00:00Z',
				updated_at: '2024-01-01T00:00:00Z'
			}

			mockApi.get.mockResolvedValue(mockGlobalSkill)
			mockApi.post.mockResolvedValue(mockResumeSkill)

			const result = await addSkillToResume(skillData)

			expect(mockApi.get).toHaveBeenCalledWith('/skill/123e4567-e89b-12d3-a456-426614174000/')
			expect(mockApi.post).toHaveBeenCalledWith('/resume/base/skill/', {
				level: 'ADV',
				name: 'JavaScript',
				category: 'Programming'
			})
			expect(result).toEqual(mockResumeSkill)
		})

		it('should add custom skill to resume', async () => {
			const skillData: SkillMutation = {
				skill_id: 'custom:TypeScript',
				level: 'INT',
				category: 'Programming'
			}

			mockApi.post.mockResolvedValue(mockResumeSkill)

			const result = await addSkillToResume(skillData)

			expect(mockApi.post).toHaveBeenCalledWith('/resume/base/skill/', {
				level: 'INT',
				name: 'TypeScript',
				category: 'Programming'
			})
			expect(result).toEqual(mockResumeSkill)
		})

		it('should handle fallback when individual skill fetch fails', async () => {
			const skillData: SkillMutation = {
				skill_id: '123e4567-e89b-12d3-a456-426614174000',
				level: 'ADV'
			}

			const allSkills: GlobalSkill[] = [
				{
					id: '123e4567-e89b-12d3-a456-426614174000',
					name: 'JavaScript',
					category: 'Programming',
					preferred: true,
					alias: [],
					created_at: '2024-01-01T00:00:00Z',
					updated_at: '2024-01-01T00:00:00Z'
				}
			]

			mockApi.get
				.mockRejectedValueOnce(new Error('Individual skill fetch failed'))
				.mockResolvedValueOnce(allSkills)
			mockApi.post.mockResolvedValue(mockResumeSkill)

			const result = await addSkillToResume(skillData)

			expect(mockApi.get).toHaveBeenCalledTimes(2)
			expect(mockApi.get).toHaveBeenNthCalledWith(1, '/skill/123e4567-e89b-12d3-a456-426614174000/')
			expect(mockApi.get).toHaveBeenNthCalledWith(2, '/skill/')
			expect(result).toEqual(mockResumeSkill)
		})

		it('should not include empty category in payload', async () => {
			const skillData: SkillMutation = {
				skill_id: 'custom:TypeScript',
				level: 'INT',
				category: '   ' // Empty/whitespace category
			}

			mockApi.post.mockResolvedValue(mockResumeSkill)

			await addSkillToResume(skillData)

			expect(mockApi.post).toHaveBeenCalledWith('/resume/base/skill/', {
				level: 'INT',
				name: 'TypeScript'
				// category should not be included
			})
		})

		it('should handle API errors', async () => {
			const skillData: SkillMutation = {
				skill_id: 'custom:TypeScript',
				level: 'INT'
			}

			const error = new Error('API Error')
			mockApi.post.mockRejectedValue(error)
			mockHandleErrors.mockImplementation(() => {
				throw new Error('Failed to add skill to resume: API Error')
			})

			await expect(addSkillToResume(skillData)).rejects.toThrow('Failed to add skill to resume: API Error')
			expect(mockHandleErrors).toHaveBeenCalledWith(error, 'add skill to resume')
		})
	})

	describe('updateResumeSkill', () => {
		const mockUpdatedSkill: ResumeSkill = {
			id: '123e4567-e89b-12d3-a456-426614174002',
			skill: {
				id: '123e4567-e89b-12d3-a456-426614174000',
				name: 'JavaScript',
				category: 'Programming',
				preferred: true,
				alias: [],
				created_at: '2024-01-01T00:00:00Z',
				updated_at: '2024-01-01T00:00:00Z'
			},
			resume_section: '123e4567-e89b-12d3-a456-426614174003',
			level: 'EXP'
		}

		it('should update resume skill level', async () => {
			const skillData: Partial<SkillMutation> = {
				level: 'EXP'
			}

			mockApi.patch.mockResolvedValue(mockUpdatedSkill)

			const result = await updateResumeSkill('skill-id', skillData)

			expect(mockApi.patch).toHaveBeenCalledWith('/resume/base/skill/skill-id/', {
				level: 'EXP'
			})
			expect(result).toEqual(mockUpdatedSkill)
		})

		it('should update custom skill name', async () => {
			const skillData: Partial<SkillMutation> = {
				skill_id: 'custom:TypeScript',
				category: 'Programming'
			}

			mockApi.patch.mockResolvedValue(mockUpdatedSkill)

			const result = await updateResumeSkill('skill-id', skillData)

			expect(mockApi.patch).toHaveBeenCalledWith('/resume/base/skill/skill-id/', {
				name: 'TypeScript',
				category: 'Programming'
			})
			expect(result).toEqual(mockUpdatedSkill)
		})

		it('should update existing skill with fallback', async () => {
			const skillData: Partial<SkillMutation> = {
				skill_id: '123e4567-e89b-12d3-a456-426614174000'
			}

			const allSkills: GlobalSkill[] = [
				{
					id: '123e4567-e89b-12d3-a456-426614174000',
					name: 'JavaScript',
					category: 'Programming',
					preferred: true,
					alias: [],
					created_at: '2024-01-01T00:00:00Z',
					updated_at: '2024-01-01T00:00:00Z'
				}
			]

			mockApi.get
				.mockRejectedValueOnce(new Error('Individual skill fetch failed'))
				.mockResolvedValueOnce(allSkills)
			mockApi.patch.mockResolvedValue(mockUpdatedSkill)

			const result = await updateResumeSkill('skill-id', skillData)

			expect(mockApi.patch).toHaveBeenCalledWith('/resume/base/skill/skill-id/', {
				name: 'JavaScript'
			})
			expect(result).toEqual(mockUpdatedSkill)
		})

		it('should handle empty category by setting to null', async () => {
			const skillData: Partial<SkillMutation> = {
				category: '   ' // Empty/whitespace category
			}

			mockApi.patch.mockResolvedValue(mockUpdatedSkill)

			await updateResumeSkill('skill-id', skillData)

			expect(mockApi.patch).toHaveBeenCalledWith('/resume/base/skill/skill-id/', {
				category: null
			})
		})

		it('should handle API errors', async () => {
			const skillData: Partial<SkillMutation> = {
				level: 'EXP'
			}

			const error = new Error('API Error')
			mockApi.patch.mockRejectedValue(error)
			mockHandleErrors.mockImplementation(() => {
				throw new Error('Failed to update resume skill: API Error')
			})

			await expect(updateResumeSkill('skill-id', skillData)).rejects.toThrow('Failed to update resume skill: API Error')
			expect(mockHandleErrors).toHaveBeenCalledWith(error, 'update resume skill')
		})
	})

	describe('removeSkillFromResume', () => {
		it('should remove skill from resume', async () => {
			mockApi.delete.mockResolvedValue(undefined)

			await removeSkillFromResume('skill-id')

			expect(mockApi.delete).toHaveBeenCalledWith('/resume/base/skill/skill-id/')
		})

		it('should remove skill from custom resume', async () => {
			mockApi.delete.mockResolvedValue(undefined)

			await removeSkillFromResume('skill-id', 'custom-resume-id')

			expect(mockApi.delete).toHaveBeenCalledWith('/resume/custom-resume-id/skill/skill-id/')
		})

		it('should handle API errors', async () => {
			const error = new Error('API Error')
			mockApi.delete.mockRejectedValue(error)
			mockHandleErrors.mockImplementation(() => {
				throw new Error('Failed to remove skill from resume: API Error')
			})

			await expect(removeSkillFromResume('skill-id')).rejects.toThrow('Failed to remove skill from resume: API Error')
			expect(mockHandleErrors).toHaveBeenCalledWith(error, 'remove skill from resume')
		})
	})

	describe('createGlobalSkill', () => {
		const mockNewSkill: NewSkill = {
			name: 'Vue.js',
			category: 'Frontend',
			preferred: false
		}

		const mockCreatedSkill: GlobalSkill = {
			id: '123e4567-e89b-12d3-a456-426614174004',
			name: 'Vue.js',
			category: 'Frontend',
			preferred: false,
			alias: [],
			created_at: '2024-01-01T00:00:00Z',
			updated_at: '2024-01-01T00:00:00Z'
		}

		it('should create global skill successfully', async () => {
			mockApi.post.mockResolvedValue(mockCreatedSkill)

			const result = await createGlobalSkill(mockNewSkill)

			expect(mockApi.post).toHaveBeenCalledWith('/skill/', mockNewSkill)
			expect(result).toEqual(mockCreatedSkill)
		})

		it('should handle API errors', async () => {
			const error = new Error('API Error')
			mockApi.post.mockRejectedValue(error)
			mockHandleErrors.mockImplementation(() => {
				throw new Error('Failed to create global skill: API Error')
			})

			await expect(createGlobalSkill(mockNewSkill)).rejects.toThrow('Failed to create global skill: API Error')
			expect(mockHandleErrors).toHaveBeenCalledWith(error, 'create global skill')
		})
	})

	describe('fetchSkillCategories', () => {
		const mockCategories = ['Programming', 'Frontend', 'Backend', 'Database']

		it('should fetch skill categories with default resumeId', async () => {
			mockApi.get.mockResolvedValue(mockCategories)

			const result = await fetchSkillCategories()

			expect(mockApi.get).toHaveBeenCalledWith('/resume/base/skill/categories/')
			expect(result).toEqual(mockCategories)
		})

		it('should fetch skill categories with custom resumeId', async () => {
			mockApi.get.mockResolvedValue(mockCategories)

			const result = await fetchSkillCategories('custom-resume-id')

			expect(mockApi.get).toHaveBeenCalledWith('/resume/custom-resume-id/skill/categories/')
			expect(result).toEqual(mockCategories)
		})

		it('should handle API errors', async () => {
			const error = new Error('API Error')
			mockApi.get.mockRejectedValue(error)
			mockHandleErrors.mockImplementation(() => {
				throw new Error('Failed to fetch skill categories: API Error')
			})

			await expect(fetchSkillCategories()).rejects.toThrow('Failed to fetch skill categories: API Error')
			expect(mockHandleErrors).toHaveBeenCalledWith(error, 'fetch skill categories')
		})
	})
})
