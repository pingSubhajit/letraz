import React from 'react'
import {render, screen} from '@testing-library/react'
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import Welcome from '../Welcome'

// --- Mocks ---
vi.mock('@/components/animations/TextAnimations', () => ({
	default: ({text, className}: { text: string; className: string }) => (
		<div className={className} data-testid="text-animate">
			{text}
		</div>
	)
}))

vi.mock('@heroicons/react/24/solid', () => ({
	PlayIcon: ({className}: { className: string }) => (
		<div className={className} data-testid="play-icon">
			Play Icon
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

vi.mock('@/lib/onboarding/actions', () => ({
	updateOnboardingStep: vi.fn()
}))

// --- Tests ---
describe('Welcome', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	afterEach(() => {
		vi.clearAllMocks()
	})

	describe('Component Rendering', () => {
		it('renders the welcome component with all elements', () => {
			render(<Welcome />)

			// Check main container
			const container = document.querySelector('.min-h-dvh')
			expect(container).toBeInTheDocument()

			// Check heading text animations
			expect(screen.getByText('Welcome')).toBeInTheDocument()
			expect(screen.getByText('to the new way')).toBeInTheDocument()
			expect(screen.getByText('of applying for jobs')).toBeInTheDocument()

			// Check play button
			const buttons = screen.getAllByRole('button')
			expect(buttons).toHaveLength(2)
			expect(screen.getByTestId('play-icon')).toBeInTheDocument()

			// Check next step button
			const beginButton = screen.getByText('Begin journey')
			expect(beginButton).toBeInTheDocument()
		})

		it('renders text animations with correct styling', () => {
			render(<Welcome />)

			const textAnimations = screen.getAllByTestId('text-animate')
			expect(textAnimations).toHaveLength(3)

			// Check that all text animations have the correct styling
			textAnimations.forEach(animation => {
				expect(animation).toHaveClass('text-[5.5rem]', 'leading-normal')
			})
		})

		it('renders the play video button with correct styling and animations', () => {
			render(<Welcome />)

			// Get the play button (first button, which contains the play icon)
			const playButton = screen.getByTestId('play-icon').closest('button')
			expect(playButton).toHaveClass(
				'absolute',
				'top-1/2',
				'left-1/2',
				'-translate-x-1/2',
				'-translate-y-1/2',
				'rounded-full',
				'p-6'
			)

			// Check for animation elements
			const animationElements = playButton?.querySelectorAll('.bg-flame-500')
			expect(animationElements).toHaveLength(2)

			// Check ping animation
			const pingElement = playButton?.querySelector('.animate-ping')
			expect(pingElement).toBeInTheDocument()
			expect(pingElement).toHaveClass('bg-flame-500', 'rounded-full')

			// Check static background
			const staticBg = playButton?.querySelector('.bg-flame-500:not(.animate-ping)')
			expect(staticBg).toBeInTheDocument()
		})

		it('renders the begin journey button with correct link and styling', () => {
			render(<Welcome />)

			const link = screen.getByRole('link')
			expect(link).toHaveAttribute('href', '/app/onboarding?step=about')

			const button = screen.getByText('Begin journey').closest('button')
			expect(button).toHaveClass(
				'absolute',
				'transition',
				'bottom-16',
				'right-16',
				'rounded-full',
				'shadow-lg',
				'hover:shadow-xl',
				'px-6'
			)
			expect(button).toHaveAttribute('data-variant', 'secondary')

			// Check chevron icon
			expect(screen.getByTestId('chevron-right')).toBeInTheDocument()
		})
	})

	describe('Layout and Positioning', () => {
		it('positions heading text correctly', () => {
			render(<Welcome />)

			const headingContainer = document.querySelector('.absolute.top-16.left-16')
			expect(headingContainer).toBeInTheDocument()
		})

		it('positions play button in center', () => {
			render(<Welcome />)

			const playButton = screen.getByTestId('play-icon').closest('button')
			expect(playButton).toHaveClass(
				'absolute',
				'top-1/2',
				'left-1/2',
				'-translate-x-1/2',
				'-translate-y-1/2'
			)
		})

		it('positions begin journey button in bottom right', () => {
			render(<Welcome />)

			const button = screen.getByText('Begin journey').closest('button')
			expect(button).toHaveClass('absolute', 'bottom-16', 'right-16')
		})
	})

	describe('Interactions and Navigation', () => {
		it('calls updateOnboardingStep with welcome on render', async () => {
			const {updateOnboardingStep} = vi.mocked(await import('@/lib/onboarding/actions'))

			render(<Welcome />)

			expect(updateOnboardingStep).toHaveBeenCalledWith('welcome')
			expect(updateOnboardingStep).toHaveBeenCalledTimes(1)
		})

		it('has correct navigation link to about step', () => {
			render(<Welcome />)

			const link = screen.getByRole('link')
			expect(link).toHaveAttribute('href', '/app/onboarding?step=about')
		})

		it('renders play button as interactive element', () => {
			render(<Welcome />)

			const playButton = screen.getByTestId('play-icon').closest('button')
			expect(playButton).toBeInTheDocument()
			expect(playButton).toHaveClass('rounded-full', 'p-6')
		})
	})

	describe('Visual Elements', () => {
		it('renders play icon with correct styling', () => {
			render(<Welcome />)

			const playIcon = screen.getByTestId('play-icon')
			expect(playIcon).toHaveClass('w-8', 'h-8', 'fill-white', 'z-10', 'relative')
		})

		it('renders chevron right icon with correct styling', () => {
			render(<Welcome />)

			const chevronIcon = screen.getByTestId('chevron-right')
			expect(chevronIcon).toHaveClass('w-5', 'h-5', 'ml-1')
		})

		it('applies flame color to animation elements', () => {
			render(<Welcome />)

			const playButton = screen.getByTestId('play-icon').closest('button')
			const flameElements = playButton?.querySelectorAll('.bg-flame-500')

			expect(flameElements).toHaveLength(2)
			flameElements?.forEach(element => {
				expect(element).toHaveClass('bg-flame-500')
			})
		})
	})

	describe('Accessibility', () => {
		it('has proper button roles', () => {
			render(<Welcome />)

			const buttons = screen.getAllByRole('button')
			expect(buttons).toHaveLength(2) // Play button and Begin journey button
		})

		it('has proper link role for navigation', () => {
			render(<Welcome />)

			const link = screen.getByRole('link')
			expect(link).toBeInTheDocument()
			expect(link).toHaveAttribute('href', '/app/onboarding?step=about')
		})

		it('provides meaningful button text', () => {
			render(<Welcome />)

			expect(screen.getByText('Begin journey')).toBeInTheDocument()
		})
	})

	describe('Component Structure', () => {
		it('has correct main container structure', () => {
			render(<Welcome />)

			const mainContainer = document.querySelector('.min-h-dvh')
			expect(mainContainer).toBeInTheDocument()
		})

		it('contains all required sections', () => {
			render(<Welcome />)

			// Heading section
			const headingSection = document.querySelector('.absolute.top-16.left-16')
			expect(headingSection).toBeInTheDocument()

			// Play button section
			const playButton = screen.getByTestId('play-icon').closest('button')
			expect(playButton).toBeInTheDocument()

			// Navigation section
			const link = screen.getByRole('link')
			expect(link).toBeInTheDocument()
		})
	})

	describe('Text Content', () => {
		it('displays correct welcome message', () => {
			render(<Welcome />)

			expect(screen.getByText('Welcome')).toBeInTheDocument()
			expect(screen.getByText('to the new way')).toBeInTheDocument()
			expect(screen.getByText('of applying for jobs')).toBeInTheDocument()
		})

		it('displays correct button text', () => {
			render(<Welcome />)

			expect(screen.getByText('Begin journey')).toBeInTheDocument()
		})
	})
})
