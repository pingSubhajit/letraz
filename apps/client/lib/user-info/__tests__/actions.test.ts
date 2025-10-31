import {beforeEach, describe, expect, it, vi} from 'vitest'
import {addOrUpdateUserInfoToDB, getPersonalInfoFromDB} from '@/lib/user-info/actions'
import {api} from '@/lib/config/api-client'
import {apiDateToDate, dateToApiFormat} from '@/lib/utils'

// Mock dependencies
vi.mock('@/lib/config/api-client', () => ({
	api: {
		post: vi.fn(),
		patch: vi.fn(),
		get: vi.fn()
	}
}))

vi.mock('@/lib/utils', () => ({
	dateToApiFormat: vi.fn(),
	apiDateToDate: vi.fn()
}))

vi.mock('@/lib/misc/error-handler', () => ({
	handleErrors: vi.fn()
}))

describe('user-info actions', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	describe('addOrUpdateUserInfoToDB', () => {
		it('should successfully add or update user info', async () => {
			const mockUserInfo = {
				title: 'Mr.',
				first_name: 'John',
				last_name: 'Doe',
				email: 'john@example.com',
				phone: '1234567890',
				dob: new Date('1990-01-01'),
				nationality: 'American',
				address: '123 Main St',
				city: 'New York',
				postal: '10001',
				country: 'USA',
				website: 'https://example.com',
				profile_text: 'Software developer'
			}

			const mockApiResponse = {
				id: 'user-123',
				title: 'Mr.',
				first_name: 'John',
				last_name: 'Doe',
				email: 'john@example.com',
				phone: '1234567890',
				dob: new Date('1990-01-01'),
				nationality: 'American',
				address: '123 Main St',
				city: 'New York',
				postal: '10001',
				country: {
					code: 'USA',
					name: 'United States'
				},
				website: 'https://example.com',
				profile_text: 'Software developer',
				created_at: '2023-01-01T00:00:00Z',
				updated_at: '2023-01-01T00:00:00Z'
			}

			vi.mocked(dateToApiFormat).mockReturnValue('1990-01-01')
			vi.mocked(apiDateToDate).mockReturnValue(new Date('1990-01-01'))
			vi.mocked(api.patch).mockResolvedValue(mockApiResponse)

			const result = await addOrUpdateUserInfoToDB(mockUserInfo)

			expect(dateToApiFormat).toHaveBeenCalledWith(mockUserInfo.dob)
			expect(api.patch).toHaveBeenCalledWith('/user/', {
				...mockUserInfo,
				dob: '1990-01-01'
			})
			expect(result).toEqual(mockApiResponse)
		})

		it('should handle null date of birth', async () => {
			const mockUserInfo = {
				first_name: 'John',
				last_name: 'Doe',
				email: 'john@example.com',
				country: 'USA',
				dob: null
			}

			const mockApiResponse = {
				id: 'user-123',
				first_name: 'John',
				last_name: 'Doe',
				email: 'john@example.com',
				country: {
					code: 'USA',
					name: 'United States'
				},
				dob: null,
				created_at: '2023-01-01T00:00:00Z',
				updated_at: '2023-01-01T00:00:00Z'
			}

			vi.mocked(dateToApiFormat).mockReturnValue(null)
			vi.mocked(apiDateToDate).mockReturnValue(null)
			vi.mocked(api.patch).mockResolvedValue(mockApiResponse)

			const result = await addOrUpdateUserInfoToDB(mockUserInfo)

			expect(dateToApiFormat).toHaveBeenCalledWith(null)
			expect(api.patch).toHaveBeenCalledWith('/user/', {
				...mockUserInfo,
				dob: null
			})
			expect(result).toEqual(mockApiResponse)
		})

		it('should handle API errors', async () => {
			const mockUserInfo = {
				first_name: 'John',
				last_name: 'Doe',
				email: 'john@example.com',
				country: 'USA'
			}

			const apiError = new Error('API Error')
			vi.mocked(api.patch).mockRejectedValue(apiError)

			await expect(addOrUpdateUserInfoToDB(mockUserInfo)).rejects.toThrow('API Error')
		})
	})

	describe('getPersonalInfoFromDB', () => {
		it('should successfully retrieve personal information', async () => {
			const mockApiResponse = {
				id: 'user-123',
				title: 'Mr.',
				first_name: 'John',
				last_name: 'Doe',
				email: 'john@example.com',
				phone: '1234567890',
				dob: '1990-01-01',
				nationality: 'American',
				address: '123 Main St',
				city: 'New York',
				postal: '10001',
				country: {
					code: 'USA',
					name: 'United States'
				},
				website: 'https://example.com',
				profile_text: 'Software developer',
				created_at: '2023-01-01T00:00:00Z',
				updated_at: '2023-01-01T00:00:00Z'
			}

			const expectedDate = new Date('1990-01-01')
			vi.mocked(api.get).mockResolvedValue(mockApiResponse)

			const result = await getPersonalInfoFromDB()

			expect(api.get).toHaveBeenCalledWith('/user/')
			expect(result).toEqual({
				...mockApiResponse,
				dob: expectedDate
			})
		})

		it('should handle null date of birth in response', async () => {
			const mockApiResponse = {
				id: 'user-123',
				first_name: 'John',
				last_name: 'Doe',
				email: 'john@example.com',
				country: {
					code: 'USA',
					name: 'United States'
				},
				dob: null,
				created_at: '2023-01-01T00:00:00Z',
				updated_at: '2023-01-01T00:00:00Z'
			}

			vi.mocked(api.get).mockResolvedValue(mockApiResponse)

			const result = await getPersonalInfoFromDB()

			expect(result).toEqual({
				...mockApiResponse,
				dob: null
			})
		})

		it('should handle API errors', async () => {
			const apiError = new Error('API Error')
			vi.mocked(api.get).mockRejectedValue(apiError)

			await expect(getPersonalInfoFromDB()).rejects.toThrow('API Error')
		})

		it('should handle string date conversion', async () => {
			const mockApiResponse = {
				id: 'user-123',
				first_name: 'John',
				last_name: 'Doe',
				email: 'john@example.com',
				country: {
					code: 'USA',
					name: 'United States'
				},
				dob: '1990-01-01',
				created_at: '2023-01-01T00:00:00Z',
				updated_at: '2023-01-01T00:00:00Z'
			}

			const expectedDate = new Date('1990-01-01')
			vi.mocked(api.get).mockResolvedValue(mockApiResponse)

			const result = await getPersonalInfoFromDB()

			expect(result.dob).toEqual(expectedDate)
		})
	})

	describe('data transformation integration', () => {
		it('should maintain date integrity through full cycle', async () => {
			const originalDate = new Date('1990-01-01')
			const userInfo = {
				first_name: 'John',
				last_name: 'Doe',
				email: 'john@example.com',
				country: 'USA',
				dob: originalDate
			}

			const mockApiResponse = {
				id: 'user-123',
				first_name: 'John',
				last_name: 'Doe',
				email: 'john@example.com',
				country: {
					code: 'USA',
					name: 'United States'
				},
				dob: originalDate,
				created_at: '2023-01-01T00:00:00Z',
				updated_at: '2023-01-01T00:00:00Z'
			}

			vi.mocked(dateToApiFormat).mockReturnValue('1990-01-01')
			vi.mocked(apiDateToDate).mockReturnValue(originalDate)
			vi.mocked(api.patch).mockResolvedValue(mockApiResponse)

			const result = await addOrUpdateUserInfoToDB(userInfo)

			expect(dateToApiFormat).toHaveBeenCalledWith(originalDate)
			expect(result.dob).toStrictEqual(originalDate)
		})
	})
})
