import React from 'react'
import {render, screen} from '@testing-library/react'
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import type {DehydratedState} from '@tanstack/react-query'
import PersonalDetails from '@/components/onboarding/PersonalDetails'

// --- Mocks ---
vi.mock('@/components/animations/TextAnimations', () => ({
	default: ({text, className, type}: { text: string; className?: string; type?: string }) => (
		<div className={className} data-testid="text-animate" data-type={type}>
			{text}
		</div>
	)
}))

vi.mock('@/components/onboarding/PersonalDetailsForm', () => ({
	default: () => (
		<div data-testid="personal-details-form">
			Personal Details Form Component
		</div>
	)
}))

vi.mock('@tanstack/react-query', () => ({
	dehydrate: vi.fn(() => ({queries: []})),
	QueryClient: vi.fn(() => ({
		prefetchQuery: vi.fn()
	})),
	HydrationBoundary: ({children, state}: any) => (
		<div data-testid="hydration-boundary" data-state={JSON.stringify(state)}>
			{children}
		</div>
	)
}))

vi.mock('@/lib/user-info/queries', () => ({
	userInfoQueryOptions: {
		queryKey: ['user-info'],
		queryFn: vi.fn()
	}
}))

// --- Tests ---
describe('PersonalDetails', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	afterEach(() => {
		vi.clearAllMocks()
	})

	describe('Component Rendering', () => {
		it('renders the personal details component with all elements', async () => {
			const PersonalDetailsComponent = await PersonalDetails()
			render(PersonalDetailsComponent)

			// Check hydration boundary
			expect(screen.getByTestId('hydration-boundary')).toBeInTheDocument()

			// Check main container
			const container = document.querySelector('.w-full.h-full.flex.flex-col')
			expect(container).toBeInTheDocument()

			// Check heading text animation
			expect(screen.getByTestId('text-animate')).toBeInTheDocument()
			expect(screen.getByTestId('text-animate')).toHaveTextContent(/Let.s get to know you better/)

			// Check form component
			expect(screen.getByTestId('personal-details-form')).toBeInTheDocument()
		})

		it('renders text animation with correct styling', async () => {
			const PersonalDetailsComponent = await PersonalDetails()
			render(PersonalDetailsComponent)

			const textAnimation = screen.getByTestId('text-animate')
			expect(textAnimation).toHaveClass(
				'text-5xl',
				'leading-snug',
				'flex',
				'justify-center'
			)
		})

		it('wraps content in HydrationBoundary', async () => {
			const PersonalDetailsComponent = await PersonalDetails()
			render(PersonalDetailsComponent)

			const hydrationBoundary = screen.getByTestId('hydration-boundary')
			expect(hydrationBoundary).toBeInTheDocument()

			// Check that the boundary contains the main content
			const mainContainer = hydrationBoundary.querySelector('.w-full.h-full.flex.flex-col')
			expect(mainContainer).toBeInTheDocument()
		})
	})

	describe('Layout and Positioning', () => {
		it('positions heading text correctly', async () => {
			const PersonalDetailsComponent = await PersonalDetails()
			render(PersonalDetailsComponent)

			const headingContainer = document.querySelector('.mt-72')
			expect(headingContainer).toBeInTheDocument()
		})

		it('applies correct flex layout to main container', async () => {
			const PersonalDetailsComponent = await PersonalDetails()
			render(PersonalDetailsComponent)

			const mainContainer = document.querySelector('.w-full.h-full.flex.flex-col')
			expect(mainContainer).toHaveClass(
				'w-full',
				'h-full',
				'flex',
				'flex-col'
			)
		})
	})

	describe('Data Prefetching', () => {
		it('creates QueryClient and prefetches user info', async () => {
			const {QueryClient} = await import('@tanstack/react-query')
			const {userInfoQueryOptions} = await import('@/lib/user-info/queries')

			const mockQueryClient = {
				prefetchQuery: vi.fn()
			}
			vi.mocked(QueryClient).mockReturnValue(mockQueryClient as any)

			await PersonalDetails()

			expect(QueryClient).toHaveBeenCalled()
			expect(mockQueryClient.prefetchQuery).toHaveBeenCalledWith(userInfoQueryOptions)
		})

		it('dehydrates query client state', async () => {
			const {dehydrate} = await import('@tanstack/react-query')

			await PersonalDetails()

			expect(dehydrate).toHaveBeenCalled()
		})
	})

	describe('Component Structure', () => {
		it('has correct main container structure', async () => {
			const PersonalDetailsComponent = await PersonalDetails()
			render(PersonalDetailsComponent)

			const hydrationBoundary = screen.getByTestId('hydration-boundary')
			expect(hydrationBoundary).toBeInTheDocument()

			const mainContainer = hydrationBoundary.querySelector('.w-full.h-full.flex.flex-col')
			expect(mainContainer).toBeInTheDocument()
		})

		it('contains all required sections', async () => {
			const PersonalDetailsComponent = await PersonalDetails()
			render(PersonalDetailsComponent)

			// Heading section
			const headingSection = document.querySelector('.mt-72')
			expect(headingSection).toBeInTheDocument()

			// Form section
			const formSection = screen.getByTestId('personal-details-form')
			expect(formSection).toBeInTheDocument()
		})
	})

	describe('Text Content', () => {
		it('displays correct heading message', async () => {
			const PersonalDetailsComponent = await PersonalDetails()
			render(PersonalDetailsComponent)

			expect(screen.getByTestId('text-animate')).toHaveTextContent(/Let.s get to know you better/)
		})
	})

	describe('React Query Integration', () => {
		it('passes dehydrated state to HydrationBoundary', async () => {
			const {dehydrate} = await import('@tanstack/react-query')
			const mockDehydratedState: DehydratedState = {
				queries: [{
					queryKey: ['user-info'],
					queryHash: 'user-info',
					state: {
						data: undefined,
						dataUpdateCount: 0,
						dataUpdatedAt: 0,
						error: null,
						errorUpdateCount: 0,
						errorUpdatedAt: 0,
						fetchFailureCount: 0,
						fetchFailureReason: null,
						fetchMeta: null,
						isInvalidated: false,
						status: 'pending',
						fetchStatus: 'idle'
					}
				}],
				mutations: []
			}
			vi.mocked(dehydrate).mockReturnValue(mockDehydratedState)

			const PersonalDetailsComponent = await PersonalDetails()
			render(PersonalDetailsComponent)

			const hydrationBoundary = screen.getByTestId('hydration-boundary')
			const stateAttribute = hydrationBoundary.getAttribute('data-state')
			expect(stateAttribute).toBe(JSON.stringify(mockDehydratedState))
		})

		it('uses userInfoQueryOptions for prefetching', async () => {
			const {userInfoQueryOptions} = await import('@/lib/user-info/queries')
			const mockQueryClient = {
				prefetchQuery: vi.fn()
			}
			const {QueryClient} = await import('@tanstack/react-query')
			vi.mocked(QueryClient).mockReturnValue(mockQueryClient as any)

			await PersonalDetails()

			expect(mockQueryClient.prefetchQuery).toHaveBeenCalledWith(userInfoQueryOptions)
		})
	})

	describe('Responsive Design', () => {
		it('applies responsive text sizing', async () => {
			const PersonalDetailsComponent = await PersonalDetails()
			render(PersonalDetailsComponent)

			const textAnimation = screen.getByTestId('text-animate')
			expect(textAnimation).toHaveClass('text-5xl')
		})

		it('applies responsive margin to heading', async () => {
			const PersonalDetailsComponent = await PersonalDetails()
			render(PersonalDetailsComponent)

			const headingContainer = document.querySelector('.mt-72')
			expect(headingContainer).toHaveClass('mt-72')
		})
	})

	describe('Component Integration', () => {
		it('includes PersonalDetailsForm component', async () => {
			const PersonalDetailsComponent = await PersonalDetails()
			render(PersonalDetailsComponent)

			const formComponent = screen.getByTestId('personal-details-form')
			expect(formComponent).toBeInTheDocument()
		})

		it('centers heading text', async () => {
			const PersonalDetailsComponent = await PersonalDetails()
			render(PersonalDetailsComponent)

			const textAnimation = screen.getByTestId('text-animate')
			expect(textAnimation).toHaveClass('flex', 'justify-center')
		})
	})

	describe('Async Component Behavior', () => {
		it('returns a valid React component', async () => {
			const PersonalDetailsComponent = await PersonalDetails()
			expect(PersonalDetailsComponent).toBeDefined()
			expect(typeof PersonalDetailsComponent).toBe('object')
		})

		it('handles async operations correctly', async () => {
			// This test ensures the component can be awaited and rendered
			const PersonalDetailsComponent = await PersonalDetails()
			const {container} = render(PersonalDetailsComponent)
			expect(container.firstChild).toBeInTheDocument()
		})
	})
})
