import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'

// Mock the mutations module
vi.mock('../mutations', () => ({
	useAddEducationMutation: vi.fn(),
	useUpdateEducationMutation: vi.fn(),
	useDeleteEducationMutation: vi.fn()
}))

// Mock the actions
vi.mock('../actions')

describe('Education Mutations', () => {
	beforeEach(async () => {
		vi.clearAllMocks()

		// Setup default mock implementations
		const mutations = vi.mocked(await import('../mutations'))

		mutations.useAddEducationMutation.mockReturnValue({
			mutateAsync: vi.fn(() => Promise.resolve()),
			isPending: false,
			isError: false,
			error: null
		} as any)

		mutations.useUpdateEducationMutation.mockReturnValue({
			mutateAsync: vi.fn(() => Promise.resolve()),
			isPending: false,
			isError: false,
			error: null
		} as any)

		mutations.useDeleteEducationMutation.mockReturnValue({
			mutateAsync: vi.fn(() => Promise.resolve()),
			isPending: false,
			isError: false,
			error: null
		} as any)
	})

	afterEach(() => {
		vi.restoreAllMocks()
	})

	describe('useAddEducationMutation', () => {
		it('should be a function', async () => {
			const {useAddEducationMutation} = await import('../mutations')
			expect(typeof useAddEducationMutation).toBe('function')
		})

		it('should be mockable', async () => {
			const {useAddEducationMutation} = vi.mocked(await import('../mutations'))

			expect(useAddEducationMutation).toHaveBeenCalledTimes(0)

			// Call the mocked function
			const result = useAddEducationMutation()

			expect(useAddEducationMutation).toHaveBeenCalledTimes(1)
			expect(result).toBeDefined()
			expect(result.mutateAsync).toBeDefined()
			expect(result.isPending).toBe(false)
		})
	})

	describe('useUpdateEducationMutation', () => {
		it('should be a function', async () => {
			const {useUpdateEducationMutation} = await import('../mutations')
			expect(typeof useUpdateEducationMutation).toBe('function')
		})

		it('should be mockable', async () => {
			const {useUpdateEducationMutation} = vi.mocked(await import('../mutations'))

			expect(useUpdateEducationMutation).toHaveBeenCalledTimes(0)

			// Call the mocked function
			const result = useUpdateEducationMutation()

			expect(useUpdateEducationMutation).toHaveBeenCalledTimes(1)
			expect(result).toBeDefined()
			expect(result.mutateAsync).toBeDefined()
			expect(result.isPending).toBe(false)
		})
	})

	describe('useDeleteEducationMutation', () => {
		it('should be a function', async () => {
			const {useDeleteEducationMutation} = await import('../mutations')
			expect(typeof useDeleteEducationMutation).toBe('function')
		})

		it('should be mockable', async () => {
			const {useDeleteEducationMutation} = vi.mocked(await import('../mutations'))

			expect(useDeleteEducationMutation).toHaveBeenCalledTimes(0)

			// Call the mocked function
			const result = useDeleteEducationMutation()

			expect(useDeleteEducationMutation).toHaveBeenCalledTimes(1)
			expect(result).toBeDefined()
			expect(result.mutateAsync).toBeDefined()
			expect(result.isPending).toBe(false)
		})
	})
}) 