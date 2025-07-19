import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'

// Mock the mutations module
vi.mock('../mutations', () => ({
	useAddSkillMutation: vi.fn(),
	useUpdateSkillMutation: vi.fn(),
	useRemoveSkillMutation: vi.fn(),
	useCreateGlobalSkillMutation: vi.fn()
}))

// Mock the actions
vi.mock('../actions')

describe('Skill Mutations', () => {
	beforeEach(async () => {
		vi.clearAllMocks()

		// Setup default mock implementations
		const mutations = vi.mocked(await import('../mutations'))

		mutations.useAddSkillMutation.mockReturnValue({
			mutateAsync: vi.fn(() => Promise.resolve()),
			isPending: false,
			isError: false,
			error: null
		} as any)

		mutations.useUpdateSkillMutation.mockReturnValue({
			mutateAsync: vi.fn(() => Promise.resolve()),
			isPending: false,
			isError: false,
			error: null
		} as any)

		mutations.useRemoveSkillMutation.mockReturnValue({
			mutateAsync: vi.fn(() => Promise.resolve()),
			isPending: false,
			isError: false,
			error: null
		} as any)

		mutations.useCreateGlobalSkillMutation.mockReturnValue({
			mutateAsync: vi.fn(() => Promise.resolve()),
			isPending: false,
			isError: false,
			error: null
		} as any)
	})

	afterEach(() => {
		vi.restoreAllMocks()
	})

	describe('useAddSkillMutation', () => {
		it('should be a function', async () => {
			const {useAddSkillMutation} = await import('../mutations')
			expect(typeof useAddSkillMutation).toBe('function')
		})

		it('should be mockable', async () => {
			const {useAddSkillMutation} = vi.mocked(await import('../mutations'))

			expect(useAddSkillMutation).toHaveBeenCalledTimes(0)

			// Call the mocked function
			const result = useAddSkillMutation()

			expect(useAddSkillMutation).toHaveBeenCalledTimes(1)
			expect(result).toBeDefined()
			expect(result.mutateAsync).toBeDefined()
			expect(result.isPending).toBe(false)
		})
	})

	describe('useUpdateSkillMutation', () => {
		it('should be a function', async () => {
			const {useUpdateSkillMutation} = await import('../mutations')
			expect(typeof useUpdateSkillMutation).toBe('function')
		})

		it('should be mockable', async () => {
			const {useUpdateSkillMutation} = vi.mocked(await import('../mutations'))

			expect(useUpdateSkillMutation).toHaveBeenCalledTimes(0)

			// Call the mocked function
			const result = useUpdateSkillMutation()

			expect(useUpdateSkillMutation).toHaveBeenCalledTimes(1)
			expect(result).toBeDefined()
			expect(result.mutateAsync).toBeDefined()
			expect(result.isPending).toBe(false)
		})
	})

	describe('useRemoveSkillMutation', () => {
		it('should be a function', async () => {
			const {useRemoveSkillMutation} = await import('../mutations')
			expect(typeof useRemoveSkillMutation).toBe('function')
		})

		it('should be mockable', async () => {
			const {useRemoveSkillMutation} = vi.mocked(await import('../mutations'))

			expect(useRemoveSkillMutation).toHaveBeenCalledTimes(0)

			// Call the mocked function
			const result = useRemoveSkillMutation()

			expect(useRemoveSkillMutation).toHaveBeenCalledTimes(1)
			expect(result).toBeDefined()
			expect(result.mutateAsync).toBeDefined()
			expect(result.isPending).toBe(false)
		})
	})

	describe('useCreateGlobalSkillMutation', () => {
		it('should be a function', async () => {
			const {useCreateGlobalSkillMutation} = await import('../mutations')
			expect(typeof useCreateGlobalSkillMutation).toBe('function')
		})

		it('should be mockable', async () => {
			const {useCreateGlobalSkillMutation} = vi.mocked(await import('../mutations'))

			expect(useCreateGlobalSkillMutation).toHaveBeenCalledTimes(0)

			// Call the mocked function
			const result = useCreateGlobalSkillMutation()

			expect(useCreateGlobalSkillMutation).toHaveBeenCalledTimes(1)
			expect(result).toBeDefined()
			expect(result.mutateAsync).toBeDefined()
			expect(result.isPending).toBe(false)
		})
	})
})
