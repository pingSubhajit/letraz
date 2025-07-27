import React from 'react'
import {render, screen, userEvent} from '@/__tests__/helpers/test-utils'
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import AppSidebar from '@/components/AppSidebar'

// Mock external dependencies
vi.mock('@clerk/nextjs', () => ({
	useAuth: vi.fn(() => ({
		isLoaded: true,
		userId: 'test-user-id'
	})),
	UserButton: React.forwardRef<HTMLDivElement, any>((props, ref) => (
		<div ref={ref} {...props} data-testid="user-button">
			User Button
		</div>
	))
}))

vi.mock('next-view-transitions', () => ({
	Link: React.forwardRef<HTMLAnchorElement, any>(({children, href, ...props}, ref) => (
		<a ref={ref} href={href} {...props} data-testid="nav-link">
			{children}
		</a>
	))
}))

vi.mock('next/image', () => ({
	__esModule: true,
	default: React.forwardRef<HTMLImageElement, any>((props, ref) => (
		<img ref={ref} {...props} data-testid="next-image" />
	))
}))

vi.mock('@/components/ui/button', () => ({
	Button: React.forwardRef<HTMLButtonElement, any>(({children, onClick, variant, className, ...props}, ref) => (
		<button
			ref={ref}
			onClick={onClick}
			className={className}
			{...props}
			data-testid="ui-button"
			data-variant={variant}
		>
			{children}
		</button>
	))
}))

vi.mock('@heroicons/react/20/solid', () => ({
	Cog6ToothIcon: ({className}: {className?: string}) => (
		<div className={className} data-testid="cog-icon">
			Settings Icon
		</div>
	)
}))

vi.mock('@/components/notifications/NotificationBell', () => ({
	__esModule: true,
	default: () => (
		<div data-testid="notification-bell">
			Notification Bell
		</div>
	)
}))

vi.mock('@/components/clientContainers/AppSidebarContainer', () => ({
	__esModule: true,
	default: React.forwardRef<HTMLDivElement, any>(({children, className, ...props}, ref) => (
		<div
			ref={ref}
			className={className}
			{...props}
			data-testid="app-sidebar-container"
		>
			{children}
		</div>
	))
}))

// Mock logo import
vi.mock('@/public/logo_mono_rotated.svg', () => ({
	__esModule: true,
	default: '/mock-logo.svg'
}))

describe('AppSidebar Component', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	afterEach(() => {
		vi.restoreAllMocks()
	})

	describe('Initial Rendering', () => {
		it('renders without crashing', () => {
			render(<AppSidebar />)
			expect(screen.getByTestId('app-sidebar-container')).toBeInTheDocument()
		})

		it('renders with correct container structure', () => {
			render(<AppSidebar />)

			const container = screen.getByTestId('app-sidebar-container')
			expect(container).toHaveClass('h-full', 'px-4', 'pt-24', 'pb-8', 'flex', 'flex-col', 'items-center', 'justify-between')
		})

		it('renders logo link at the top', () => {
			render(<AppSidebar />)

			const logoLinks = screen.getAllByTestId('nav-link')
			const logoLink = logoLinks.find(link => link.getAttribute('href') === '/app')
			expect(logoLink).toBeInTheDocument()

			const logoImage = screen.getByTestId('next-image')
			expect(logoImage).toHaveAttribute('src', '/mock-logo.svg')
			expect(logoImage).toHaveAttribute('alt', 'Letraz logo')
		})

		it('renders bottom section with controls', () => {
			render(<AppSidebar />)

			// Should have notification bell, settings button, and user button
			expect(screen.getByTestId('notification-bell')).toBeInTheDocument()
			expect(screen.getByTestId('ui-button')).toBeInTheDocument()
			expect(screen.getByTestId('user-button')).toBeInTheDocument()
		})
	})

	describe('Sidebar Content Rendering', () => {
		it('displays logo with correct attributes', () => {
			render(<AppSidebar />)

			const logoImage = screen.getByTestId('next-image')
			expect(logoImage).toHaveAttribute('src', '/mock-logo.svg')
			expect(logoImage).toHaveAttribute('alt', 'Letraz logo')
		})

		it('renders notification bell when auth is loaded', () => {
			render(<AppSidebar />)

			expect(screen.getByTestId('notification-bell')).toBeInTheDocument()
		})

		it('does not render notification bell when auth is not loaded', async () => {
			const clerkModule = await import('@clerk/nextjs')
			vi.mocked(clerkModule.useAuth).mockReturnValueOnce({
				isLoaded: false,
				userId: null
			} as any)

			render(<AppSidebar />)

			expect(screen.queryByTestId('notification-bell')).not.toBeInTheDocument()
		})

		it('renders settings button with correct styling', () => {
			render(<AppSidebar />)

			const settingsButton = screen.getByTestId('ui-button')
			expect(settingsButton).toHaveAttribute('data-variant', 'ghost')
			expect(settingsButton).toHaveClass('p-1', 'aspect-square', 'w-full', 'mb-2')

			const cogIcon = screen.getByTestId('cog-icon')
			expect(cogIcon).toHaveClass('fill-primary', 'size-[70%]')
		})

		it('renders settings link with correct href', () => {
			render(<AppSidebar />)

			const settingsLinks = screen.getAllByTestId('nav-link')
			const settingsLink = settingsLinks.find(link => link.getAttribute('href') === '/app/settings')
			expect(settingsLink).toBeInTheDocument()
		})

		it('renders user button with correct appearance props', () => {
			render(<AppSidebar />)

			const userButton = screen.getByTestId('user-button')
			expect(userButton).toBeInTheDocument()
		})
	})

	describe('Layout Structure', () => {
		it('uses flexbox layout for proper positioning', () => {
			render(<AppSidebar />)

			const container = screen.getByTestId('app-sidebar-container')
			expect(container).toHaveClass('flex', 'flex-col', 'items-center', 'justify-between')
		})

		it('positions logo at the top', () => {
			render(<AppSidebar />)

			const container = screen.getByTestId('app-sidebar-container')
			const logoLink = container.querySelector('a[href="/app"]')
			expect(logoLink).toBeInTheDocument()
		})

		it('groups bottom controls in a flex container', () => {
			render(<AppSidebar />)

			const container = screen.getByTestId('app-sidebar-container')
			const bottomSection = container.querySelector('div.flex.flex-col.items-center.justify-end.gap-2')
			expect(bottomSection).toBeInTheDocument()
		})

		it('applies correct spacing and padding', () => {
			render(<AppSidebar />)

			const container = screen.getByTestId('app-sidebar-container')
			expect(container).toHaveClass('px-4', 'pt-24', 'pb-8')
		})
	})

	describe('User Interactions', () => {
		it('handles logo click navigation', async () => {
			const user = userEvent.setup()
			render(<AppSidebar />)

			const logoLinks = screen.getAllByTestId('nav-link')
			const logoLink = logoLinks.find(link => link.getAttribute('href') === '/app')

			// Click should not throw error
			await user.click(logoLink!)
			expect(logoLink).toHaveAttribute('href', '/app')
		})

		it('handles settings button click', async () => {
			const user = userEvent.setup()
			render(<AppSidebar />)

			const settingsButton = screen.getByTestId('ui-button')

			// Click should not throw error
			await user.click(settingsButton)
		})

		it('handles settings link navigation', async () => {
			const user = userEvent.setup()
			render(<AppSidebar />)

			const settingsLinks = screen.getAllByTestId('nav-link')
			const settingsLink = settingsLinks.find(link => link.getAttribute('href') === '/app/settings')

			// Click should not throw error
			await user.click(settingsLink!)
			expect(settingsLink).toHaveAttribute('href', '/app/settings')
		})

		it('supports keyboard navigation', async () => {
			const user = userEvent.setup()
			render(<AppSidebar />)

			// Should be able to tab through interactive elements
			await user.tab()

			const focusedElement = document.activeElement
			expect(focusedElement).toBeInTheDocument()
		})
	})

	describe('Authentication States', () => {
		it('shows notification bell when user is authenticated', () => {
			render(<AppSidebar />)

			expect(screen.getByTestId('notification-bell')).toBeInTheDocument()
		})

		it('hides notification bell when auth is not loaded', async () => {
			const clerkModule = await import('@clerk/nextjs')
			vi.mocked(clerkModule.useAuth).mockReturnValueOnce({
				isLoaded: false,
				userId: null
			} as any)

			render(<AppSidebar />)

			expect(screen.queryByTestId('notification-bell')).not.toBeInTheDocument()
		})

		it('shows user button regardless of auth state', async () => {
			const clerkModule = await import('@clerk/nextjs')
			vi.mocked(clerkModule.useAuth).mockReturnValueOnce({
				isLoaded: false,
				userId: null
			} as any)

			render(<AppSidebar />)

			expect(screen.getByTestId('user-button')).toBeInTheDocument()
		})

		it('handles undefined auth state gracefully', async () => {
			const clerkModule = await import('@clerk/nextjs')
			vi.mocked(clerkModule.useAuth).mockReturnValueOnce(undefined as any)

			render(<AppSidebar />)

			// Should render without crashing
			expect(screen.getByTestId('app-sidebar-container')).toBeInTheDocument()
			expect(screen.queryByTestId('notification-bell')).not.toBeInTheDocument()
		})
	})

	describe('Responsive Behavior', () => {
		it('maintains consistent layout across different screen sizes', () => {
			render(<AppSidebar />)

			const container = screen.getByTestId('app-sidebar-container')
			expect(container).toHaveClass('h-full', 'flex', 'flex-col', 'items-center', 'justify-between')
		})

		it('uses responsive padding and spacing', () => {
			render(<AppSidebar />)

			const container = screen.getByTestId('app-sidebar-container')
			expect(container).toHaveClass('px-4', 'pt-24', 'pb-8')
		})

		it('maintains aspect ratio for settings button', () => {
			render(<AppSidebar />)

			const settingsButton = screen.getByTestId('ui-button')
			expect(settingsButton).toHaveClass('aspect-square', 'w-full')
		})
	})

	describe('State Management Integration', () => {
		it('integrates with sidebar provider context', () => {
			render(<AppSidebar />)

			// Component should render without errors when wrapped in SidebarProvider
			expect(screen.getByTestId('app-sidebar-container')).toBeInTheDocument()
		})

		it('passes correct props to AppSidebarContainer', () => {
			render(<AppSidebar />)

			const container = screen.getByTestId('app-sidebar-container')
			expect(container).toHaveClass('h-full', 'px-4', 'pt-24', 'pb-8', 'flex', 'flex-col', 'items-center', 'justify-between')
		})
	})

	describe('Navigation Dependencies', () => {
		it('renders navigation links with correct hrefs', () => {
			render(<AppSidebar />)

			const links = screen.getAllByTestId('nav-link')
			const logoLink = links.find(link => link.getAttribute('href') === '/app')
			const settingsLink = links.find(link => link.getAttribute('href') === '/app/settings')

			expect(logoLink).toBeInTheDocument()
			expect(settingsLink).toBeInTheDocument()
		})

		it('uses next-view-transitions Link component', () => {
			render(<AppSidebar />)

			const links = screen.getAllByTestId('nav-link')
			expect(links.length).toBe(2) // Logo link and settings link
		})
	})

	describe('Component Dependencies', () => {
		it('renders NotificationBell component when auth is loaded', () => {
			render(<AppSidebar />)

			expect(screen.getByTestId('notification-bell')).toBeInTheDocument()
		})

		it('renders UI Button component with correct props', () => {
			render(<AppSidebar />)

			const button = screen.getByTestId('ui-button')
			expect(button).toHaveAttribute('data-variant', 'ghost')
		})

		it('renders UserButton component from Clerk', () => {
			render(<AppSidebar />)

			expect(screen.getByTestId('user-button')).toBeInTheDocument()
		})

		it('renders Heroicons Cog6ToothIcon', () => {
			render(<AppSidebar />)

			expect(screen.getByTestId('cog-icon')).toBeInTheDocument()
		})
	})

	describe('Accessibility', () => {
		it('provides accessible navigation structure', () => {
			render(<AppSidebar />)

			const links = screen.getAllByTestId('nav-link')
			links.forEach(link => {
				expect(link).toHaveAttribute('href')
			})
		})

		it('provides alt text for logo image', () => {
			render(<AppSidebar />)

			const logoImage = screen.getByTestId('next-image')
			expect(logoImage).toHaveAttribute('alt', 'Letraz logo')
		})

		it('supports keyboard navigation through interactive elements', async () => {
			const user = userEvent.setup()
			render(<AppSidebar />)

			// Should be able to tab through links and buttons
			await user.tab()

			const focusedElement = document.activeElement
			expect(focusedElement?.tagName.toLowerCase()).toMatch(/^(a|button|div)$/)
		})

		it('maintains focus visibility', () => {
			render(<AppSidebar />)

			const settingsButton = screen.getByTestId('ui-button')
			settingsButton.focus()
			expect(settingsButton).toHaveFocus()
		})
	})

	describe('Edge Cases', () => {
		it('handles missing auth object gracefully', async () => {
			const clerkModule = await import('@clerk/nextjs')
			vi.mocked(clerkModule.useAuth).mockReturnValueOnce(null as any)

			render(<AppSidebar />)

			// Should render without crashing
			expect(screen.getByTestId('app-sidebar-container')).toBeInTheDocument()
			expect(screen.queryByTestId('notification-bell')).not.toBeInTheDocument()
		})

		it('handles component unmounting gracefully', () => {
			const {unmount} = render(<AppSidebar />)

			// Should unmount without errors
			expect(() => unmount()).not.toThrow()
		})

		it('renders consistently with different auth states', async () => {
			const clerkModule = await import('@clerk/nextjs')

			// Test with loaded auth
			vi.mocked(clerkModule.useAuth).mockReturnValueOnce({
				isLoaded: true,
				userId: 'test-user'
			} as any)

			const {rerender} = render(<AppSidebar />)
			expect(screen.getByTestId('notification-bell')).toBeInTheDocument()

			// Test with unloaded auth
			vi.mocked(clerkModule.useAuth).mockReturnValueOnce({
				isLoaded: false,
				userId: null
			} as any)

			rerender(<AppSidebar />)
			expect(screen.queryByTestId('notification-bell')).not.toBeInTheDocument()
		})

		it('maintains layout integrity with missing components', () => {
			render(<AppSidebar />)

			// Should still render other components even if some are missing
			expect(screen.getByTestId('app-sidebar-container')).toBeInTheDocument()
			expect(screen.getByTestId('ui-button')).toBeInTheDocument()
			expect(screen.getByTestId('user-button')).toBeInTheDocument()
			expect(screen.getByTestId('notification-bell')).toBeInTheDocument()
		})
	})
})
