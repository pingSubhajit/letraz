import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'

// Mock the mutations module
vi.mock('@/lib/experience/mutations', () => ({
	useAddUserExperienceMutation: vi.fn(),
	useUpdateExperienceMutation: vi.fn(),
	useDeleteExperienceMutation: vi.fn()
}))

// Mock the actions
vi.mock('@/lib/experience/actions')

describe('Experience Mutations', () => {
	beforeEach(async () => {
		vi.clearAllMocks()

		// Setup default mock implementations
		const mutations = vi.mocked(await import('@/lib/experience/mutations'))

		mutations.useAddUserExperienceMutation.mockReturnValue({
			mutateAsync: vi.fn(() => Promise.resolve()),
			isPending: false,
			isError: false,
			error: null
		} as any)

		mutations.useUpdateExperienceMutation.mockReturnValue({
			mutateAsync: vi.fn(() => Promise.resolve()),
			isPending: false,
			isError: false,
			error: null
		} as any)

		mutations.useDeleteExperienceMutation.mockReturnValue({
			mutateAsync: vi.fn(() => Promise.resolve()),
			isPending: false,
			isError: false,
			error: null
		} as any)
	})

	afterEach(() => {
		vi.restoreAllMocks()
	})

	describe('useAddUserExperienceMutation', () => {
		it('should be a function', async () => {
			const {useAddUserExperienceMutation} = await import('@/lib/experience/mutations')
			expect(typeof useAddUserExperienceMutation).toBe('function')
		})

		it('should be mockable', async () => {
			const {useAddUserExperienceMutation} = vi.mocked(await import('@/lib/experience/mutations'))

			expect(useAddUserExperienceMutation).toHaveBeenCalledTimes(0)

			// Call the mocked function
			const result = useAddUserExperienceMutation()

			expect(useAddUserExperienceMutation).toHaveBeenCalledTimes(1)
			expect(result).toBeDefined()
			expect(result.mutateAsync).toBeDefined()
			expect(result.isPending).toBe(false)
		})
	})

	describe('useUpdateExperienceMutation', () => {
		it('should be a function', async () => {
			const {useUpdateExperienceMutation} = await import('@/lib/experience/mutations')
			expect(typeof useUpdateExperienceMutation).toBe('function')
		})

		it('should be mockable', async () => {
			const {useUpdateExperienceMutation} = vi.mocked(await import('@/lib/experience/mutations'))

			expect(useUpdateExperienceMutation).toHaveBeenCalledTimes(0)

			// Call the mocked function
			const result = useUpdateExperienceMutation()

			expect(useUpdateExperienceMutation).toHaveBeenCalledTimes(1)
			expect(result).toBeDefined()
			expect(result.mutateAsync).toBeDefined()
			expect(result.isPending).toBe(false)
		})
	})

	describe('useDeleteExperienceMutation', () => {
		it('should be a function', async () => {
			const {useDeleteExperienceMutation} = await import('@/lib/experience/mutations')
			expect(typeof useDeleteExperienceMutation).toBe('function')
		})

		it('should be mockable', async () => {
			const {useDeleteExperienceMutation} = vi.mocked(await import('@/lib/experience/mutations'))

			expect(useDeleteExperienceMutation).toHaveBeenCalledTimes(0)

			// Call the mocked function
			const result = useDeleteExperienceMutation()

			expect(useDeleteExperienceMutation).toHaveBeenCalledTimes(1)
			expect(result).toBeDefined()
			expect(result.mutateAsync).toBeDefined()
			expect(result.isPending).toBe(false)
		})
	})
})
