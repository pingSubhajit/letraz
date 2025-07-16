// --- window.matchMedia mock setup (must be first) ---
const mockMatchMedia = vi.fn().mockImplementation(query => ({
	matches: false,
	media: query,
	onchange: null,
	addListener: vi.fn(),
	removeListener: vi.fn(),
	addEventListener: vi.fn(),
	removeEventListener: vi.fn(),
	dispatchEvent: vi.fn()
}))

// Always define window before importing the component
Object.defineProperty(global, 'window', {
	value: {
		matchMedia: mockMatchMedia
	},
	writable: true,
	configurable: true
})

// --- Imports ---
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import {render, screen} from '@testing-library/react'
import {Resume} from '@/lib/resume/types'
import ResumeViewer from '../ResumeViewer'

// --- Mocks ---
vi.mock('../themes/DEFAULT_THEME/DefaultTheme', () => ({
	__esModule: true,
	default: vi.fn((props: any) => (
		<div
			data-testid="default-theme"
			data-prefers-reduced-motion={props['data-prefers-reduced-motion']}
		>
			DefaultTheme
		</div>
	))
}))

// Mock motion from framer-motion
vi.mock('motion/react', () => ({
	motion: {
		div: ({children, className, style, initial, animate, transition}: any) => (
			<div
				className={className}
				style={style}
				data-testid="motion-div"
				data-initial={JSON.stringify(initial)}
				data-animate={JSON.stringify(animate)}
				data-transition={JSON.stringify(transition)}
			>
				{children}
			</div>
		)
	}
}))

// --- Test setup/teardown ---
beforeEach(() => {
	// Always define window and matchMedia before every test
	Object.defineProperty(global, 'window', {
		value: {
			matchMedia: mockMatchMedia
		},
		writable: true,
		configurable: true
	})
	mockMatchMedia.mockClear()
})

afterEach(() => {
	// Restore window after SSR test
	Object.defineProperty(global, 'window', {
		value: {
			matchMedia: mockMatchMedia
		},
		writable: true,
		configurable: true
	})
})

// --- Helper functions ---
const createMockResume = (): Resume => ({
	id: 'resume-1',
	sections: [
		{
			id: 'section-1',
			resume: 'resume-1',
			index: 0,
			type: 'Education',
			data: {
				id: 'edu-1',
				user: 'user-1',
				resume_section: 'section-1',
				institution_name: 'University',
				field_of_study: 'CS',
				country: {code: 'US', name: 'United States'},
				current: false,
				created_at: '',
				updated_at: '',
				started_from_month: 1,
				started_from_year: 2025,
				finished_at_month: 12,
				finished_at_year: 2025,
				degree: 'BSc',
				description: 'desc'
			}
		}
	],
	user: {
		id: 'pi-1',
		first_name: 'John',
		last_name: 'Doe',
		email: 'john@example.com',
		phone: '123',
		address: '123 St',
		city: 'City',
		country: {code: 'USA', name: 'United States of America'},
		postal: '12345',
		profile_text: 'summary',
		created_at: '',
		updated_at: ''
	},
	base: true,
	job: {
		title: 'Software Engineer',
		job_url: 'https://example.com/job',
		company_name: 'Tech Corp',
		location: 'Remote',
		currency: 'USD',
		salary_max: 100000,
		salary_min: 80000,
		requirements: ['JavaScript', 'React'],
		description: 'Software development role',
		responsibilities: ['Code development', 'Testing'],
		benefits: ['Health insurance', 'Remote work']
	}
})

// --- Tests ---
describe('ResumeViewer', () => {
	it('sets prefers-reduced-motion when window.matchMedia matches', () => {
		mockMatchMedia.mockImplementationOnce(() => ({
			matches: true,
			media: '(prefers-reduced-motion: reduce)',
			onchange: null,
			addListener: vi.fn(),
			removeListener: vi.fn(),
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
			dispatchEvent: vi.fn()
		}))
		render(<ResumeViewer resume={createMockResume()} />)
		const defaultTheme = screen.getByTestId('default-theme')
		expect(defaultTheme.getAttribute('data-prefers-reduced-motion')).toBe('true')
	})

	it('sets prefers-reduced-motion to false when window.matchMedia does not match', () => {
		mockMatchMedia.mockImplementationOnce(() => ({
			matches: false,
			media: '(prefers-reduced-motion: reduce)',
			onchange: null,
			addListener: vi.fn(),
			removeListener: vi.fn(),
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
			dispatchEvent: vi.fn()
		}))
		render(<ResumeViewer resume={createMockResume()} />)
		const defaultTheme = screen.getByTestId('default-theme')
		expect(defaultTheme.getAttribute('data-prefers-reduced-motion')).toBe('false')
	})

	it('throws when window is undefined (SSR)', () => {
		// Store original window
		const originalWindow = global.window

		/**
		 * Remove window for this test
		 * @ts-expect-error - Intentionally setting to undefined for SSR test
		 */
		global.window = undefined as any

		expect(() => {
			render(<ResumeViewer resume={createMockResume()} />)
		}).toThrow()

		// Restore window for other tests
		global.window = originalWindow
	})
})
