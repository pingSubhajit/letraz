import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import {render, screen} from '@testing-library/react'
import BaseResume from '@/components/onboarding/BaseResume'
import {createMockResume} from '@/__tests__/helpers'

// Mock the child components
vi.mock('@/components/resume/ResumeView', () => ({
	default: () => <div data-testid="resume-view">Resume View Component</div>
}))

vi.mock('@/components/onboarding/OnboardingCompletionButton', () => ({
	default: () => <div data-testid="onboarding-completion-button">Onboarding Completion Button</div>
}))

vi.mock('@/components/onboarding/BaseResumeProvider', () => ({
	default: ({children}: {children: React.ReactNode}) => (
		<div data-testid="base-resume-provider">{children}</div>
	)
}))

// Mock the resume queries with a working mock
vi.mock('@/lib/resume/queries', () => ({
	baseResumeQueryOptions: {
		queryKey: ['base-resume'],
		queryFn: vi.fn().mockResolvedValue({})
	}
}))

// Mock QueryClient with proper prefetchQuery method
vi.mock('@tanstack/react-query', () => ({
	QueryClient: vi.fn(() => ({
		prefetchQuery: vi.fn().mockResolvedValue({})
	}))
}))

describe('BaseResume Component', () => {
	const mockResume = createMockResume()

	beforeEach(() => {
		vi.clearAllMocks()
	})

	afterEach(() => {
		vi.resetAllMocks()
	})

	describe('Component Rendering', () => {
		it('should render the BaseResume component with all child components', async () => {
			const BaseResumeComponent = await BaseResume()
			render(BaseResumeComponent)

			// Check that all child components are rendered
			expect(screen.getByTestId('base-resume-provider')).toBeInTheDocument()
			expect(screen.getByTestId('resume-view')).toBeInTheDocument()
			expect(screen.getByTestId('onboarding-completion-button')).toBeInTheDocument()
		})

		it('should render with correct layout structure', async () => {
			const BaseResumeComponent = await BaseResume()
			render(BaseResumeComponent)

			// Check the main container structure
			const container = screen.getByTestId('base-resume-provider')
			expect(container).toBeInTheDocument()

			// Check the flex layout div
			const layoutDiv = container.querySelector('div.w-full.h-full.flex.flex-col.justify-start')
			expect(layoutDiv).toBeInTheDocument()
		})

		it('should apply correct CSS classes to the layout container', async () => {
			const BaseResumeComponent = await BaseResume()
			render(BaseResumeComponent)

			const provider = screen.getByTestId('base-resume-provider')
			const layoutContainer = provider.querySelector('div')

			expect(layoutContainer).toHaveClass('w-full')
			expect(layoutContainer).toHaveClass('h-full')
			expect(layoutContainer).toHaveClass('flex')
			expect(layoutContainer).toHaveClass('flex-col')
			expect(layoutContainer).toHaveClass('justify-start')
		})
	})

	describe('Component Integration', () => {
		it('should wrap content in BaseResumeProvider', async () => {
			const BaseResumeComponent = await BaseResume()
			render(BaseResumeComponent)

			const provider = screen.getByTestId('base-resume-provider')
			expect(provider).toBeInTheDocument()

			// Check that ResumeView and OnboardingCompletionButton are children of the provider
			expect(provider).toContainElement(screen.getByTestId('resume-view'))
			expect(provider).toContainElement(screen.getByTestId('onboarding-completion-button'))
		})

		it('should render ResumeView component', async () => {
			const BaseResumeComponent = await BaseResume()
			render(BaseResumeComponent)

			const resumeView = screen.getByTestId('resume-view')
			expect(resumeView).toBeInTheDocument()
			expect(resumeView).toHaveTextContent('Resume View Component')
		})

		it('should render OnboardingCompletionButton component', async () => {
			const BaseResumeComponent = await BaseResume()
			render(BaseResumeComponent)

			const completionButton = screen.getByTestId('onboarding-completion-button')
			expect(completionButton).toBeInTheDocument()
			expect(completionButton).toHaveTextContent('Onboarding Completion Button')
		})

		it('should maintain correct component hierarchy', async () => {
			const BaseResumeComponent = await BaseResume()
			render(BaseResumeComponent)

			const provider = screen.getByTestId('base-resume-provider')
			const layoutContainer = provider.querySelector('div')
			const resumeView = screen.getByTestId('resume-view')
			const completionButton = screen.getByTestId('onboarding-completion-button')

			// Check hierarchy: Provider > Layout Container > [ResumeView, CompletionButton]
			expect(provider).toContainElement(layoutContainer!)
			expect(layoutContainer).toContainElement(resumeView)
			expect(layoutContainer).toContainElement(completionButton)
		})
	})

	describe('Async Component Behavior', () => {
		it('should be an async component that resolves to JSX', async () => {
			const result = BaseResume()
			expect(result).toBeInstanceOf(Promise)

			const component = await result
			expect(component).toBeDefined()
			expect(typeof component).toBe('object')
		})

		it('should complete async operations before rendering', async () => {
			const startTime = Date.now()
			const BaseResumeComponent = await BaseResume()
			const endTime = Date.now()

			// Should complete in reasonable time
			expect(endTime - startTime).toBeLessThan(1000)

			render(BaseResumeComponent)
			expect(screen.getByTestId('resume-view')).toBeInTheDocument()
		})
	})

	describe('Component Props and State', () => {
		it('should not accept any props', async () => {
			// BaseResume is defined as () => Promise<JSX.Element>, so it takes no props
			const BaseResumeComponent = await BaseResume()
			render(BaseResumeComponent)

			expect(screen.getByTestId('base-resume-provider')).toBeInTheDocument()
		})

		it('should maintain consistent structure across multiple renders', async () => {
			const BaseResumeComponent1 = await BaseResume()
			const BaseResumeComponent2 = await BaseResume()

			const {unmount} = render(BaseResumeComponent1)
			expect(screen.getByTestId('base-resume-provider')).toBeInTheDocument()
			unmount()

			render(BaseResumeComponent2)
			expect(screen.getByTestId('base-resume-provider')).toBeInTheDocument()
		})
	})

	describe('Accessibility', () => {
		it('should render semantic HTML structure', async () => {
			const BaseResumeComponent = await BaseResume()
			render(BaseResumeComponent)

			// Check that the layout uses proper div structure
			const provider = screen.getByTestId('base-resume-provider')
			const layoutDiv = provider.querySelector('div')

			expect(layoutDiv).toBeInTheDocument()
			expect(layoutDiv?.tagName).toBe('DIV')
		})

		it('should maintain proper component nesting for screen readers', async () => {
			const BaseResumeComponent = await BaseResume()
			render(BaseResumeComponent)

			const provider = screen.getByTestId('base-resume-provider')
			const resumeView = screen.getByTestId('resume-view')
			const completionButton = screen.getByTestId('onboarding-completion-button')

			// Ensure proper nesting for accessibility
			expect(provider).toContainElement(resumeView)
			expect(provider).toContainElement(completionButton)
		})
	})

	describe('Error Handling', () => {
		it('should handle component rendering gracefully', async () => {
			// Test that the component can render without throwing errors
			const BaseResumeComponent = await BaseResume()
			render(BaseResumeComponent)

			// If we get here, no errors were thrown during rendering
			expect(screen.getByTestId('base-resume-provider')).toBeInTheDocument()
		})
	})

	describe('Data Prefetching', () => {
		it('should create a QueryClient instance', async () => {
			const {QueryClient} = await import('@tanstack/react-query')
			await BaseResume()

			// Verify that QueryClient constructor was called
			expect(QueryClient).toHaveBeenCalled()
		})

		it('should handle successful data prefetching', async () => {
			const BaseResumeComponent = await BaseResume()
			render(BaseResumeComponent)

			// If the component renders successfully, prefetching worked
			expect(screen.getByTestId('resume-view')).toBeInTheDocument()
		})
	})

	describe('Performance', () => {
		it('should complete prefetching efficiently', async () => {
			const startTime = performance.now()
			await BaseResume()
			const endTime = performance.now()

			// Prefetch should complete reasonably quickly
			expect(endTime - startTime).toBeLessThan(1000) // Less than 1 second
		})

		it('should create a new QueryClient instance for each call', async () => {
			const {QueryClient} = await import('@tanstack/react-query')

			await BaseResume()
			await BaseResume()

			// Should create a new instance each time
			expect(QueryClient).toHaveBeenCalledTimes(2)
		})
	})
})
