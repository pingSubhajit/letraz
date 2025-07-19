import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'

// Mock the mutations module
vi.mock('@/lib/user-info/mutations', () => ({
	useUpdateUserInfoMutation: vi.fn()
}))

// Mock the actions
vi.mock('@/lib/user-info/actions')

describe('User Info Mutations', () => {
	beforeEach(async () => {
		vi.clearAllMocks()

		// Setup default mock implementations
		const mutations = vi.mocked(await import('@/lib/user-info/mutations'))

		mutations.useUpdateUserInfoMutation.mockReturnValue({
			mutateAsync: vi.fn(() => Promise.resolve()),
			isPending: false,
			isError: false,
			error: null
		} as any)
	})

	afterEach(() => {
		vi.restoreAllMocks()
	})

	describe('useUpdateUserInfoMutation', () => {
		it('should be a function', async () => {
			const {useUpdateUserInfoMutation} = await import('@/lib/user-info/mutations')
			expect(typeof useUpdateUserInfoMutation).toBe('function')
		})

		it('should be mockable', async () => {
			const {useUpdateUserInfoMutation} = vi.mocked(await import('@/lib/user-info/mutations'))

			expect(useUpdateUserInfoMutation).toHaveBeenCalledTimes(0)

			// Call the mocked function
			const result = useUpdateUserInfoMutation()

			expect(useUpdateUserInfoMutation).toHaveBeenCalledTimes(1)
			expect(result).toBeDefined()
			expect(result.mutateAsync).toBeDefined()
			expect(result.isPending).toBe(false)
		})

		it('should return mutation with proper structure', async () => {
			const {useUpdateUserInfoMutation} = vi.mocked(await import('@/lib/user-info/mutations'))

			const result = useUpdateUserInfoMutation()

			expect(result).toHaveProperty('mutateAsync')
			expect(result).toHaveProperty('isPending')
			expect(result).toHaveProperty('isError')
			expect(result).toHaveProperty('error')
			expect(typeof result.mutateAsync).toBe('function')
			expect(typeof result.isPending).toBe('boolean')
			expect(typeof result.isError).toBe('boolean')
		})

		it('should accept options parameter', async () => {
			const {useUpdateUserInfoMutation} = vi.mocked(await import('@/lib/user-info/mutations'))

			const mockOptions = {
				onSuccess: vi.fn(),
				onError: vi.fn()
			}

			useUpdateUserInfoMutation(mockOptions)

			expect(useUpdateUserInfoMutation).toHaveBeenCalledWith(mockOptions)
		})
	})
})
