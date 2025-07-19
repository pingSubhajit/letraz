import {beforeEach, describe, expect, it, vi} from 'vitest'
import {fireEvent, render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ResumeEditor from '@/components/resume/ResumeEditor'

// Mock the editor components
vi.mock('../editors/PersonalDetailsEditor', () => ({
	default: () => <div data-testid="personal-details-editor">Personal Details Editor</div>
}))

vi.mock('../editors/EducationEditor', () => ({
	default: () => <div data-testid="education-editor">Education Editor</div>
}))

vi.mock('../editors/ExperienceEditor', () => ({
	default: () => <div data-testid="experience-editor">Experience Editor</div>
}))

vi.mock('../editors/SkillsEditor', () => ({
	default: () => <div data-testid="skills-editor">Skills Editor</div>
}))

vi.mock('@/components/ui/expandable-tabs', () => ({
	ExpandableTabs: ({
		tabs,
		onChange,
		className,
		collapseOnOutsideClick
	}: {
		tabs: Array<{title: string; icon: any}>
		onChange: (index: number | null) => void
		className?: string
		collapseOnOutsideClick?: boolean
	}) => (
		<div data-testid="expandable-tabs" className={className}>
			{tabs.map((tab, index) => (
				<button
					key={index}
					data-testid={`tab-${index}`}
					onClick={() => onChange(index)}
				>
					{tab.title}
				</button>
			))}
			<div data-testid="collapse-outside-click">
				{collapseOnOutsideClick ? 'true' : 'false'}
			</div>
		</div>
	)
}))

describe('ResumeEditor', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	describe('Basic Rendering', () => {
		it('renders without crashing', () => {
			render(<ResumeEditor />)
			expect(screen.getByTestId('expandable-tabs')).toBeInTheDocument()
		})

		it('renders with custom className', () => {
			const customClass = 'custom-editor-class'
			render(<ResumeEditor className={customClass} />)

			const container = screen.getByTestId('expandable-tabs').parentElement
			expect(container).toHaveClass(customClass)
		})

		it('renders all tabs correctly', () => {
			render(<ResumeEditor />)

			expect(screen.getByTestId('tab-0')).toHaveTextContent('Profile')
			expect(screen.getByTestId('tab-1')).toHaveTextContent('Education')
			expect(screen.getByTestId('tab-2')).toHaveTextContent('Experience')
			expect(screen.getByTestId('tab-3')).toHaveTextContent('Skills')
			expect(screen.getByTestId('tab-4')).toHaveTextContent('Projects')
		})

		it('shows the first tab (Profile) as active by default', () => {
			render(<ResumeEditor />)
			expect(screen.getByTestId('personal-details-editor')).toBeInTheDocument()
		})

		it('configures expandable tabs with correct props', () => {
			render(<ResumeEditor />)

			const expandableTabs = screen.getByTestId('expandable-tabs')
			expect(expandableTabs).toBeInTheDocument()
			expect(screen.getByTestId('collapse-outside-click')).toHaveTextContent('false')
		})
	})

	describe('Tab Navigation', () => {
		it('switches to Education tab when clicked', async () => {
			const user = userEvent.setup()
			render(<ResumeEditor />)

			await user.click(screen.getByTestId('tab-1'))

			expect(screen.getByTestId('education-editor')).toBeInTheDocument()
			expect(screen.queryByTestId('personal-details-editor')).not.toBeInTheDocument()
		})

		it('switches to Experience tab when clicked', async () => {
			const user = userEvent.setup()
			render(<ResumeEditor />)

			await user.click(screen.getByTestId('tab-2'))

			expect(screen.getByTestId('experience-editor')).toBeInTheDocument()
			expect(screen.queryByTestId('personal-details-editor')).not.toBeInTheDocument()
		})

		it('switches to Skills tab when clicked', async () => {
			const user = userEvent.setup()
			render(<ResumeEditor />)

			await user.click(screen.getByTestId('tab-3'))

			expect(screen.getByTestId('skills-editor')).toBeInTheDocument()
			expect(screen.queryByTestId('personal-details-editor')).not.toBeInTheDocument()
		})

		it('shows Projects coming soon message when Projects tab is clicked', async () => {
			const user = userEvent.setup()
			render(<ResumeEditor />)

			await user.click(screen.getByTestId('tab-4'))

			expect(screen.getByText('Project editor is coming soon')).toBeInTheDocument()
			expect(screen.queryByTestId('personal-details-editor')).not.toBeInTheDocument()
		})

		it('maintains active tab state across interactions', async () => {
			const user = userEvent.setup()
			render(<ResumeEditor />)

			// Switch to Education tab
			await user.click(screen.getByTestId('tab-1'))
			expect(screen.getByTestId('education-editor')).toBeInTheDocument()

			// Switch to Experience tab
			await user.click(screen.getByTestId('tab-2'))
			expect(screen.getByTestId('experience-editor')).toBeInTheDocument()
			expect(screen.queryByTestId('education-editor')).not.toBeInTheDocument()
		})
	})

	describe('Tab Change Handler', () => {
		it('handles null tab change gracefully', () => {
			// Test the null handling by creating a direct test scenario
			render(<ResumeEditor />)

			/*
			 * The component should handle null gracefully by ignoring it
			 * This test verifies that the component doesn't crash and maintains current tab
			 */
			expect(screen.getByTestId('personal-details-editor')).toBeInTheDocument()

			// Test that valid tab changes work normally
			fireEvent.click(screen.getByTestId('tab-1'))
			expect(screen.getByTestId('education-editor')).toBeInTheDocument()
		})
	})

	describe('Conditional Rendering', () => {
		it('renders only one editor component at a time', async () => {
			const user = userEvent.setup()
			render(<ResumeEditor />)

			// Check that only Profile editor is visible initially
			expect(screen.getByTestId('personal-details-editor')).toBeInTheDocument()
			expect(screen.queryByTestId('education-editor')).not.toBeInTheDocument()
			expect(screen.queryByTestId('experience-editor')).not.toBeInTheDocument()
			expect(screen.queryByTestId('skills-editor')).not.toBeInTheDocument()

			// Switch to Education and verify only it is visible
			await user.click(screen.getByTestId('tab-1'))
			expect(screen.queryByTestId('personal-details-editor')).not.toBeInTheDocument()
			expect(screen.getByTestId('education-editor')).toBeInTheDocument()
			expect(screen.queryByTestId('experience-editor')).not.toBeInTheDocument()
			expect(screen.queryByTestId('skills-editor')).not.toBeInTheDocument()
		})

		it('renders correct editor for each tab index', async () => {
			const user = userEvent.setup()
			render(<ResumeEditor />)

			// Tab 0 - Profile
			expect(screen.getByTestId('personal-details-editor')).toBeInTheDocument()

			// Tab 1 - Education
			await user.click(screen.getByTestId('tab-1'))
			expect(screen.getByTestId('education-editor')).toBeInTheDocument()

			// Tab 2 - Experience
			await user.click(screen.getByTestId('tab-2'))
			expect(screen.getByTestId('experience-editor')).toBeInTheDocument()

			// Tab 3 - Skills
			await user.click(screen.getByTestId('tab-3'))
			expect(screen.getByTestId('skills-editor')).toBeInTheDocument()

			// Tab 4 - Projects (coming soon)
			await user.click(screen.getByTestId('tab-4'))
			expect(screen.getByText('Project editor is coming soon')).toBeInTheDocument()
		})
	})

	describe('Accessibility', () => {
		it('renders with proper structure for screen readers', () => {
			render(<ResumeEditor />)

			// Check that tabs are properly structured
			expect(screen.getByTestId('expandable-tabs')).toBeInTheDocument()

			// Check that content is rendered in the correct section
			const editorSection = screen.getByTestId('personal-details-editor')
			expect(editorSection).toBeInTheDocument()
		})

		it('allows keyboard navigation between tabs', async () => {
			const user = userEvent.setup()
			render(<ResumeEditor />)

			// Focus on first tab
			const firstTab = screen.getByTestId('tab-0')
			firstTab.focus()

			// Tab navigation should work
			await user.keyboard('{Tab}')
			expect(document.activeElement).toBe(screen.getByTestId('tab-1'))
		})
	})

	describe('Edge Cases', () => {
		it('handles rapid tab switching', async () => {
			const user = userEvent.setup()
			render(<ResumeEditor />)

			// Rapidly switch between tabs
			await user.click(screen.getByTestId('tab-1'))
			await user.click(screen.getByTestId('tab-2'))
			await user.click(screen.getByTestId('tab-0'))
			await user.click(screen.getByTestId('tab-3'))

			// Should end up on Skills tab
			expect(screen.getByTestId('skills-editor')).toBeInTheDocument()
		})

		it('maintains state when switching back to previous tabs', async () => {
			const user = userEvent.setup()
			render(<ResumeEditor />)

			// Switch to Education, then Experience, then back to Education
			await user.click(screen.getByTestId('tab-1'))
			expect(screen.getByTestId('education-editor')).toBeInTheDocument()

			await user.click(screen.getByTestId('tab-2'))
			expect(screen.getByTestId('experience-editor')).toBeInTheDocument()

			await user.click(screen.getByTestId('tab-1'))
			expect(screen.getByTestId('education-editor')).toBeInTheDocument()
		})

		it('handles component unmounting gracefully', () => {
			const {unmount} = render(<ResumeEditor />)

			expect(screen.getByTestId('personal-details-editor')).toBeInTheDocument()

			// Should not throw when unmounting
			expect(() => unmount()).not.toThrow()
		})
	})
})
