import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import {apiMocks, createMockApiResponse, createMockFile, createMockFormData, createMockUser, testHelpers} from './index'

describe('Core Test Utilities (Non-DOM)', () => {
	beforeEach(() => {
		apiMocks.reset()
	})

	afterEach(() => {
		testHelpers.cleanup.cleanupMocks()
	})

	describe('Mock Factories', () => {
		it('should create mock user data', () => {
			const mockUser = createMockUser({
				name: 'Custom User',
				email: 'custom@example.com'
			})

			expect(mockUser.name).toBe('Custom User')
			expect(mockUser.email).toBe('custom@example.com')
			expect(mockUser.id).toBe('user_123')
			expect(mockUser.firstName).toBe('Test')
			expect(mockUser.lastName).toBe('User')
		})

		it('should create mock API responses', () => {
			const mockResponse = createMockApiResponse({message: 'Success'})

			expect(mockResponse.data).toEqual({message: 'Success'})
			expect(mockResponse.status).toBe(200)
			expect(mockResponse.success).toBe(true)
			expect(mockResponse.statusText).toBe('OK')
		})

		it('should create mock files', () => {
			const mockFile = createMockFile('test.txt', 'test content', 'text/plain')

			expect(mockFile.name).toBe('test.txt')
			expect(mockFile.type).toBe('text/plain')
			expect(mockFile.size).toBeGreaterThan(0)
		})

		it('should create mock form data', () => {
			const formData = createMockFormData({
				name: 'John Doe',
				email: 'john@example.com',
				age: 30
			})

			expect(formData.get('name')).toBe('John Doe')
			expect(formData.get('email')).toBe('john@example.com')
			expect(formData.get('age')).toBe('30')
		})
	})

	describe('API Mocking Utilities', () => {
		it('should mock successful API responses', async () => {
			const testData = {message: 'Success'}
			apiMocks.mockSuccess('/api/test', testData)

			const response = await fetch('/api/test')
			const data = await response.json()

			expect(response.ok).toBe(true)
			expect(data).toEqual(testData)
		})

		it('should mock API errors', async () => {
			apiMocks.mockError('/api/error', {status: 404, message: 'Not Found'})

			const response = await fetch('/api/error')
			const data = await response.json()

			expect(response.status).toBe(404)
			expect(data.message).toBe('Not Found')
		})

		it('should verify fetch calls', async () => {
			apiMocks.mockSuccess('/api/verify', {success: true})

			await fetch('/api/verify')

			apiMocks.verifyFetchCalled('/api/verify', 1)
		})

		it('should mock different HTTP methods', async () => {
			const postData = {id: 1, name: 'Created'}
			apiMocks.mockPost('/api/create', postData)

			const response = await fetch('/api/create', {method: 'POST'})
			const data = await response.json()

			expect(response.status).toBe(201)
			expect(data).toEqual(postData)
		})

		it('should mock paginated responses', async () => {
			const items = [
				{id: 1, name: 'Item 1'},
				{id: 2, name: 'Item 2'},
				{id: 3, name: 'Item 3'}
			]

			apiMocks.mockPaginated('/api/items', items, 1, 2)

			const response = await fetch('/api/items')
			const data = await response.json()

			expect(data.data).toHaveLength(2)
			expect(data.pagination.page).toBe(1)
			expect(data.pagination.limit).toBe(2)
			expect(data.pagination.total).toBe(3)
		})
	})

	describe('Test Data Helpers', () => {
		it('should generate random data', () => {
			const randomString = testHelpers.data.randomString(5)
			const randomEmail = testHelpers.data.randomEmail()
			const randomNumber = testHelpers.data.randomNumber(1, 10)
			const randomBoolean = testHelpers.data.randomBoolean()

			expect(randomString).toHaveLength(5)
			expect(randomEmail).toMatch(/@example\.com$/)
			expect(randomNumber).toBeGreaterThanOrEqual(1)
			expect(randomNumber).toBeLessThanOrEqual(10)
			expect(typeof randomBoolean).toBe('boolean')
		})

		it('should generate random dates', () => {
			const start = new Date('2020-01-01')
			const end = new Date('2021-01-01')
			const randomDate = testHelpers.data.randomDate(start, end)

			expect(randomDate.getTime()).toBeGreaterThanOrEqual(start.getTime())
			expect(randomDate.getTime()).toBeLessThanOrEqual(end.getTime())
		})
	})

	describe('Mock Helpers', () => {
		it('should mock console methods', () => {
			const consoleMock = testHelpers.mock.mockConsole()

			console.log('test message')
			console.warn('test warning')
			console.error('test error')

			expect(consoleMock.mockLog).toHaveBeenCalledWith('test message')
			expect(consoleMock.mockWarn).toHaveBeenCalledWith('test warning')
			expect(consoleMock.mockError).toHaveBeenCalledWith('test error')

			consoleMock.restore()
		})

		it('should create mock functions', () => {
			const mockFn = vi.fn()
			mockFn('test')

			expect(mockFn).toHaveBeenCalledWith('test')
			expect(mockFn).toHaveBeenCalledTimes(1)
		})

		it('should mock timers', () => {
			const timerMock = testHelpers.mock.mockTimers()
			const callback = vi.fn()

			setTimeout(callback, 1000)

			expect(callback).not.toHaveBeenCalled()

			timerMock.advanceTime(1000)

			expect(callback).toHaveBeenCalledOnce()

			timerMock.restore()
		})
	})

	describe('Cleanup Helpers', () => {
		it('should cleanup mocks', () => {
			const mockFn = vi.fn()
			mockFn('test')

			expect(mockFn).toHaveBeenCalledTimes(1)

			testHelpers.cleanup.cleanupMocks()

			// Mock should be cleared but still callable
			expect(mockFn).toHaveBeenCalledTimes(0)
		})

		it('should cleanup storage', () => {
			localStorage.setItem('test', 'value')
			sessionStorage.setItem('test', 'value')

			testHelpers.cleanup.cleanupStorage()

			expect(localStorage.getItem('test')).toBeNull()
			expect(sessionStorage.getItem('test')).toBeNull()
		})
	})
})
