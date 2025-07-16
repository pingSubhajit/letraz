import React from 'react'
import {render, screen} from '@testing-library/react'
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import About from '../About'

// --- Mocks ---
vi.mock('@/components/animations/TextAnimations', () => ({
	default: ({text, className}: { text: string; className: string }) => (
		<div className={className} data-testid="text-animate">
			{text}
		</div>
	)
}))

vi.mock('@/components/ui/button', () => ({
	Button: ({children, className, variant, ...props}: any) => (
		<button className={className} data-variant={variant} {...props}>
			{children}
		</button>
	)
}))

vi.mock('lucide-react', () => ({
	ChevronLeft: ({className}: { className: string }) => (
		<div className={className} data-testid="chevron-left">
			ChevronLeft
		</div>
	),
	ChevronRight: ({className}: { className: string }) => (
		<div className={className} data-testid="chevron-right">
			ChevronRight
		</div>
	)
}))

vi.mock('next-view-transitions', () => ({
	Link: ({children, href, ...props}: any) => (
		<a href={href} {...props}>
			{children}
		</a>
	)
}))

vi.mock('@/components/onboarding/AboutDescription', () => ({
	default: () => (
		<div data-testid="about-description">
			About Description Component
		</div>
	)
}))

vi.mock('@/lib/onboarding/actions', () => ({
	updateOnboardingStep: vi.fn()
}))

// --- Tests ---
describe('About', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	afterEach(() => {
		vi.clearAllMocks()
	})

	describe('Component Rendering', () => {
		it('renders the about component with all elements', () => {
			render(<About />)

			// Check main container
			const container = document.querySelector('.w-full.h-full.flex.flex-col.justify-center.items-center')
			expect(container).toBeInTheDocument()

			// Check heading text animations
			expect(screen.getByText('Here\'s')).toBeInTheDocument()
			expect(screen.getByText('how it will work')).toBeInTheDocument()

			// Check description component
			expect(screen.getByTestId('about-description')).toBeInTheDocument()

			// Check navigation buttons
			expect(screen.getByText('Watch video')).toBeInTheDocument()
			expect(screen.getByText('Sounds great')).toBeInTheDocument()
		})

		it('renders text animations with correct styling', () => {
			render(<About />)

			const textAnimations = screen.getAllByTestId('text-animate')
			expect(textAnimations).toHaveLength(2)

			// Check that all text animations have the correct styling
			textAnimations.forEach(animation => {
				expect(animation).toHaveClass('text-[5rem]', 'leading-snug', 'flex', 'justify-center')
			})
		})

		it('renders navigation buttons with correct styling and links', () => {
			render(<About />)

			// Check previous button (Watch video)
			const watchVideoLink = screen.getByText('Watch video').closest('a')
			expect(watchVideoLink).toHaveAttribute('href', '/app/onboarding?step=welcome')

			const watchVideoButton = screen.getByText('Watch video').closest('button')
			expect(watchVideoButton).toHaveClass(
				'transition',
				'rounded-full',
				'shadow-lg',
				'hover:shadow-xl',
				'px-6'
			)
			expect(watchVideoButton).toHaveAttribute('data-variant', 'secondary')

			// Check next button (Sounds great)
			const soundsGreatLink = screen.getByText('Sounds great').closest('a')
			expect(soundsGreatLink).toHaveAttribute('href', '/app/onboarding?step=personal-details')

			const soundsGreatButton = screen.getByText('Sounds great').closest('button')
			expect(soundsGreatButton).toHaveClass(
				'transition',
				'rounded-full',
				'shadow-lg',
				'px-6',
				'hover:shadow-xl'
			)
			expect(soundsGreatButton).toHaveAttribute('data-variant', 'secondary')
		})
	})

	describe('Layout and Positioning', () => {
		it('positions heading text correctly', () => {
			render(<About />)

			const headingContainer = document.querySelector('.pt-48')
			expect(headingContainer).toBeInTheDocument()
		})

		it('positions navigation buttons correctly', () => {
			render(<About />)

			const navigationContainer = document.querySelector('.w-\\[calc\\(100\\%-4\\.7rem\\)\\].flex.items-center.justify-between.fixed.left-\\[4\\.7rem\\].z-10.bottom-16.px-16')
			expect(navigationContainer).toBeInTheDocument()
		})

		it('centers main content', () => {
			render(<About />)

			const mainContainer = document.querySelector('.w-full.h-full.flex.flex-col.justify-center.items-center')
			expect(mainContainer).toBeInTheDocument()
		})
	})

	describe('Interactions and Navigation', () => {
		it('calls updateOnboardingStep with about on render', async () => {
			const {updateOnboardingStep} = vi.mocked(await import('@/lib/onboarding/actions'))

			render(<About />)

			expect(updateOnboardingStep).toHaveBeenCalledWith('about')
			expect(updateOnboardingStep).toHaveBeenCalledTimes(1)
		})

		it('has correct navigation links', () => {
			render(<About />)

			// Check previous step link
			const watchVideoLink = screen.getByText('Watch video').closest('a')
			expect(watchVideoLink).toHaveAttribute('href', '/app/onboarding?step=welcome')

			// Check next step link
			const soundsGreatLink = screen.getByText('Sounds great').closest('a')
			expect(soundsGreatLink).toHaveAttribute('href', '/app/onboarding?step=personal-details')
		})

		it('renders navigation buttons as interactive elements', () => {
			render(<About />)

			const buttons = screen.getAllByRole('button')
			expect(buttons).toHaveLength(2)

			buttons.forEach(button => {
				expect(button).toHaveClass('rounded-full')
			})
		})
	})

	describe('Visual Elements', () => {
		it('renders chevron left icon with correct styling', () => {
			render(<About />)

			const chevronLeftIcon = screen.getByTestId('chevron-left')
			expect(chevronLeftIcon).toHaveClass('w-5', 'h-5', 'mr-1')
		})

		it('renders chevron right icon with correct styling', () => {
			render(<About />)

			const chevronRightIcon = screen.getByTestId('chevron-right')
			expect(chevronRightIcon).toHaveClass('w-5', 'h-5', 'ml-1')
		})

		it('includes AboutDescription component', () => {
			render(<About />)

			const aboutDescription = screen.getByTestId('about-description')
			expect(aboutDescription).toBeInTheDocument()
		})
	})

	describe('Accessibility', () => {
		it('has proper button roles', () => {
			render(<About />)

			const buttons = screen.getAllByRole('button')
			expect(buttons).toHaveLength(2)
		})

		it('has proper link roles for navigation', () => {
			render(<About />)

			const links = screen.getAllByRole('link')
			expect(links).toHaveLength(2)

			// Check that each link has proper href
			const hrefs = links.map(link => link.getAttribute('href'))
			expect(hrefs).toContain('/app/onboarding?step=welcome')
			expect(hrefs).toContain('/app/onboarding?step=personal-details')
		})

		it('provides meaningful button text', () => {
			render(<About />)

			expect(screen.getByText('Watch video')).toBeInTheDocument()
			expect(screen.getByText('Sounds great')).toBeInTheDocument()
		})
	})

	describe('Component Structure', () => {
		it('has correct main container structure', () => {
			render(<About />)

			const mainContainer = document.querySelector('.w-full.h-full.flex.flex-col.justify-center.items-center')
			expect(mainContainer).toBeInTheDocument()
		})

		it('contains all required sections', () => {
			render(<About />)

			// Heading section
			const headingSection = document.querySelector('.pt-48')
			expect(headingSection).toBeInTheDocument()

			// Description section
			const descriptionSection = screen.getByTestId('about-description')
			expect(descriptionSection).toBeInTheDocument()

			// Navigation section
			const navigationSection = document.querySelector('.w-\\[calc\\(100\\%-4\\.7rem\\)\\]')
			expect(navigationSection).toBeInTheDocument()
		})
	})

	describe('Text Content', () => {
		it('displays correct heading message', () => {
			render(<About />)

			expect(screen.getByText('Here\'s')).toBeInTheDocument()
			expect(screen.getByText('how it will work')).toBeInTheDocument()
		})

		it('displays correct button text', () => {
			render(<About />)

			expect(screen.getByText('Watch video')).toBeInTheDocument()
			expect(screen.getByText('Sounds great')).toBeInTheDocument()
		})
	})

	describe('Responsive Design', () => {
		it('applies responsive classes for navigation container', () => {
			render(<About />)

			const navigationContainer = document.querySelector('.w-\\[calc\\(100\\%-4\\.7rem\\)\\]')
			expect(navigationContainer).toHaveClass(
				'w-[calc(100%-4.7rem)]',
				'flex',
				'items-center',
				'justify-between',
				'fixed',
				'left-[4.7rem]',
				'z-10',
				'bottom-16',
				'px-16'
			)
		})

		it('applies responsive text sizing', () => {
			render(<About />)

			const textAnimations = screen.getAllByTestId('text-animate')
			textAnimations.forEach(animation => {
				expect(animation).toHaveClass('text-[5rem]')
			})
		})
	})

	describe('Button Variants', () => {
		it('applies secondary variant to both buttons', () => {
			render(<About />)

			const buttons = screen.getAllByRole('button')
			buttons.forEach(button => {
				expect(button).toHaveAttribute('data-variant', 'secondary')
			})
		})

		it('applies consistent styling to both buttons', () => {
			render(<About />)

			const watchVideoButton = screen.getByText('Watch video').closest('button')
			const soundsGreatButton = screen.getByText('Sounds great').closest('button')

			// Both should have rounded-full and shadow classes
			expect(watchVideoButton).toHaveClass('rounded-full', 'shadow-lg')
			expect(soundsGreatButton).toHaveClass('rounded-full', 'shadow-lg')
		})
	})
})
