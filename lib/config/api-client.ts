import * as Sentry from '@sentry/nextjs'
import {ApiError} from '@/lib/config/api-types'

type RequestOptions = {
	method?: string
	headers?: Record<string, string>
	body?: any
	cookie?: string
	params?: Record<string, string | number | boolean | undefined | null>
	cache?: RequestCache
	next?: NextFetchRequestConfig
}

const buildUrlWithParams = (
	url: string,
	params?: RequestOptions['params']
): string => {
	if (!params) return url
	const filteredParams = Object.fromEntries(
		Object.entries(params).filter(
			([, value]) => value !== undefined && value !== null
		)
	)
	if (Object.keys(filteredParams).length === 0) return url
	const queryString = new URLSearchParams(
		filteredParams as Record<string, string>
	).toString()
	return `${url}?${queryString}`
}

// Create a separate function for getting server-side cookies that can be imported where needed
export const getServerCookies = async () => {
	if (typeof window !== 'undefined') return ''

	// Dynamic import next/headers only on server-side
	try {
		const {cookies} = await import('next/headers')
		const cookieStore = await cookies()

		// Define the cookies to be included in the request to the API
		const selectedCookies = ['__session']

		// Construct the Cookie header manually
		return selectedCookies
			.map((name) => {
				const cookie = cookieStore.get(name)
				return cookie ? `${cookie.name}=${cookie.value}` : null
			})
			.filter(Boolean) // Remove null values
			.join('; ')
	} catch (error) {
		Sentry.captureException(error)
		return ''
	}
}

const fetchApi = async <T>(
	url: string,
	options: RequestOptions = {}
): Promise<T> => {
	const {
		method = 'GET',
		headers = {},
		body,
		cookie,
		params,
		cache = 'no-store',
		next
	} = options

	// Get cookies from the request when running on server
	let cookieHeader = cookie
	if (typeof window === 'undefined' && !cookie) {
		cookieHeader = await getServerCookies()
	}

	const fullUrl = buildUrlWithParams(`${process.env.API_URL}${url}`, params)

	const response = await fetch(fullUrl, {
		method,
		headers: {
			'Content-Type': 'application/json',
			Accept: 'application/json',
			...headers,
			...(cookieHeader ? {Cookie: cookieHeader} : {})
		},
		body: body ? JSON.stringify(body) : undefined,
		credentials: 'include',
		cache,
		next
	})

	if (!response.ok) {
		const error = ((await response.json()) || response.statusText) as ApiError
		if (typeof window !== 'undefined') {
			// error handing
		}

		throw new Error(error.message)
	}

	if (response.status === 204) {
		return {} as T
	}

	return response.json()
}

export const api = {
	get: async <T>(url: string, options?: RequestOptions): Promise<T> => {
		return fetchApi<T>(url, {...options, method: 'GET'})
	},
	post: async <T>(url: string, body?: any, options?: RequestOptions): Promise<T> => {
		return fetchApi<T>(url, {...options, method: 'POST', body})
	},
	put: async <T>(url: string, body?: any, options?: RequestOptions): Promise<T> => {
		return fetchApi<T>(url, {...options, method: 'PUT', body})
	},
	patch: async <T>(url: string, body?: any, options?: RequestOptions): Promise<T> => {
		return fetchApi<T>(url, {...options, method: 'PATCH', body})
	},
	delete: async <T>(url: string, options?: RequestOptions): Promise<T> => {
		return fetchApi<T>(url, {...options, method: 'DELETE'})
	}
}
