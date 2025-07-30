import React from 'react'
import {render, screen, userEvent} from '@/__tests__/helpers/test-utils'
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import WebsiteNavBar from '@/components/WebsiteNavBar'

// Mock external dependencies
vi.mock('next/navigation', () => ({
	useSelectedLayoutSegment: vi.fn(() => null)
}))

vi.mock('next-view-transitions', () => ({
	Link: React.forwardRef<HTMLAnchorElement, any>(({children, href, onClick, ...props}, ref) => (
		<a ref={ref} href={href} onClick={onClick} {...props} data-testid="nav-link">
			{children}
		</a>
	))
}))

vi.mock('motion/react', () => ({
	AnimatePresence: ({children}: {children: React.ReactNode}) => (
		<div data-testid="animate-presence">{children}</div>
	),
	motion: {
		div: React.forwardRef<HTMLDivElement, any>(({children, layoutId, layout, ...props}, ref) => (
			<div
				ref={ref}
				{...props}
				data-testid="motion-div"
				data-layout-id={layoutId}
				data-layout={layout}
			>
				{children}
			</div>
		)),
		img: React.forwardRef<HTMLImageElement, any>((props, ref) => (
			<img ref={ref} {...props} data-testid="motion-img" />
		))
	}
}))

vi.mock('@/hooks/useDOMMounted', () => ({
	__esModule: true,
	default: vi.fn(() => true)
}))

vi.mock('@/components/ui/button', () => ({
	Button: React.forwardRef<HTMLButtonElement, any>(({children, onClick, className, ...props}, ref) => (
		<button
			ref={ref}
			onClick={onClick}
			className={className}
			{...props}
			data-testid="menu-button"
		>
			{children}
		</button>
	))
}))

vi.mock('@/app/(website)/page.logo', () => ({
	__esModule: true,
	default: ({className, onClick}: {className?: string, onClick?: () => void}) => (
		<div
			className={className}
			onClick={onClick}
			data-testid="landing-page-logo"
		>
			Logo
		</div>
	)
}))

vi.mock('@/components/ui/menu', () => ({
	MenuIcon: ({className, openState}: {className?: string, openState: boolean}) => (
		<div
			className={className}
			data-testid="menu-icon"
			data-open-state={openState}
		>
			Menu Icon
		</div>
	)
}))

vi.mock('next/image', () => ({
	__esModule: true,
	default: React.forwardRef<HTMLImageElement, any>((props, ref) => (
		<img ref={ref} {...props} data-testid="next-image" />
	))
}))

// Mock routes
vi.mock('@/routes', () => ({
	__esModule: true,
	default: {
		website: {
			story: {
				title: 'Our Story',
				segment: 'story',
				route: '/story',
				mainNav: true
			},
			changes: {
				title: 'Progress Updates',
				segment: 'changes',
				route: '/changes',
				mainNav: true
			},
			home: {
				title: 'Home',
				segment: '',
				route: '/',
				mainNav: false
			}
		}
	}
}))

describe('WebsiteNavBar Component', () => {


	beforeEach(() => {
		vi.clearAllMocks()
	})

	afterEach(() => {
		vi.restoreAllMocks()
	})

	describe('Initial Rendering', () => {
		it('renders without crashing', () => {
			render(<WebsiteNavBar />)
			expect(screen.getByTestId('animate-presence')).toBeInTheDocument()
		})

		it('applies custom className when provided', () => {
			const customClass = 'custom-navbar-class'
			const {container} = render(<WebsiteNavBar className={customClass} />)

			const navbarContainer = container.firstChild as HTMLElement
			expect(navbarContainer).toHaveClass(customClass)
		})

		it('renders desktop navigation by default', () => {
			render(<WebsiteNavBar />)

			// Desktop navigation should be visible
			const desktopNav = screen.getByText('Our Story').closest('div')
			expect(desktopNav).toBeInTheDocument()
		})

		it('renders mobile navigation when DOM is mounted', () => {
			render(<WebsiteNavBar />)

			expect(screen.getByTestId('landing-page-logo')).toBeInTheDocument()
			expect(screen.getByTestId('menu-button')).toBeInTheDocument()
		})

		it('does not render mobile navigation when DOM is not mounted', async () => {
			// Import and mock the hook to return false
			const useDOMMountedModule = await import('@/hooks/useDOMMounted')
			vi.mocked(useDOMMountedModule.default).mockReturnValueOnce(false)

			render(<WebsiteNavBar />)

			expect(screen.queryByTestId('landing-page-logo')).not.toBeInTheDocument()
			expect(screen.queryByTestId('menu-button')).not.toBeInTheDocument()
		})
	})

	describe('Navigation Links', () => {
		it('renders only main navigation links', () => {
			render(<WebsiteNavBar />)

			// Should render main nav links
			expect(screen.getByText('Our Story')).toBeInTheDocument()
			expect(screen.getByText('Progress Updates')).toBeInTheDocument()

			// Should not render non-main nav links
			expect(screen.queryByText('Home')).not.toBeInTheDocument()
		})

		it('renders navigation links with correct hrefs', () => {
			render(<WebsiteNavBar />)

			const storyLinks = screen.getAllByText('Our Story')
			const changesLinks = screen.getAllByText('Progress Updates')

			// Check desktop links
			expect(storyLinks[0].closest('a')).toHaveAttribute('href', '/story')
			expect(changesLinks[0].closest('a')).toHaveAttribute('href', '/changes')
		})

		it('highlights current route with indicator', async () => {
			const navigationModule = await import('next/navigation')
			vi.mocked(navigationModule.useSelectedLayoutSegment).mockReturnValueOnce('story')

			render(<WebsiteNavBar />)

			// Should have motion indicator for current route
			const indicators = screen.getAllByTestId('motion-div')
			const routeIndicator = indicators.find(el => el.getAttribute('data-layout-id') &&
				el.classList.contains('bg-flame-500'))
			expect(routeIndicator).toBeInTheDocument()
		})

		it('applies correct styling to current route link', async () => {
			const navigationModule = await import('next/navigation')
			vi.mocked(navigationModule.useSelectedLayoutSegment).mockReturnValueOnce('story')

			render(<WebsiteNavBar />)

			const storyLink = screen.getAllByText('Our Story')[0]
			expect(storyLink).toHaveClass('opacity-100')
		})

		it('applies default styling to non-current route links', async () => {
			const navigationModule = await import('next/navigation')
			vi.mocked(navigationModule.useSelectedLayoutSegment).mockReturnValueOnce('story')

			render(<WebsiteNavBar />)

			const changesLink = screen.getAllByText('Progress Updates')[0]
			expect(changesLink).toHaveClass('opacity-70')
		})
	})

	describe('Mobile Navigation', () => {

		it('renders mobile navigation header', () => {
			render(<WebsiteNavBar />)

			expect(screen.getByTestId('landing-page-logo')).toBeInTheDocument()
			expect(screen.getByTestId('menu-button')).toBeInTheDocument()
			expect(screen.getByTestId('menu-icon')).toBeInTheDocument()
		})

		it('shows menu as closed initially', () => {
			render(<WebsiteNavBar />)

			const menuIcon = screen.getByTestId('menu-icon')
			expect(menuIcon).toHaveAttribute('data-open-state', 'false')
		})

		it('does not show mobile menu overlay initially', () => {
			render(<WebsiteNavBar />)

			// Mobile menu content should not be visible initially
			expect(screen.queryByTestId('next-image')).not.toBeInTheDocument()
		})

		it('opens mobile menu when menu button is clicked', async () => {
			const user = userEvent.setup()
			render(<WebsiteNavBar />)

			const menuButton = screen.getByTestId('menu-button')
			await user.click(menuButton)

			// Menu should be open
			const menuIcon = screen.getByTestId('menu-icon')
			expect(menuIcon).toHaveAttribute('data-open-state', 'true')

			// Mobile menu overlay should be visible
			expect(screen.getByTestId('next-image')).toBeInTheDocument()
		})

		it('closes mobile menu when menu button is clicked again', async () => {
			const user = userEvent.setup()
			render(<WebsiteNavBar />)

			const menuButton = screen.getByTestId('menu-button')

			// Open menu
			await user.click(menuButton)
			expect(screen.getByTestId('menu-icon')).toHaveAttribute('data-open-state', 'true')

			// Close menu
			await user.click(menuButton)
			expect(screen.getByTestId('menu-icon')).toHaveAttribute('data-open-state', 'false')
		})

		it('closes mobile menu when logo is clicked', async () => {
			const user = userEvent.setup()
			render(<WebsiteNavBar />)

			const menuButton = screen.getByTestId('menu-button')
			const logo = screen.getByTestId('landing-page-logo')

			// Open menu first
			await user.click(menuButton)
			expect(screen.getByTestId('menu-icon')).toHaveAttribute('data-open-state', 'true')

			// Click logo to close
			await user.click(logo)
			expect(screen.getByTestId('menu-icon')).toHaveAttribute('data-open-state', 'false')
		})

		it('closes mobile menu when a navigation link is clicked', async () => {
			const user = userEvent.setup()
			render(<WebsiteNavBar />)

			const menuButton = screen.getByTestId('menu-button')

			// Open menu
			await user.click(menuButton)
			expect(screen.getByTestId('menu-icon')).toHaveAttribute('data-open-state', 'true')

			// Click a navigation link (mobile version)
			const mobileLinks = screen.getAllByText('Our Story')
			const mobileLink = mobileLinks.find(link => link.closest('div')?.classList.contains('text-3xl'))

			if (mobileLink) {
				await user.click(mobileLink)
				expect(screen.getByTestId('menu-icon')).toHaveAttribute('data-open-state', 'false')
			}
		})
	})

	describe('Responsive Design', () => {
		it('hides desktop navigation on mobile screens', () => {
			render(<WebsiteNavBar />)

			// Desktop nav should have hidden class for mobile
			const desktopNav = screen.getByText('Our Story').closest('div')?.parentElement?.parentElement
			expect(desktopNav).toHaveClass('hidden', 'lg:flex')
		})

		it('hides mobile navigation on desktop screens', () => {
			render(<WebsiteNavBar />)

			// Mobile nav container should have hidden class for desktop
			const mobileNavContainer = screen.getByTestId('menu-button').closest('div')
			expect(mobileNavContainer).toHaveClass('lg:hidden')
		})

		it('renders different layouts for mobile and desktop links', async () => {
			const user = userEvent.setup()
			render(<WebsiteNavBar />)

			// Initially should only have desktop links
			const initialStoryLinks = screen.getAllByText('Our Story')
			expect(initialStoryLinks.length).toBe(1)

			// Open mobile menu to see mobile links
			const menuButton = screen.getByTestId('menu-button')
			await user.click(menuButton)

			// Should now have both desktop and mobile versions of links
			const storyLinks = screen.getAllByText('Our Story')
			expect(storyLinks.length).toBeGreaterThan(1)
		})
	})

	describe('State Management', () => {

		it('manages mobile menu open/close state correctly', async () => {
			const user = userEvent.setup()
			render(<WebsiteNavBar />)

			const menuButton = screen.getByTestId('menu-button')
			const menuIcon = screen.getByTestId('menu-icon')

			// Initial state - closed
			expect(menuIcon).toHaveAttribute('data-open-state', 'false')

			// Open menu
			await user.click(menuButton)
			expect(menuIcon).toHaveAttribute('data-open-state', 'true')

			// Close menu
			await user.click(menuButton)
			expect(menuIcon).toHaveAttribute('data-open-state', 'false')
		})

		it('maintains current route state across renders', async () => {
			const navigationModule = await import('next/navigation')
			vi.mocked(navigationModule.useSelectedLayoutSegment).mockReturnValue('changes')

			const {rerender} = render(<WebsiteNavBar />)

			// Initial render with 'changes' segment
			expect(screen.getAllByText('Progress Updates')[0]).toHaveClass('opacity-100')

			// Re-render should maintain the same state
			rerender(<WebsiteNavBar />)
			expect(screen.getAllByText('Progress Updates')[0]).toHaveClass('opacity-100')
		})

		it('updates route highlighting when segment changes', async () => {
			const navigationModule = await import('next/navigation')
			const mockFn = vi.mocked(navigationModule.useSelectedLayoutSegment)

			mockFn.mockReturnValue('story')
			const {rerender} = render(<WebsiteNavBar />)
			expect(screen.getAllByText('Our Story')[0]).toHaveClass('opacity-100')

			// Change segment
			mockFn.mockReturnValue('changes')
			rerender(<WebsiteNavBar />)
			expect(screen.getAllByText('Progress Updates')[0]).toHaveClass('opacity-100')
		})
	})

	describe('User Interactions', () => {

		it('handles menu button clicks', async () => {
			const user = userEvent.setup()
			render(<WebsiteNavBar />)

			const menuButton = screen.getByTestId('menu-button')

			await user.click(menuButton)
			expect(screen.getByTestId('menu-icon')).toHaveAttribute('data-open-state', 'true')
		})

		it('handles navigation link clicks', async () => {
			const user = userEvent.setup()
			render(<WebsiteNavBar />)

			const storyLink = screen.getAllByText('Our Story')[0].closest('a')
			expect(storyLink).toHaveAttribute('href', '/story')

			// Click should not throw error
			await user.click(storyLink!)
		})

		it('handles keyboard navigation', async () => {
			const user = userEvent.setup()
			render(<WebsiteNavBar />)

			const menuButton = screen.getByTestId('menu-button')

			// Focus and activate with keyboard
			menuButton.focus()
			expect(menuButton).toHaveFocus()

			await user.keyboard('{Enter}')
			expect(screen.getByTestId('menu-icon')).toHaveAttribute('data-open-state', 'true')
		})

		it('supports tab navigation through links', async () => {
			const user = userEvent.setup()
			render(<WebsiteNavBar />)

			// Tab through navigation links
			await user.tab()

			// Should be able to navigate through links
			const focusedElement = document.activeElement
			expect(focusedElement).toBeInTheDocument()
		})
	})

	describe('Menu Transitions and Animations', () => {

		it('renders AnimatePresence for mobile menu', () => {
			render(<WebsiteNavBar />)
			expect(screen.getByTestId('animate-presence')).toBeInTheDocument()
		})

		it('renders motion components for animations', async () => {
			const user = userEvent.setup()
			render(<WebsiteNavBar />)

			const menuButton = screen.getByTestId('menu-button')
			await user.click(menuButton)

			// Should have motion divs for animations
			const motionDivs = screen.getAllByTestId('motion-div')
			expect(motionDivs.length).toBeGreaterThan(0)
		})

		it('renders route indicator with layout animation', async () => {
			const navigationModule = await import('next/navigation')
			vi.mocked(navigationModule.useSelectedLayoutSegment).mockReturnValueOnce('story')

			render(<WebsiteNavBar />)

			// Should have motion div with layout properties for indicator
			const indicators = screen.getAllByTestId('motion-div')
			const layoutIndicator = indicators.find(el => el.getAttribute('data-layout-id') && el.getAttribute('data-layout'))
			expect(layoutIndicator).toBeInTheDocument()
		})

		it('handles mobile menu overlay animations', async () => {
			const user = userEvent.setup()
			render(<WebsiteNavBar />)

			const menuButton = screen.getByTestId('menu-button')
			await user.click(menuButton)

			// Mobile menu overlay should be rendered with motion properties
			const mobileMenuOverlay = screen.getByTestId('next-image').closest('[data-testid="motion-div"]')
			expect(mobileMenuOverlay).toBeInTheDocument()
		})
	})

	describe('Indicator Movement', () => {
		it('renders indicator for current route', async () => {
			const navigationModule = await import('next/navigation')
			vi.mocked(navigationModule.useSelectedLayoutSegment).mockReturnValueOnce('story')

			render(<WebsiteNavBar />)

			// Should render motion indicator
			const indicators = screen.getAllByTestId('motion-div')
			const routeIndicator = indicators.find(el => el.classList.contains('bg-flame-500'))
			expect(routeIndicator).toBeInTheDocument()
		})

		it('does not render indicator when no route is selected', () => {
			// Default mock returns null, so no need to override
			render(<WebsiteNavBar />)

			// Should not have route indicator
			const indicators = screen.queryAllByTestId('motion-div')
			const routeIndicator = indicators.find(el => el.classList.contains('bg-flame-500'))
			expect(routeIndicator).toBeUndefined()
		})

		it('renders indicator with layout ID for smooth transitions', async () => {
			const navigationModule = await import('next/navigation')
			vi.mocked(navigationModule.useSelectedLayoutSegment).mockReturnValueOnce('changes')

			render(<WebsiteNavBar />)

			const indicators = screen.getAllByTestId('motion-div')
			const routeIndicator = indicators.find(el => el.getAttribute('data-layout-id') &&
				el.classList.contains('bg-flame-500'))

			expect(routeIndicator).toHaveAttribute('data-layout-id')
			expect(routeIndicator).toHaveAttribute('data-layout')
		})
	})

	describe('Accessibility', () => {

		it('provides accessible navigation structure', () => {
			render(<WebsiteNavBar />)

			// Links should be accessible
			const links = screen.getAllByTestId('nav-link')
			expect(links.length).toBeGreaterThan(0)

			links.forEach(link => {
				expect(link).toHaveAttribute('href')
			})
		})

		it('supports keyboard navigation for menu button', async () => {
			const user = userEvent.setup()
			render(<WebsiteNavBar />)

			const menuButton = screen.getByTestId('menu-button')

			// Should be focusable
			menuButton.focus()
			expect(menuButton).toHaveFocus()

			// Should respond to Enter key
			await user.keyboard('{Enter}')
			expect(screen.getByTestId('menu-icon')).toHaveAttribute('data-open-state', 'true')
		})

		it('supports keyboard navigation for links', async () => {
			const user = userEvent.setup()
			render(<WebsiteNavBar />)

			// Should be able to tab to links
			await user.tab()

			const focusedElement = document.activeElement
			expect(focusedElement?.tagName.toLowerCase()).toBe('a')
		})

		it('provides proper focus management in mobile menu', async () => {
			const user = userEvent.setup()
			render(<WebsiteNavBar />)

			const menuButton = screen.getByTestId('menu-button')

			// Open menu
			await user.click(menuButton)

			// Should be able to navigate to mobile links
			await user.tab()

			const focusedElement = document.activeElement
			expect(focusedElement).toBeInTheDocument()
		})

		it('maintains focus visibility', () => {
			render(<WebsiteNavBar />)

			// Links should have focus-visible classes
			const storyLink = screen.getAllByText('Our Story')[0]
			expect(storyLink).toHaveClass('focus-visible:opacity-100')
		})
	})

	describe('Edge Cases', () => {
		it('handles empty route segment', async () => {
			const navigationModule = await import('next/navigation')
			vi.mocked(navigationModule.useSelectedLayoutSegment).mockReturnValueOnce('')

			render(<WebsiteNavBar />)

			// Should render without errors
			expect(screen.getByText('Our Story')).toBeInTheDocument()
		})

		it('handles undefined route segment', async () => {
			const navigationModule = await import('next/navigation')
			vi.mocked(navigationModule.useSelectedLayoutSegment).mockReturnValueOnce(null)

			render(<WebsiteNavBar />)

			// Should render without errors
			expect(screen.getByText('Our Story')).toBeInTheDocument()
		})

		it('handles rapid menu toggle clicks', async () => {
			const user = userEvent.setup()
			render(<WebsiteNavBar />)

			const menuButton = screen.getByTestId('menu-button')

			// Rapid clicks should not break the component
			await user.click(menuButton)
			await user.click(menuButton)
			await user.click(menuButton)

			// Should still be functional
			expect(screen.getByTestId('menu-icon')).toHaveAttribute('data-open-state', 'true')
		})

		it('handles component unmounting with open menu', async () => {
			const user = userEvent.setup()

			const {unmount} = render(<WebsiteNavBar />)

			const menuButton = screen.getByTestId('menu-button')
			await user.click(menuButton)

			// Should unmount without errors
			expect(() => unmount()).not.toThrow()
		})
	})
})
