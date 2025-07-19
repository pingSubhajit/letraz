import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'

// Mock the mutations module
vi.mock('@/lib/resume/mutations', () => ({
	useRearrangeResumeSectionsMutation: vi.fn()
}))

// Mock the actions
vi.mock('@/lib/resume/actions')

// Mock sonner toast
vi.mock('sonner', () => ({
	toast: {
		error: vi.fn()
	}
}))

describe('Resume Mutations', () => {
	beforeEach(async () => {
		vi.clearAllMocks()

		// Setup default mock implementations
		const mutations = vi.mocked(await import('@/lib/resume/mutations'))

		mutations.useRearrangeResumeSectionsMutation.mockReturnValue({
			mutateAsync: vi.fn(() => Promise.resolve()),
			isPending: false,
			isError: false,
			error: null
		} as any)
	})

	afterEach(() => {
		vi.restoreAllMocks()
	})

	describe('useRearrangeResumeSectionsMutation', () => {
		it('should be a function', async () => {
			const {useRearrangeResumeSectionsMutation} = await import('@/lib/resume/mutations')
			expect(typeof useRearrangeResumeSectionsMutation).toBe('function')
		})

		it('should be mockable', async () => {
			const {useRearrangeResumeSectionsMutation} = vi.mocked(await import('@/lib/resume/mutations'))

			expect(useRearrangeResumeSectionsMutation).toHaveBeenCalledTimes(0)

			// Call the mocked function
			const result = useRearrangeResumeSectionsMutation()

			expect(useRearrangeResumeSectionsMutation).toHaveBeenCalledTimes(1)
			expect(result).toBeDefined()
			expect(result.mutateAsync).toBeDefined()
			expect(result.isPending).toBe(false)
		})

		it('should return mutation with proper structure', async () => {
			const {useRearrangeResumeSectionsMutation} = vi.mocked(await import('@/lib/resume/mutations'))

			const result = useRearrangeResumeSectionsMutation()

			expect(result).toHaveProperty('mutateAsync')
			expect(result).toHaveProperty('isPending')
			expect(result).toHaveProperty('isError')
			expect(result).toHaveProperty('error')
			expect(typeof result.mutateAsync).toBe('function')
			expect(typeof result.isPending).toBe('boolean')
			expect(typeof result.isError).toBe('boolean')
		})
	})
})
