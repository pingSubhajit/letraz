import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import React from 'react'
import {Button} from '@/components/ui/button'
import {
	apiMocks,
	createMockApiResponse,
	createMockFile,
	createMockFormData,
	createMockUser,
	render,
	renderWithoutProviders,
	renderWithProviders,
	screen,
	testHelpers
} from './index'

// Test component for testing utilities
const TestComponent: React.FC<{ onClick?: () => void; disabled?: boolean }> = ({
	onClick,
	disabled = false
}) => {
	const [count, setCount] = React.useState(0)

	return (
		<div data-testid="test-component">
			<h1>Test Component</h1>
			<p data-testid="count">Count: {count}</p>
			<Button
				onClick={() => {
					setCount(count + 1)
					onClick?.()
				}}
				disabled={disabled}
			>
				Increment
			</Button>
			<input
				aria-label="Test Input"
				data-testid="test-input"
				placeholder="Enter text"
			/>
		</div>
	)
}

describe('Test Utilities', () => {
	beforeEach(() => {
		apiMocks.reset()
	})

	afterEach(() => {
		testHelpers.cleanup.cleanupAll()
	})

	describe('Render Utilities', () => {
		it('should render components with custom render function', () => {
			render(<TestComponent />)

			expect(screen.getByTestId('test-component')).toBeInTheDocument()
			expect(screen.getByText('Test Component')).toBeInTheDocument()
			expect(screen.getByText('Count: 0')).toBeInTheDocument()
		})

		it('should render components with providers', () => {
			renderWithProviders(<TestComponent />)

			expect(screen.getByTestId('test-component')).toBeInTheDocument()
			expect(screen.getByRole('button', {name: 'Increment'})).toBeInTheDocument()
		})

		it('should render components without providers', () => {
			renderWithoutProviders(<TestComponent />)

			expect(screen.getByTestId('test-component')).toBeInTheDocument()
		})
	})

	describe('User Interaction Helpers', () => {
		it('should handle button clicks', async () => {
			const mockClick = vi.fn()
			render(<TestComponent onClick={mockClick} />)

			await testHelpers.user.clickButton('Increment')

			expect(mockClick).toHaveBeenCalledOnce()
			expect(screen.getByText('Count: 1')).toBeInTheDocument()
		})

		it('should handle input interactions', async () => {
			render(<TestComponent />)

			await testHelpers.user.fillInput('Test Input', 'Hello World')

			testHelpers.assert.expectInputToHaveValue('Test Input', 'Hello World')
		})

		it('should handle keyboard interactions', async () => {
			render(<TestComponent />)

			const input = screen.getByLabelText('Test Input')
			input.focus()

			await testHelpers.user.pressEnter()
			await testHelpers.user.pressTab()

			// Verify keyboard events were handled
			expect(document.activeElement).not.toBe(input)
		})
	})

	describe('Assertion Helpers', () => {
		it('should provide element visibility assertions', () => {
			render(<TestComponent />)

			const component = screen.getByTestId('test-component')
			testHelpers.assert.expectElementToBeVisible(component)
		})

		it('should provide button state assertions', () => {
			render(<TestComponent disabled={false} />)

			testHelpers.assert.expectButtonToBeEnabled('Increment')
		})

		it('should handle disabled button assertions', () => {
			render(<TestComponent disabled={true} />)

			testHelpers.assert.expectButtonToBeDisabled('Increment')
		})
	})

	describe('Mock Factories', () => {
		it('should create mock user data', () => {
			const mockUser = createMockUser({
				name: 'Custom User',
				email: 'custom@example.com'
			})

			expect(mockUser.name).toBe('Custom User')
			expect(mockUser.email).toBe('custom@example.com')
			expect(mockUser.id).toBe('user_123')
		})

		it('should create mock API responses', () => {
			const mockResponse = createMockApiResponse({message: 'Success'})

			expect(mockResponse.data).toEqual({message: 'Success'})
			expect(mockResponse.status).toBe(200)
			expect(mockResponse.success).toBe(true)
		})

		it('should create mock files', () => {
			const mockFile = createMockFile('test.txt', 'test content', 'text/plain')

			expect(mockFile.name).toBe('test.txt')
			expect(mockFile.type).toMatch(/text\/plain/)
			expect(mockFile.size).toBeGreaterThan(0)
		})

		it('should create mock form data', () => {
			const formData = createMockFormData({
				name: 'John Doe',
				email: 'john@example.com',
				age: 30
			})

			expect(formData.get('name')).toBe('John Doe')
			expect(formData.get('email')).toBe('john@example.com')
			expect(formData.get('age')).toBe('30')
		})
	})

	describe('API Mocking Utilities', () => {
		it('should mock successful API responses', async () => {
			const testData = {message: 'Success'}
			apiMocks.mockSuccess('/api/test', testData)

			const response = await fetch('/api/test')
			const data = await response.json()

			expect(response.ok).toBe(true)
			expect(data).toEqual(testData)
		})

		it('should mock API errors', async () => {
			apiMocks.mockError('/api/error', {status: 404, message: 'Not Found'})

			const response = await fetch('/api/error')
			const data = await response.json()

			expect(response.status).toBe(404)
			expect(data.message).toBe('Not Found')
		})

		it('should verify fetch calls', async () => {
			apiMocks.mockSuccess('/api/verify', {success: true})

			await fetch('/api/verify')

			apiMocks.verifyFetchCalled('/api/verify', 1)
		})

		it('should mock different HTTP methods', async () => {
			const postData = {id: 1, name: 'Created'}
			apiMocks.mockPost('/api/create', postData)

			const response = await fetch('/api/create', {method: 'POST'})
			const data = await response.json()

			expect(response.status).toBe(201)
			expect(data).toEqual(postData)
		})
	})

	describe('Async Helpers', () => {
		it('should wait for elements to appear', async () => {
			const DelayedComponent = () => {
				const [show, setShow] = React.useState(false)

				React.useEffect(() => {
					setTimeout(() => setShow(true), 100)
				}, [])

				return show ? <div>Delayed Content</div> : <div>Loading...</div>
			}

			render(<DelayedComponent />)

			expect(screen.getByText('Loading...')).toBeInTheDocument()

			await testHelpers.async.waitForElementToAppear('Delayed Content')

			expect(screen.getByText('Delayed Content')).toBeInTheDocument()
		})

		it('should wait for loading to finish', async () => {
			const LoadingComponent = () => {
				const [loading, setLoading] = React.useState(true)

				React.useEffect(() => {
					setTimeout(() => setLoading(false), 100)
				}, [])

				return loading ? <div>Loading...</div> : <div>Content Loaded</div>
			}

			render(<LoadingComponent />)

			await testHelpers.async.waitForLoadingToFinish()

			expect(screen.getByText('Content Loaded')).toBeInTheDocument()
		})
	})

	describe('Component Helpers', () => {
		it('should test component rendering', () => {
			render(<TestComponent />)

			testHelpers.component.expectComponentToRender('test-component')
		})

		it('should test component props', () => {
			render(<TestComponent />)

			const button = screen.getByRole('button', {name: 'Increment'})
			testHelpers.component.expectComponentToHaveProps(button, {
				type: 'button'
			})
		})
	})

	describe('Test Data Helpers', () => {
		it('should generate random data', () => {
			const randomString = testHelpers.data.randomString(5)
			const randomEmail = testHelpers.data.randomEmail()
			const randomNumber = testHelpers.data.randomNumber(1, 10)
			const randomBoolean = testHelpers.data.randomBoolean()

			expect(randomString).toHaveLength(5)
			expect(randomEmail).toMatch(/@example\.com$/)
			expect(randomNumber).toBeGreaterThanOrEqual(1)
			expect(randomNumber).toBeLessThanOrEqual(10)
			expect(typeof randomBoolean).toBe('boolean')
		})
	})

	describe('Mock Helpers', () => {
		it('should mock console methods', () => {
			const consoleMock = testHelpers.mock.mockConsole()

			console.log('test message')
			console.warn('test warning')
			console.error('test error')

			expect(consoleMock.mockLog).toHaveBeenCalledWith('test message')
			expect(consoleMock.mockWarn).toHaveBeenCalledWith('test warning')
			expect(consoleMock.mockError).toHaveBeenCalledWith('test error')

			consoleMock.restore()
		})

		it('should mock timers', () => {
			const timerMock = testHelpers.mock.mockTimers()
			const callback = vi.fn()

			setTimeout(callback, 1000)

			expect(callback).not.toHaveBeenCalled()

			timerMock.advanceTime(1000)

			expect(callback).toHaveBeenCalledOnce()

			timerMock.restore()
		})
	})

	describe('Form Helpers', () => {
		it('should fill and submit forms', async () => {
			const FormComponent = () => {
				const [submitted, setSubmitted] = React.useState(false)

				return (
					<form onSubmit={(e) => {
						e.preventDefault()
						setSubmitted(true)
					}}>
						<input aria-label="Name" name="name" />
						<input aria-label="Email" name="email" type="email" />
						<button type="submit">Submit Form</button>
						{submitted && <div>Form Submitted</div>}
					</form>
				)
			}

			render(<FormComponent />)

			await testHelpers.form.fillAndSubmitForm({
				Name: 'John Doe',
				Email: 'john@example.com'
			}, 'Submit Form')

			expect(screen.getByText('Form Submitted')).toBeInTheDocument()
		})
	})
})
