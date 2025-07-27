import '@testing-library/jest-dom'
import {cleanup} from '@testing-library/react'
import {afterEach, beforeAll, vi} from 'vitest'

// Mock Next.js router
vi.mock('next/navigation', () => ({
	useRouter: () => ({
		push: vi.fn(),
		replace: vi.fn(),
		prefetch: vi.fn(),
		back: vi.fn(),
		forward: vi.fn(),
		refresh: vi.fn()
	}),
	usePathname: () => '/',
	useSearchParams: () => new URLSearchParams(),
	useParams: () => ({})
}))

// Mock Next.js Image component
vi.mock('next/image', () => ({
	default: (props: any) => {
		const {src, alt, ...rest} = props
		// Return a simple object that can be rendered as an img element
		return {
			type: 'img',
			props: {src, alt, ...rest}
		}
	}
}))

// Mock Next.js Link component
vi.mock('next/link', () => ({
	default: (props: any) => {
		const {children, href, ...rest} = props
		// Return a simple object that can be rendered as an anchor element
		return {
			type: 'a',
			props: {href, ...rest, children}
		}
	}
}))

// Mock Clerk authentication (if using Clerk)
vi.mock('@clerk/nextjs', () => ({
	useUser: () => ({
		user: null,
		isLoaded: true,
		isSignedIn: false
	}),
	useAuth: () => ({
		isLoaded: true,
		isSignedIn: false,
		userId: null,
		sessionId: null,
		getToken: vi.fn(),
		signOut: vi.fn()
	}),
	SignInButton: (props: any) => ({
		type: 'div',
		props: {'data-testid': 'sign-in-button', children: props.children}
	}),
	SignUpButton: (props: any) => ({
		type: 'div',
		props: {'data-testid': 'sign-up-button', children: props.children}
	}),
	UserButton: () => ({
		type: 'div',
		props: {'data-testid': 'user-button'}
	}),
	ClerkProvider: (props: any) => ({
		type: 'div',
		props: {children: props.children}
	})
}))

// Mock React Query for API state management
vi.mock('@tanstack/react-query', async () => {
	const actual = await vi.importActual('@tanstack/react-query')
	return {
		...actual,
		useQuery: vi.fn(),
		useMutation: vi.fn(),
		useQueryClient: vi.fn()
	}
})

// Mock Framer Motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
	motion: {
		div: 'div',
		span: 'span',
		button: 'button',
		a: 'a',
		img: 'img',
		h1: 'h1',
		h2: 'h2',
		h3: 'h3',
		p: 'p',
		section: 'section',
		article: 'article',
		nav: 'nav',
		header: 'header',
		footer: 'footer',
		main: 'main',
		aside: 'aside',
		ul: 'ul',
		li: 'li',
		form: 'form',
		input: 'input',
		textarea: 'textarea',
		select: 'select',
		option: 'option',
		label: 'label'
	},
	AnimatePresence: (props: any) => props.children,
	useAnimation: () => ({
		start: vi.fn(),
		stop: vi.fn(),
		set: vi.fn()
	}),
	useMotionValue: (initial: any) => ({get: () => initial, set: vi.fn()}),
	useTransform: (value: any, input: any, output: any) => value,
	useSpring: (value: any) => value
}))

// Mock PostHog analytics
vi.mock('posthog-js/react', () => ({
	usePostHog: () => ({
		capture: vi.fn(),
		identify: vi.fn(),
		reset: vi.fn()
	}),
	PostHogProvider: (props: any) => props.children
}))

// Global test setup and configuration

// Clean up after each test automatically
afterEach(() => {
	cleanup()
})

// Set up global mocks before all tests
beforeAll(() => {
	// Mock window.matchMedia for responsive components
	Object.defineProperty(window, 'matchMedia', {
		writable: true,
		value: vi.fn().mockImplementation((query) => ({
			matches: false,
			media: query,
			onchange: null,
			addListener: vi.fn(), // deprecated
			removeListener: vi.fn(), // deprecated
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
			dispatchEvent: vi.fn()
		}))
	})

	// Mock window.ResizeObserver for components that use it
	global.ResizeObserver = vi.fn((callback) => ({
		observe: vi.fn(),
		unobserve: vi.fn(),
		disconnect: vi.fn()
	}))

	// Mock IntersectionObserver for components that use it
	global.IntersectionObserver = vi.fn((callback) => ({
		observe: vi.fn(),
		unobserve: vi.fn(),
		disconnect: vi.fn(),
		takeRecords: vi.fn(() => []),
		root: null,
		rootMargin: '',
		thresholds: []
	}))

	// Mock scrollTo for components that use scrolling
	window.scrollTo = vi.fn()
	Element.prototype.scrollTo = vi.fn()

	// Mock HTMLElement.prototype.scrollIntoView
	HTMLElement.prototype.scrollIntoView = vi.fn()

	/*
	 * Mock console methods to reduce noise in tests (optional)
	 * Uncomment if you want to suppress console output during tests
	 * vi.spyOn(console, 'log').mockImplementation(() => {})
	 * vi.spyOn(console, 'warn').mockImplementation(() => {})
	 * vi.spyOn(console, 'error').mockImplementation(() => {})
	 */

	// Mock fetch for API testing
	global.fetch = vi.fn().mockResolvedValue({
		ok: true,
		status: 200,
		statusText: 'OK',
		json: vi.fn().mockResolvedValue({}),
		text: vi.fn().mockResolvedValue('{}'),
		headers: new Headers(),
		url: '',
		redirected: false,
		type: 'basic' as ResponseType,
		body: null,
		bodyUsed: false,
		clone: vi.fn(),
		arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(0)),
		blob: vi.fn().mockResolvedValue(new Blob()),
		formData: vi.fn().mockResolvedValue(new FormData()),
		bytes: vi.fn().mockResolvedValue(new Uint8Array())
	} as Response) as any

	// Mock localStorage and sessionStorage
	const localStorageMock = {
		getItem: vi.fn(() => null), // Return null by default to match browser behavior
		setItem: vi.fn(),
		removeItem: vi.fn(),
		clear: vi.fn(),
		length: 0,
		key: vi.fn()
	}

	const sessionStorageMock = {
		getItem: vi.fn(() => null), // Return null by default to match browser behavior
		setItem: vi.fn(),
		removeItem: vi.fn(),
		clear: vi.fn(),
		length: 0,
		key: vi.fn()
	}

	Object.defineProperty(window, 'localStorage', {
		value: localStorageMock,
		writable: true
	})

	Object.defineProperty(window, 'sessionStorage', {
		value: sessionStorageMock,
		writable: true
	})

	// Mock URL.createObjectURL and URL.revokeObjectURL for file handling
	global.URL.createObjectURL = vi.fn(() => 'mocked-url')
	global.URL.revokeObjectURL = vi.fn()

	// Mock FileReader for file upload testing
	const MockFileReader = vi.fn().mockImplementation(() => ({
		readAsDataURL: vi.fn(),
		readAsText: vi.fn(),
		readAsArrayBuffer: vi.fn(),
		readAsBinaryString: vi.fn(),
		onload: null,
		onerror: null,
		onabort: null,
		onloadstart: null,
		onloadend: null,
		onprogress: null,
		result: null,
		error: null,
		readyState: 0,
		EMPTY: 0,
		LOADING: 1,
		DONE: 2,
		abort: vi.fn()
	}))

	// Add static properties to the mock constructor
	;(MockFileReader as any).EMPTY = 0
	;(MockFileReader as any).LOADING = 1
	;(MockFileReader as any).DONE = 2

	global.FileReader = MockFileReader as any


})

// Global test utilities and helpers
export const mockConsole = {
	log: vi.spyOn(console, 'log').mockImplementation(() => {}),
	warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
	error: vi.spyOn(console, 'error').mockImplementation(() => {}),
	info: vi.spyOn(console, 'info').mockImplementation(() => {})
}

// Helper to restore console methods
export const restoreConsole = () => {
	mockConsole.log.mockRestore()
	mockConsole.warn.mockRestore()
	mockConsole.error.mockRestore()
	mockConsole.info.mockRestore()
}

// Helper to create mock fetch responses
export const createMockResponse = (data: any, status = 200) => {
	return {
		ok: status >= 200 && status < 300,
		status,
		statusText: status === 200 ? 'OK' : 'Error',
		json: vi.fn().mockResolvedValue(data),
		text: vi.fn().mockResolvedValue(JSON.stringify(data)),
		headers: new Headers(),
		url: '',
		redirected: false,
		type: 'basic' as ResponseType,
		body: null,
		bodyUsed: false,
		clone: vi.fn(),
		arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(0)),
		blob: vi.fn().mockResolvedValue(new Blob()),
		formData: vi.fn().mockResolvedValue(new FormData()),
		bytes: vi.fn().mockResolvedValue(new Uint8Array())
	} as Response
}

// Helper to mock successful API responses
export const mockApiSuccess = (data: any, status = 200) => {
	;(global.fetch as any).mockResolvedValueOnce(createMockResponse(data, status))
}

// Helper to mock API errors
export const mockApiError = (status = 500, message = 'Internal Server Error') => {
	;(global.fetch as any).mockResolvedValueOnce(createMockResponse(
		{error: {message}}, 
		status
	))
}

// Helper to reset all mocks
export const resetAllMocks = () => {
	vi.clearAllMocks()
	vi.resetAllMocks()
}

// DOM testing utilities
export const waitForElementToBeRemoved = async (element: HTMLElement) => {
	const {waitForElementToBeRemoved: waitFor} = await import('@testing-library/react')
	return waitFor(element)
}

// Custom error for testing error boundaries
export class TestError extends Error {
	constructor(message = 'Test error') {
		super(message)
		this.name = 'TestError'
	}
}

// Helper to trigger error boundary
export const ThrowError = (props: { shouldThrow?: boolean; error?: Error }) => {
	if (props.shouldThrow) {
		throw props.error || new TestError()
	}
	return null
}
