import {describe, expect, it} from 'vitest'
import {render, screen} from '@testing-library/react'

// Simple test component to verify React testing setup
const TestComponent = ({message}: { message: string }) => {
	return (
		<div data-testid="test-component">
			<h1>Test Component</h1>
			<p>{message}</p>
		</div>
	)
}

describe('React Testing Setup', () => {
	it('should render React components correctly', () => {
		render(<TestComponent message="Hello from test!" />)

		expect(screen.getByTestId('test-component')).toBeInTheDocument()
		expect(screen.getByRole('heading', {level: 1})).toHaveTextContent('Test Component')
		expect(screen.getByText('Hello from test!')).toBeInTheDocument()
	})

	it('should support React Testing Library queries', () => {
		render(<TestComponent message="Query test" />)

		// Test different query methods
		expect(screen.getByTestId('test-component')).toBeVisible()
		expect(screen.getByRole('heading')).toBeInTheDocument()
		expect(screen.getByText(/Query test/i)).toBeInTheDocument()
		expect(screen.queryByText('Non-existent text')).not.toBeInTheDocument()
	})

	it('should clean up DOM after each test', () => {
		/*
		 * This test verifies that the DOM is clean between tests
		 * The cleanup function should remove all rendered components
		 */
		expect(document.body.innerHTML).toBe('')
	})
})
