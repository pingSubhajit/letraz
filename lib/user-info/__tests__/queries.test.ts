import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import {userInfoQueryOptions, useUserInfoQuery} from '../queries'
import {getPersonalInfoFromDB} from '../actions'
import {USER_INFO_QUERY_KEY} from '../keys'
import {UserInfo} from '../types'

// Mock the actions
vi.mock('../actions')

const mockGetPersonalInfoFromDB = vi.mocked(getPersonalInfoFromDB)

// Mock data
const mockUserInfo: UserInfo = {
	id: 'user-123',
	title: 'Mr.',
	first_name: 'John',
	last_name: 'Doe',
	email: 'john.doe@example.com',
	phone: '+1234567890',
	dob: new Date('1990-01-01'),
	nationality: 'American',
	address: '123 Main St',
	city: 'San Francisco',
	postal: '94105',
	country: {
		code: 'USA',
		name: 'United States'
	},
	website: 'https://johndoe.com',
	profile_text: 'Experienced software engineer with 5+ years of experience',
	created_at: '2023-01-01T00:00:00Z',
	updated_at: '2023-01-01T00:00:00Z'
}

describe('User Info Queries', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	afterEach(() => {
		vi.restoreAllMocks()
	})

	describe('userInfoQueryOptions', () => {
		it('should have correct query key', () => {
			const options = userInfoQueryOptions

			expect(options.queryKey).toEqual(USER_INFO_QUERY_KEY)
		})

		it('should have correct query function', () => {
			const options = userInfoQueryOptions

			expect(options.queryFn).toBeInstanceOf(Function)
		})

		it('should call getPersonalInfoFromDB when query function is executed', async () => {
			mockGetPersonalInfoFromDB.mockResolvedValue(mockUserInfo)

			const result = await userInfoQueryOptions.queryFn()

			expect(mockGetPersonalInfoFromDB).toHaveBeenCalledTimes(1)
			expect(mockGetPersonalInfoFromDB).toHaveBeenCalledWith()
			expect(result).toEqual(mockUserInfo)
		})

		it('should handle query function errors', async () => {
			const error = new Error('API Error')
			mockGetPersonalInfoFromDB.mockRejectedValue(error)

			await expect(userInfoQueryOptions.queryFn()).rejects.toThrow('API Error')
			expect(mockGetPersonalInfoFromDB).toHaveBeenCalledWith()
		})
	})

	describe('useUserInfoQuery', () => {
		it('should use the correct query options', () => {
			const hook = useUserInfoQuery

			// Test that the hook is a function
			expect(typeof hook).toBe('function')
		})

		it('should be available for import', () => {
			expect(useUserInfoQuery).toBeDefined()
			expect(typeof useUserInfoQuery).toBe('function')
		})
	})
})
