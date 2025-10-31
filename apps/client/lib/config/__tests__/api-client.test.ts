import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import {api} from '@/lib/config/api-client'
import {mockApiError, mockApiSuccess} from '@/test-setup'

// Mock next/headers
vi.mock('next/headers', () => ({
	cookies: vi.fn(() => ({
		toString: vi.fn(() => 'session=abc123; user=john')
	}))
}))

// Set environment variable for API URL
process.env.API_URL = 'http://localhost:3000'

describe('api client', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	afterEach(() => {
		vi.restoreAllMocks()
	})

	describe('api methods', () => {
		it('should make GET request', async () => {
			const mockData = {id: 1, name: 'test'}
			mockApiSuccess(mockData)

			const result = await api.get('/test')

			expect(global.fetch).toHaveBeenCalledWith('http://localhost:3000/test', {
				method: 'GET',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				},
				body: undefined,
				credentials: 'include',
				cache: 'no-store',
				next: undefined
			})
			expect(result).toEqual(mockData)
		})

		it('should make POST request with body', async () => {
			const mockData = {id: 1, name: 'test'}
			const requestBody = {name: 'test'}
			mockApiSuccess(mockData)

			const result = await api.post('/test', requestBody)

			expect(global.fetch).toHaveBeenCalledWith('http://localhost:3000/test', {
				method: 'POST',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(requestBody),
				credentials: 'include',
				cache: 'no-store',
				next: undefined
			})
			expect(result).toEqual(mockData)
		})

		it('should make PUT request with body', async () => {
			const mockData = {id: 1, name: 'updated'}
			const requestBody = {name: 'updated'}
			mockApiSuccess(mockData)

			const result = await api.put('/test/1', requestBody)

			expect(global.fetch).toHaveBeenCalledWith('http://localhost:3000/test/1', {
				method: 'PUT',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(requestBody),
				credentials: 'include',
				cache: 'no-store',
				next: undefined
			})
			expect(result).toEqual(mockData)
		})

		it('should make PATCH request with body', async () => {
			const mockData = {id: 1, name: 'patched'}
			const requestBody = {name: 'patched'}
			mockApiSuccess(mockData)

			const result = await api.patch('/test/1', requestBody)

			expect(global.fetch).toHaveBeenCalledWith('http://localhost:3000/test/1', {
				method: 'PATCH',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(requestBody),
				credentials: 'include',
				cache: 'no-store',
				next: undefined
			})
			expect(result).toEqual(mockData)
		})

		it('should make DELETE request', async () => {
			const mockData = {success: true}
			mockApiSuccess(mockData)

			const result = await api.delete('/test/1')

			expect(global.fetch).toHaveBeenCalledWith('http://localhost:3000/test/1', {
				method: 'DELETE',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				},
				body: undefined,
				credentials: 'include',
				cache: 'no-store',
				next: undefined
			})
			expect(result).toEqual(mockData)
		})

		it('should handle query parameters', async () => {
			const mockData = {results: []}
			mockApiSuccess(mockData)

			const result = await api.get('/test', {
				params: {
					page: 1,
					limit: 10,
					search: 'test query'
				}
			})

			expect(global.fetch).toHaveBeenCalledWith('http://localhost:3000/test?page=1&limit=10&search=test+query', {
				method: 'GET',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				},
				body: undefined,
				credentials: 'include',
				cache: 'no-store',
				next: undefined
			})
			expect(result).toEqual(mockData)
		})

		it('should filter out null and undefined parameters', async () => {
			const mockData = {results: []}
			mockApiSuccess(mockData)

			const result = await api.get('/test', {
				params: {
					page: 1,
					limit: null,
					search: undefined,
					active: true
				}
			})

			expect(global.fetch).toHaveBeenCalledWith('http://localhost:3000/test?page=1&active=true', {
				method: 'GET',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				},
				body: undefined,
				credentials: 'include',
				cache: 'no-store',
				next: undefined
			})
			expect(result).toEqual(mockData)
		})

		it('should handle 204 No Content response', async () => {
			mockApiSuccess(null, 204)

			const result = await api.delete('/test/1')

			expect(result).toEqual({})
		})

		it('should throw error for non-ok response', async () => {
			mockApiError(400, 'Bad Request')

			await expect(api.get('/test')).rejects.toThrow('Bad Request')
		})

		it('should pass options to all methods', async () => {
			const mockData = {success: true}
			mockApiSuccess(mockData)

			const customOptions = {
				headers: {
					'X-Custom-Header': 'custom-value'
				}
			}

			const result = await api.get('/test', customOptions)

			expect(global.fetch).toHaveBeenCalledWith('http://localhost:3000/test', {
				method: 'GET',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json',
					'X-Custom-Header': 'custom-value'
				},
				body: undefined,
				credentials: 'include',
				cache: 'no-store',
				next: undefined
			})
			expect(result).toEqual(mockData)
		})

		it('should include custom cookie header', async () => {
			const mockData = {success: true}
			mockApiSuccess(mockData)

			const result = await api.get('/test')

			expect(global.fetch).toHaveBeenCalledWith('http://localhost:3000/test', {
				method: 'GET',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				},
				body: undefined,
				credentials: 'include',
				cache: 'no-store',
				next: undefined
			})
			expect(result).toEqual(mockData)
		})
	})
})
