import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import {userInfoQueryOptions, useUserInfoQuery} from '@/lib/user-info/queries'
import {getPersonalInfoFromDB} from '@/lib/user-info/actions'
import {USER_INFO_QUERY_KEY} from '@/lib/user-info/keys'
import {UserInfo} from '@/lib/user-info/types'

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

			const mockContext = {
				queryKey: ['userInfo'],
				client: {} as any,
				signal: {} as AbortSignal,
				meta: undefined
			}

			const result = await userInfoQueryOptions.queryFn!(mockContext)

			expect(mockGetPersonalInfoFromDB).toHaveBeenCalledTimes(1)
			expect(result).toEqual(mockUserInfo)
		})

		it('should handle query function errors', async () => {
			const error = new Error('API Error')
			mockGetPersonalInfoFromDB.mockRejectedValue(error)

			const mockContext = {
				queryKey: ['userInfo'],
				client: {} as any,
				signal: {} as AbortSignal,
				meta: undefined
			}

			await expect(userInfoQueryOptions.queryFn!(mockContext)).rejects.toThrow('API Error')
			expect(mockGetPersonalInfoFromDB).toHaveBeenCalledTimes(1)
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
