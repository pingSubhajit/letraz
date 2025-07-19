import {expect, type MockedFunction, vi} from 'vitest'
import {createMockApiError, MockApiError} from './mock-factories'

// API mocking utilities for testing HTTP requests

export interface MockRequestConfig {
  method?: string
  url?: string | RegExp
  status?: number
  delay?: number
  headers?: Record<string, string>
}

export interface MockResponseConfig<T = any> {
  data?: T
  status?: number
  statusText?: string
  headers?: Record<string, string>
  delay?: number
}

// Global fetch mock manager
class FetchMockManager {
	private mocks: Map<string, any> = new Map()

	private defaultMock: any = null

	// Set up a mock for a specific URL pattern
	mockRequest<T = any>(
		pattern: string | RegExp,
		response: MockResponseConfig<T> | ((url: string, init?: RequestInit) => MockResponseConfig<T>)
	): void {
		const key = pattern instanceof RegExp ? pattern.source : pattern
		this.mocks.set(key, {pattern, response})
	}

	// Set up a default mock for all unmatched requests
	mockDefault<T = any>(response: MockResponseConfig<T>): void {
		this.defaultMock = response
	}

	// Clear all mocks
	clearMocks(): void {
		this.mocks.clear()
		this.defaultMock = null
	}

	// Get mock response for a URL
	getMockResponse(url: string, init?: RequestInit): MockResponseConfig | null {
		// Check specific mocks first
		for (const [key, mock] of this.mocks.entries()) {
			const {pattern, response} = mock
			let matches = false

			if (pattern instanceof RegExp) {
				matches = pattern.test(url)
			} else {
				matches = url.includes(pattern)
			}

			if (matches) {
				return typeof response === 'function' ? response(url, init) : response
			}
		}

		// Return default mock if no specific match
		return this.defaultMock
	}
}

// Global instance
const fetchMockManager = new FetchMockManager()

// Set up the global fetch mock
const setupFetchMock = (): void => {
	global.fetch = vi.fn().mockImplementation(async (url: string, init?: RequestInit) => {
		const mockConfig = fetchMockManager.getMockResponse(url, init)

		if (!mockConfig) {
			throw new Error(`No mock configured for URL: ${url}`)
		}

		// Simulate network delay if specified
		if (mockConfig.delay) {
			await new Promise(resolve => setTimeout(resolve, mockConfig.delay))
		}

		const {
			data = null,
			status = 200,
			statusText = 'OK',
			headers = {}
		} = mockConfig

		const response = {
			ok: status >= 200 && status < 300,
			status,
			statusText,
			headers: new Headers(headers),
			url,
			redirected: false,
			type: 'basic' as ResponseType,
			body: null,
			bodyUsed: false,
			clone: vi.fn(),
			json: vi.fn().mockResolvedValue(data),
			text: vi.fn().mockResolvedValue(JSON.stringify(data)),
			arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(0)),
			blob: vi.fn().mockResolvedValue(new Blob()),
			formData: vi.fn().mockResolvedValue(new FormData()),
			bytes: vi.fn().mockResolvedValue(new Uint8Array())
		}

		return response as Response
	})
}

// API mock utilities
export const apiMocks = {
	// Set up fetch mock
	setup: setupFetchMock,

	// Mock a successful API response
	mockSuccess: <T = any>(
		url: string | RegExp,
		data: T,
		options: Omit<MockResponseConfig<T>, 'data'> = {}
	): void => {
		fetchMockManager.mockRequest(url, {
			data,
			status: 200,
			statusText: 'OK',
			...options
		})
	},

	// Mock an API error response
	mockError: (
		url: string | RegExp,
		error: Partial<MockApiError> = {},
		options: Omit<MockResponseConfig, 'data'> = {}
	): void => {
		const errorResponse = createMockApiError(error)
		fetchMockManager.mockRequest(url, {
			data: errorResponse,
			status: error.status || 500,
			statusText: error.statusText || 'Internal Server Error',
			...options
		})
	},

	// Mock network failure
	mockNetworkError: (url: string | RegExp, message = 'Network Error'): void => {
		fetchMockManager.mockRequest(url, () => {
			throw new Error(message)
		})
	},

	// Mock timeout
	mockTimeout: (url: string | RegExp, delay = 5000): void => {
		fetchMockManager.mockRequest(url, {
			data: null,
			delay,
			status: 408,
			statusText: 'Request Timeout'
		})
	},

	// Mock different HTTP methods
	mockGet: <T = any>(url: string | RegExp, data: T, options?: MockResponseConfig<T>): void => {
		apiMocks.mockSuccess(url, data, options)
	},

	mockPost: <T = any>(url: string | RegExp, data: T, options?: MockResponseConfig<T>): void => {
		apiMocks.mockSuccess(url, data, {status: 201, statusText: 'Created', ...options})
	},

	mockPut: <T = any>(url: string | RegExp, data: T, options?: MockResponseConfig<T>): void => {
		apiMocks.mockSuccess(url, data, options)
	},

	mockDelete: (url: string | RegExp, options?: MockResponseConfig): void => {
		apiMocks.mockSuccess(url, null, {status: 204, statusText: 'No Content', ...options})
	},

	// Mock paginated responses
	mockPaginated: <T = any>(
		url: string | RegExp,
		items: T[],
		page = 1,
		limit = 10,
		total?: number
	): void => {
		const totalItems = total || items.length
		const totalPages = Math.ceil(totalItems / limit)
		const startIndex = (page - 1) * limit
		const endIndex = startIndex + limit
		const paginatedItems = items.slice(startIndex, endIndex)

		const paginatedResponse = {
			data: paginatedItems,
			pagination: {
				page,
				limit,
				total: totalItems,
				totalPages,
				hasNext: page < totalPages,
				hasPrev: page > 1
			}
		}

		apiMocks.mockSuccess(url, paginatedResponse)
	},

	// Clear all mocks
	clearAll: (): void => {
		fetchMockManager.clearMocks()
		vi.clearAllMocks()
	},

	// Reset fetch mock
	reset: (): void => {
		apiMocks.clearAll()
		setupFetchMock()
	},

	// Verify fetch was called
	verifyFetchCalled: (url?: string | RegExp, times?: number): void => {
		const fetchMock = global.fetch as MockedFunction<typeof fetch>

		if (url) {
			const calls = fetchMock.mock.calls.filter(call => {
				const callUrl = call[0] as string
				if (url instanceof RegExp) {
					return url.test(callUrl)
				}
				return callUrl.includes(url)
			})

			if (times !== undefined) {
				expect(calls).toHaveLength(times)
			} else {
				expect(calls.length).toBeGreaterThan(0)
			}
		} else {
			if (times !== undefined) {
				expect(fetchMock).toHaveBeenCalledTimes(times)
			} else {
				expect(fetchMock).toHaveBeenCalled()
			}
		}
	},

	// Get fetch call arguments
	getFetchCalls: (): Array<[string, RequestInit?]> => {
		const fetchMock = global.fetch as MockedFunction<typeof fetch>
		return fetchMock.mock.calls as Array<[string, RequestInit?]>
	},

	// Mock specific endpoints commonly used in the app
	mockAuth: {
		login: (user: any) => apiMocks.mockPost('/api/auth/login', {user, token: 'mock-token'}),
		logout: () => apiMocks.mockPost('/api/auth/logout', {success: true}),
		refresh: (token: string) => apiMocks.mockPost('/api/auth/refresh', {token}),
		me: (user: any) => apiMocks.mockGet('/api/auth/me', {user})
	},

	mockResume: {
		list: (resumes: any[]) => apiMocks.mockGet('/api/resumes', resumes),
		get: (resume: any) => apiMocks.mockGet(/\/api\/resumes\/\w+/, resume),
		create: (resume: any) => apiMocks.mockPost('/api/resumes', resume),
		update: (resume: any) => apiMocks.mockPut(/\/api\/resumes\/\w+/, resume),
		delete: () => apiMocks.mockDelete(/\/api\/resumes\/\w+/)
	},

	mockJob: {
		list: (jobs: any[]) => apiMocks.mockGet('/api/jobs', jobs),
		get: (job: any) => apiMocks.mockGet(/\/api\/jobs\/\w+/, job),
		search: (jobs: any[]) => apiMocks.mockGet('/api/jobs/search', jobs)
	}
}

// Initialize fetch mock
apiMocks.setup()

export {fetchMockManager}
