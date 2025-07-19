import {type MockedFunction, vi} from 'vitest'
import {screen, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Common test helpers for reusable testing patterns

// User interaction helpers
export const userInteraction = {
	// Click helpers
	async clickButton(name: string | RegExp): Promise<void> {
		const button = screen.getByRole('button', {name})
		await userEvent.click(button)
	},

	async clickLink(name: string | RegExp): Promise<void> {
		const link = screen.getByRole('link', {name})
		await userEvent.click(link)
	},

	// Form interaction helpers
	async fillInput(labelText: string | RegExp, value: string): Promise<void> {
		const input = screen.getByLabelText(labelText)
		await userEvent.clear(input)
		await userEvent.type(input, value)
	},

	async fillTextarea(labelText: string | RegExp, value: string): Promise<void> {
		const textarea = screen.getByLabelText(labelText)
		await userEvent.clear(textarea)
		await userEvent.type(textarea, value)
	},

	async selectOption(labelText: string | RegExp, optionText: string): Promise<void> {
		const select = screen.getByLabelText(labelText)
		await userEvent.selectOptions(select, optionText)
	},

	async checkCheckbox(labelText: string | RegExp): Promise<void> {
		const checkbox = screen.getByLabelText(labelText)
		await userEvent.click(checkbox)
	},

	async uploadFile(labelText: string | RegExp, file: File): Promise<void> {
		const input = screen.getByLabelText(labelText) as HTMLInputElement
		await userEvent.upload(input, file)
	},

	// Keyboard interaction helpers
	async pressKey(key: string): Promise<void> {
		await userEvent.keyboard(`{${key}}`)
	},

	async pressEnter(): Promise<void> {
		await userEvent.keyboard('{Enter}')
	},

	async pressEscape(): Promise<void> {
		await userEvent.keyboard('{Escape}')
	},

	async pressTab(): Promise<void> {
		await userEvent.keyboard('{Tab}')
	},

	// Hover helpers
	async hoverElement(element: HTMLElement): Promise<void> {
		await userEvent.hover(element)
	},

	async unhoverElement(element: HTMLElement): Promise<void> {
		await userEvent.unhover(element)
	}
}

// Assertion helpers
export const assertions = {
	// Element visibility assertions
	expectElementToBeVisible(element: HTMLElement): void {
		expect(element).toBeInTheDocument()
		expect(element).toBeVisible()
	},

	expectElementToBeHidden(element: HTMLElement): void {
		expect(element).toBeInTheDocument()
		expect(element).not.toBeVisible()
	},

	// Form assertions
	expectInputToHaveValue(labelText: string | RegExp, value: string): void {
		const input = screen.getByLabelText(labelText)
		expect(input).toHaveValue(value)
	},

	expectCheckboxToBeChecked(labelText: string | RegExp): void {
		const checkbox = screen.getByLabelText(labelText)
		expect(checkbox).toBeChecked()
	},

	expectCheckboxToBeUnchecked(labelText: string | RegExp): void {
		const checkbox = screen.getByLabelText(labelText)
		expect(checkbox).not.toBeChecked()
	},

	// Button state assertions
	expectButtonToBeEnabled(name: string | RegExp): void {
		const button = screen.getByRole('button', {name})
		expect(button).toBeEnabled()
	},

	expectButtonToBeDisabled(name: string | RegExp): void {
		const button = screen.getByRole('button', {name})
		expect(button).toBeDisabled()
	},

	// Loading state assertions
	expectLoadingToBeVisible(): void {
		expect(screen.getByText(/loading/i)).toBeInTheDocument()
	},

	expectLoadingToBeHidden(): void {
		expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
	},

	// Error message assertions
	expectErrorMessage(message: string | RegExp): void {
		expect(screen.getByText(message)).toBeInTheDocument()
	},

	expectNoErrorMessage(): void {
		expect(screen.queryByRole('alert')).not.toBeInTheDocument()
	},

	// Success message assertions
	expectSuccessMessage(message: string | RegExp): void {
		expect(screen.getByText(message)).toBeInTheDocument()
	}
}

// Async testing helpers
export const asyncHelpers = {
	// Wait for element to appear
	async waitForElementToAppear(text: string | RegExp): Promise<HTMLElement> {
		return await waitFor(() => screen.getByText(text))
	},

	// Wait for element to disappear
	async waitForElementToDisappear(text: string | RegExp): Promise<void> {
		await waitFor(() => {
			expect(screen.queryByText(text)).not.toBeInTheDocument()
		})
	},

	// Wait for loading to finish
	async waitForLoadingToFinish(): Promise<void> {
		await waitFor(() => {
			expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
		})
	},

	// Wait for API call to complete
	async waitForApiCall(mockFn: MockedFunction<any>, times = 1): Promise<void> {
		await waitFor(() => {
			expect(mockFn).toHaveBeenCalledTimes(times)
		})
	},

	// Wait with custom timeout
	async waitForCondition(
		condition: () => void | Promise<void>,
		timeout = 5000
	): Promise<void> {
		await waitFor(condition, {timeout})
	}
}

// Form testing helpers
export const formHelpers = {
	// Fill out a complete form
	async fillForm(formData: Record<string, any>): Promise<void> {
		for (const [field, value] of Object.entries(formData)) {
			if (typeof value === 'string') {
				await userInteraction.fillInput(new RegExp(field, 'i'), value)
			} else if (typeof value === 'boolean' && value) {
				await userInteraction.checkCheckbox(new RegExp(field, 'i'))
			}
		}
	},

	// Submit a form
	async submitForm(submitButtonText = /submit/i): Promise<void> {
		await userInteraction.clickButton(submitButtonText)
	},

	// Fill and submit form
	async fillAndSubmitForm(
		formData: Record<string, any>,
		submitButtonText = /submit/i
	): Promise<void> {
		await this.fillForm(formData)
		await this.submitForm(submitButtonText)
	},

	// Validate form errors
	expectFormErrors(errors: string[]): void {
		errors.forEach(error => {
			expect(screen.getByText(error)).toBeInTheDocument()
		})
	},

	// Validate no form errors
	expectNoFormErrors(): void {
		expect(screen.queryByRole('alert')).not.toBeInTheDocument()
	}
}

// Component testing helpers
export const componentHelpers = {
	// Test component rendering
	expectComponentToRender(testId: string): void {
		expect(screen.getByTestId(testId)).toBeInTheDocument()
	},

	// Test component props
	expectComponentToHaveProps(element: HTMLElement, props: Record<string, any>): void {
		Object.entries(props).forEach(([prop, value]) => {
			if (prop === 'className') {
				expect(element).toHaveClass(value)
			} else if (prop === 'textContent') {
				expect(element).toHaveTextContent(value)
			} else {
				expect(element).toHaveAttribute(prop, String(value))
			}
		})
	},

	// Test component children
	expectComponentToHaveChildren(parent: HTMLElement, childCount: number): void {
		expect(parent.children).toHaveLength(childCount)
	},

	// Test component accessibility
	expectComponentToBeAccessible(element: HTMLElement): void {
		// Basic accessibility checks
		if (element.tagName === 'BUTTON') {
			expect(element).toHaveAttribute('type')
		}
		if (element.tagName === 'INPUT') {
			expect(element).toHaveAttribute('id')
			// Should have associated label
			const id = element.getAttribute('id')
			if (id) {
				expect(screen.getByLabelText(new RegExp(id, 'i'))).toBeInTheDocument()
			}
		}
		if (element.tagName === 'IMG') {
			expect(element).toHaveAttribute('alt')
		}
	}
}

// Mock helpers
export const mockHelpers = {
	// Create a mock component
	createMockComponent: (name: string, props?: any) => {
		return vi.fn().mockImplementation((componentProps) => {
			return {
				type: 'div',
				props: {
					'data-testid': `mock-${name.toLowerCase()}`,
					...props,
					...componentProps
				}
			}
		})
	},

	// Mock React hooks
	mockUseState: <T>(initialValue: T): [T, MockedFunction<any>] => {
		const setState = vi.fn()
		return [initialValue, setState]
	},

	mockUseEffect: (): MockedFunction<any> => {
		return vi.fn()
	},

	// Mock console methods
	mockConsole: () => {
		const originalConsole = {...console}
		const mockLog = vi.spyOn(console, 'log').mockImplementation(() => {})
		const mockWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})
		const mockError = vi.spyOn(console, 'error').mockImplementation(() => {})

		return {
			mockLog,
			mockWarn,
			mockError,
			restore: () => {
				Object.assign(console, originalConsole)
			}
		}
	},

	// Mock timers
	mockTimers: () => {
		try {
			vi.useFakeTimers()
			return {
				advanceTime: (ms: number) => vi.advanceTimersByTime(ms),
				runAllTimers: () => vi.runAllTimers(),
				restore: () => vi.useRealTimers()
			}
		} catch (error) {
			// Fallback for older versions of vitest
			const originalSetTimeout = global.setTimeout
			const originalClearTimeout = global.clearTimeout
			const originalSetInterval = global.setInterval
			const originalClearInterval = global.clearInterval

			const timers: Array<{ id: number; callback: Function; delay: number; type: 'timeout' | 'interval' }> = []
			let timerId = 0
			let currentTime = 0

			global.setTimeout = vi.fn((callback: Function, delay: number = 0) => {
				const id = ++timerId
				timers.push({id, callback, delay: currentTime + delay, type: 'timeout'})
				return id
			}) as any

			global.clearTimeout = vi.fn((id: number) => {
				const index = timers.findIndex(timer => timer.id === id && timer.type === 'timeout')
				if (index !== -1) {
					timers.splice(index, 1)
				}
			}) as any

			global.setInterval = vi.fn((callback: Function, delay: number = 0) => {
				const id = ++timerId
				timers.push({id, callback, delay: currentTime + delay, type: 'interval'})
				return id
			}) as any

			global.clearInterval = vi.fn((id: number) => {
				const index = timers.findIndex(timer => timer.id === id && timer.type === 'interval')
				if (index !== -1) {
					timers.splice(index, 1)
				}
			}) as any

			return {
				advanceTime: (ms: number) => {
					currentTime += ms
					const readyTimers = timers.filter(timer => timer.delay <= currentTime)
					readyTimers.forEach(timer => {
						timer.callback()
						if (timer.type === 'timeout') {
							const index = timers.indexOf(timer)
							if (index !== -1) {
								timers.splice(index, 1)
							}
						} else {
							// For intervals, reschedule
							timer.delay = currentTime + (timer.delay - currentTime)
						}
					})
				},
				runAllTimers: () => {
					while (timers.length > 0) {
						const nextTimer = timers.reduce((earliest, timer) => timer.delay < earliest.delay ? timer : earliest)
						currentTime = nextTimer.delay
						nextTimer.callback()
						if (nextTimer.type === 'timeout') {
							const index = timers.indexOf(nextTimer)
							if (index !== -1) {
								timers.splice(index, 1)
							}
						}
					}
				},
				restore: () => {
					global.setTimeout = originalSetTimeout
					global.clearTimeout = originalClearTimeout
					global.setInterval = originalSetInterval
					global.clearInterval = originalClearInterval
					timers.length = 0
					currentTime = 0
				}
			}
		}
	}
}

// Test data helpers
export const testDataHelpers = {
	// Generate random string
	randomString: (length = 10): string => {
		return Math.random().toString(36).substring(2, length + 2)
	},

	// Generate random email
	randomEmail: (): string => {
		return `${testDataHelpers.randomString()}@example.com`
	},

	// Generate random number
	randomNumber: (min = 0, max = 100): number => {
		return Math.floor(Math.random() * (max - min + 1)) + min
	},

	// Generate random date
	randomDate: (start = new Date(2020, 0, 1), end = new Date()): Date => {
		return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
	},

	// Generate random boolean
	randomBoolean: (): boolean => {
		return Math.random() < 0.5
	}
}

// Cleanup helpers
export const cleanupHelpers = {
	// Clean up all mocks
	cleanupMocks: (): void => {
		vi.clearAllMocks()
	},

	// Clean up timers
	cleanupTimers: (): void => {
		try {
			vi.useRealTimers()
		} catch {
			// Ignore if timers are not mocked
		}
	},

	// Clean up DOM
	cleanupDOM: (): void => {
		if (typeof document !== 'undefined' && document.body) {
			document.body.innerHTML = ''
		}
	},

	// Clean up storage
	cleanupStorage: (): void => {
		if (typeof window !== 'undefined') {
			if (window.localStorage) {
				window.localStorage.clear()
			}
			if (window.sessionStorage) {
				window.sessionStorage.clear()
			}
		}
	},

	// Clean up everything
	cleanupAll: (): void => {
		cleanupHelpers.cleanupMocks()
		cleanupHelpers.cleanupTimers()
		cleanupHelpers.cleanupDOM()
		cleanupHelpers.cleanupStorage()
	}
}

// Export all helpers as a single object for convenience
export const testHelpers = {
	user: userInteraction,
	assert: assertions,
	async: asyncHelpers,
	form: formHelpers,
	component: componentHelpers,
	mock: mockHelpers,
	data: testDataHelpers,
	cleanup: cleanupHelpers
}
