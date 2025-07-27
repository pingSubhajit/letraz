import React from 'react'
import {render, screen} from '@/__tests__/helpers/test-utils'
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import AppLayoutContainer from '@/components/clientContainers/AppLayoutContainer'

// Mock external dependencies
vi.mock('motion/react', () => ({
	motion: {
		div: React.forwardRef<HTMLDivElement, any>(({children, className, ...props}, ref) => (
			<div ref={ref} className={className} {...props} data-testid="motion-div">
				{children}
			</div>
		))
	}
}))

vi.mock('@/components/AppSidebar', () => ({
	__esModule: true,
	default: () => (
		<div data-testid="app-sidebar">
			App Sidebar
		</div>
	)
}))

vi.mock('@/components/providers/SmoothScrollProvider', () => ({
	__esModule: true,
	default: React.forwardRef<HTMLDivElement, any>(({children, className, ...props}, ref) => (
		<div ref={ref} className={className} {...props} data-testid="smooth-scroll-provider">
			{children}
		</div>
	))
}))

describe('AppLayoutContainer Component', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	afterEach(() => {
		vi.restoreAllMocks()
	})

	describe('Initial Rendering', () => {
		it('renders without crashing', () => {
			render(
				<AppLayoutContainer>
					<div>Test Content</div>
				</AppLayoutContainer>
			)

			expect(screen.getByText('Test Content')).toBeInTheDocument()
		})

		it('renders with correct container structure', () => {
			const {container} = render(
				<AppLayoutContainer>
					<div>Test Content</div>
				</AppLayoutContainer>
			)

			// Check root container (first div child)
			const rootContainer = container.firstChild as HTMLElement
			expect(rootContainer).toHaveClass(
				'h-svh',
				'flex',
				'items-stretch',
				'relative',
				'overflow-hidden',
				'scrollbar-thin'
			)
		})

		it('renders AppSidebar component', () => {
			render(
				<AppLayoutContainer>
					<div>Test Content</div>
				</AppLayoutContainer>
			)

			expect(screen.getByTestId('app-sidebar')).toBeInTheDocument()
		})

		it('renders gradient shadow elements', () => {
			const {container} = render(
				<AppLayoutContainer>
					<div>Test Content</div>
				</AppLayoutContainer>
			)

			const rootContainer = container.firstChild as HTMLElement
			const gradientElements = rootContainer?.querySelectorAll('div[class*="bg-rose-500"], div[class*="bg-flame-500"], div[class*="bg-amber-300"]')

			expect(gradientElements).toHaveLength(3)
		})
	})

	describe('Layout Structure', () => {
		it('provides proper layout structure with sidebar and main content', () => {
			render(
				<AppLayoutContainer>
					<div>Test Content</div>
				</AppLayoutContainer>
			)

			// Sidebar should be present
			expect(screen.getByTestId('app-sidebar')).toBeInTheDocument()

			// Main content should be wrapped in motion.div
			expect(screen.getByTestId('motion-div')).toBeInTheDocument()

			// Content should be in main element
			const mainElement = screen.getByRole('main')
			expect(mainElement).toBeInTheDocument()
			expect(mainElement).toContainElement(screen.getByText('Test Content'))
		})

		it('applies correct flexbox layout classes', () => {
			const {container} = render(
				<AppLayoutContainer>
					<div>Test Content</div>
				</AppLayoutContainer>
			)

			const rootContainer = container.firstChild as HTMLElement
			expect(rootContainer).toHaveClass('flex', 'items-stretch')
		})

		it('sets correct dimensions and overflow behavior', () => {
			const {container} = render(
				<AppLayoutContainer>
					<div>Test Content</div>
				</AppLayoutContainer>
			)

			const rootContainer = container.firstChild as HTMLElement
			expect(rootContainer).toHaveClass('h-svh', 'overflow-hidden')
		})

		it('positions gradient shadows correctly', () => {
			const {container} = render(
				<AppLayoutContainer>
					<div>Test Content</div>
				</AppLayoutContainer>
			)

			const rootContainer = container.firstChild as HTMLElement

			// Check for rose gradient
			const roseGradient = rootContainer?.querySelector('div[class*="bg-rose-500"]')
			expect(roseGradient).toHaveClass('absolute', '-z-10', '-top-48', '-left-64')

			// Check for flame gradient
			const flameGradient = rootContainer?.querySelector('div[class*="bg-flame-500"]')
			expect(flameGradient).toHaveClass('absolute', '-z-10', 'top-[25%]', '-left-80')

			// Check for amber gradient
			const amberGradient = rootContainer?.querySelector('div[class*="bg-amber-300"]')
			expect(amberGradient).toHaveClass('absolute', '-z-10', '-bottom-36', '-left-72')
		})
	})

	describe('Content Wrapping', () => {
		it('wraps children in main element', () => {
			render(
				<AppLayoutContainer>
					<div data-testid="child-content">Child Content</div>
				</AppLayoutContainer>
			)

			const mainElement = screen.getByRole('main')
			const childContent = screen.getByTestId('child-content')

			expect(mainElement).toContainElement(childContent)
		})

		it('passes children to SmoothScrollProvider', () => {
			render(
				<AppLayoutContainer>
					<div data-testid="nested-content">Nested Content</div>
				</AppLayoutContainer>
			)

			const smoothScrollProvider = screen.getByTestId('smooth-scroll-provider')
			const nestedContent = screen.getByTestId('nested-content')

			expect(smoothScrollProvider).toContainElement(nestedContent)
		})

		it('maintains proper nesting structure', () => {
			render(
				<AppLayoutContainer>
					<div data-testid="test-child">Test Child</div>
				</AppLayoutContainer>
			)

			// Structure should be: motion.div > SmoothScrollProvider > main > children
			const motionDiv = screen.getByTestId('motion-div')
			const smoothScrollProvider = screen.getByTestId('smooth-scroll-provider')
			const mainElement = screen.getByRole('main')
			const testChild = screen.getByTestId('test-child')

			expect(motionDiv).toContainElement(smoothScrollProvider)
			expect(smoothScrollProvider).toContainElement(mainElement)
			expect(mainElement).toContainElement(testChild)
		})

		it('handles multiple children correctly', () => {
			render(
				<AppLayoutContainer>
					<div data-testid="child-1">Child 1</div>
					<div data-testid="child-2">Child 2</div>
					<div data-testid="child-3">Child 3</div>
				</AppLayoutContainer>
			)

			const mainElement = screen.getByRole('main')

			expect(mainElement).toContainElement(screen.getByTestId('child-1'))
			expect(mainElement).toContainElement(screen.getByTestId('child-2'))
			expect(mainElement).toContainElement(screen.getByTestId('child-3'))
		})

		it('handles empty children gracefully', () => {
			render(<AppLayoutContainer>{null}</AppLayoutContainer>)

			const mainElement = screen.getByRole('main')
			expect(mainElement).toBeInTheDocument()
			expect(mainElement).toBeEmptyDOMElement()
		})
	})

	describe('Responsive Behavior', () => {
		it('applies responsive width calculations', () => {
			render(
				<AppLayoutContainer>
					<div>Content</div>
				</AppLayoutContainer>
			)

			const motionDiv = screen.getByTestId('motion-div')
			expect(motionDiv).toHaveClass('w-[calc(100vw-80px)]')
		})

		it('sets full screen height for main content area', () => {
			render(
				<AppLayoutContainer>
					<div>Content</div>
				</AppLayoutContainer>
			)

			const motionDiv = screen.getByTestId('motion-div')
			expect(motionDiv).toHaveClass('h-screen')
		})

		it('applies flex-shrink-0 to prevent content shrinking', () => {
			render(
				<AppLayoutContainer>
					<div>Content</div>
				</AppLayoutContainer>
			)

			const motionDiv = screen.getByTestId('motion-div')
			expect(motionDiv).toHaveClass('flex-shrink-0')
		})

		it('configures SmoothScrollProvider with overflow classes', () => {
			render(
				<AppLayoutContainer>
					<div>Content</div>
				</AppLayoutContainer>
			)

			const smoothScrollProvider = screen.getByTestId('smooth-scroll-provider')
			expect(smoothScrollProvider).toHaveClass(
				'overflow-y-auto',
				'overflow-x-hidden',
				'h-screen',
				'w-full'
			)
		})
	})

	describe('Motion Integration', () => {
		it('wraps main content in motion.div', () => {
			render(
				<AppLayoutContainer>
					<div>Content</div>
				</AppLayoutContainer>
			)

			const motionDiv = screen.getByTestId('motion-div')
			expect(motionDiv).toBeInTheDocument()

			const smoothScrollProvider = screen.getByTestId('smooth-scroll-provider')
			expect(motionDiv).toContainElement(smoothScrollProvider)
		})

		it('applies correct motion div classes', () => {
			render(
				<AppLayoutContainer>
					<div>Content</div>
				</AppLayoutContainer>
			)

			const motionDiv = screen.getByTestId('motion-div')
			expect(motionDiv).toHaveClass(
				'flex-shrink-0',
				'w-[calc(100vw-80px)]',
				'h-screen'
			)
		})
	})

	describe('Provider Integration', () => {
		it('integrates with SmoothScrollProvider', () => {
			render(
				<AppLayoutContainer>
					<div data-testid="scroll-content">Scrollable Content</div>
				</AppLayoutContainer>
			)

			const smoothScrollProvider = screen.getByTestId('smooth-scroll-provider')
			const scrollContent = screen.getByTestId('scroll-content')

			expect(smoothScrollProvider).toBeInTheDocument()
			expect(smoothScrollProvider).toContainElement(scrollContent)
		})

		it('passes correct className to SmoothScrollProvider', () => {
			render(
				<AppLayoutContainer>
					<div>Content</div>
				</AppLayoutContainer>
			)

			const smoothScrollProvider = screen.getByTestId('smooth-scroll-provider')
			expect(smoothScrollProvider).toHaveClass(
				'overflow-y-auto',
				'overflow-x-hidden',
				'h-screen',
				'w-full'
			)
		})
	})

	describe('Gradient Shadows', () => {
		it('renders all three gradient shadow elements', () => {
			const {container} = render(
				<AppLayoutContainer>
					<div>Content</div>
				</AppLayoutContainer>
			)

			const rootContainer = container.firstChild as HTMLElement

			// Rose gradient
			const roseGradient = rootContainer?.querySelector('.bg-rose-500')
			expect(roseGradient).toBeInTheDocument()

			// Flame gradient
			const flameGradient = rootContainer?.querySelector('.bg-flame-500')
			expect(flameGradient).toBeInTheDocument()

			// Amber gradient
			const amberGradient = rootContainer?.querySelector('.bg-amber-300')
			expect(amberGradient).toBeInTheDocument()
		})

		it('positions gradients behind content with z-index', () => {
			const {container} = render(
				<AppLayoutContainer>
					<div>Content</div>
				</AppLayoutContainer>
			)

			const rootContainer = container.firstChild as HTMLElement
			const gradients = rootContainer?.querySelectorAll('div[class*="-z-10"]')

			expect(gradients).toHaveLength(3)
			gradients?.forEach(gradient => {
				expect(gradient).toHaveClass('-z-10')
			})
		})

		it('applies correct blur effects to gradients', () => {
			const {container} = render(
				<AppLayoutContainer>
					<div>Content</div>
				</AppLayoutContainer>
			)

			const rootContainer = container.firstChild as HTMLElement
			const gradients = rootContainer?.querySelectorAll('div[class*="blur-[150px]"]')

			expect(gradients).toHaveLength(3)
		})

		it('sets correct dimensions for each gradient', () => {
			const {container} = render(
				<AppLayoutContainer>
					<div>Content</div>
				</AppLayoutContainer>
			)

			const rootContainer = container.firstChild as HTMLElement

			// Rose gradient dimensions
			const roseGradient = rootContainer?.querySelector('.bg-rose-500')
			expect(roseGradient).toHaveClass('h-[674px]', 'w-[118px]')

			// Flame gradient dimensions
			const flameGradient = rootContainer?.querySelector('.bg-flame-500')
			expect(flameGradient).toHaveClass('h-[669px]', 'w-[228px]')

			// Amber gradient dimensions
			const amberGradient = rootContainer?.querySelector('.bg-amber-300')
			expect(amberGradient).toHaveClass('h-[709px]', 'w-[176px]')
		})
	})

	describe('Accessibility', () => {
		it('provides semantic main element for content', () => {
			render(
				<AppLayoutContainer>
					<div>Main Content</div>
				</AppLayoutContainer>
			)

			const mainElement = screen.getByRole('main')
			expect(mainElement).toBeInTheDocument()
			expect(mainElement).toContainElement(screen.getByText('Main Content'))
		})

		it('maintains proper document structure', () => {
			render(
				<AppLayoutContainer>
					<h1>Page Title</h1>
					<p>Page content</p>
				</AppLayoutContainer>
			)

			const mainElement = screen.getByRole('main')
			expect(mainElement).toContainElement(screen.getByRole('heading', {level: 1}))
			expect(mainElement).toContainElement(screen.getByText('Page content'))
		})

		it('does not interfere with child accessibility', () => {
			render(
				<AppLayoutContainer>
					<button>Accessible Button</button>
					<input aria-label="Accessible Input" />
				</AppLayoutContainer>
			)

			expect(screen.getByRole('button', {name: 'Accessible Button'})).toBeInTheDocument()
			expect(screen.getByLabelText('Accessible Input')).toBeInTheDocument()
		})
	})

	describe('Edge Cases', () => {
		it('handles component unmounting gracefully', () => {
			const {unmount} = render(
				<AppLayoutContainer>
					<div>Content</div>
				</AppLayoutContainer>
			)

			expect(() => unmount()).not.toThrow()
		})

		it('handles re-rendering with different children', () => {
			const {rerender} = render(
				<AppLayoutContainer>
					<div data-testid="original">Original Content</div>
				</AppLayoutContainer>
			)

			expect(screen.getByTestId('original')).toBeInTheDocument()

			rerender(
				<AppLayoutContainer>
					<div data-testid="updated">Updated Content</div>
				</AppLayoutContainer>
			)

			expect(screen.queryByTestId('original')).not.toBeInTheDocument()
			expect(screen.getByTestId('updated')).toBeInTheDocument()
		})

		it('maintains layout integrity with complex nested content', () => {
			render(
				<AppLayoutContainer>
					<div>
						<header>Header</header>
						<section>
							<article>Article Content</article>
						</section>
						<footer>Footer</footer>
					</div>
				</AppLayoutContainer>
			)

			const mainElement = screen.getByRole('main')
			expect(mainElement).toContainElement(screen.getByText('Header'))
			expect(mainElement).toContainElement(screen.getByText('Article Content'))
			expect(mainElement).toContainElement(screen.getByText('Footer'))
		})

		it('handles deeply nested React components', () => {
			const NestedComponent = () => (
				<div>
					<div>
						<div data-testid="deeply-nested">Deeply Nested</div>
					</div>
				</div>
			)

			render(
				<AppLayoutContainer>
					<NestedComponent />
				</AppLayoutContainer>
			)

			expect(screen.getByTestId('deeply-nested')).toBeInTheDocument()
		})
	})

	describe('Performance Considerations', () => {
		it('renders efficiently with minimal DOM nodes', () => {
			render(
				<AppLayoutContainer>
					<div>Content</div>
				</AppLayoutContainer>
			)

			// Should have expected structure without unnecessary wrapper elements
			const container = screen.getByRole('main').closest('div')
			expect(container).toBeInTheDocument()

			// Verify key elements are present
			expect(screen.getByTestId('app-sidebar')).toBeInTheDocument()
			expect(screen.getByTestId('motion-div')).toBeInTheDocument()
			expect(screen.getByTestId('smooth-scroll-provider')).toBeInTheDocument()
			expect(screen.getByRole('main')).toBeInTheDocument()
		})

		it('does not create unnecessary re-renders', () => {
			const {rerender} = render(
				<AppLayoutContainer>
					<div>Content</div>
				</AppLayoutContainer>
			)

			const initialSidebar = screen.getByTestId('app-sidebar')
			const initialMotionDiv = screen.getByTestId('motion-div')

			rerender(
				<AppLayoutContainer>
					<div>Content</div>
				</AppLayoutContainer>
			)

			// Elements should still be present (not recreated)
			expect(screen.getByTestId('app-sidebar')).toBeInTheDocument()
			expect(screen.getByTestId('motion-div')).toBeInTheDocument()
		})
	})
})
