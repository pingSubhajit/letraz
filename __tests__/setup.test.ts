import {describe, expect, it, vi} from 'vitest'
import {createMockResponse, mockApiSuccess, TestError} from '../test-setup'

describe('Test Setup Configuration', () => {
	it('should have jest-dom matchers available', () => {
		const element = document.createElement('div')
		element.textContent = 'Hello World'
		document.body.appendChild(element)

		expect(element).toBeInTheDocument()
		expect(element).toHaveTextContent('Hello World')

		document.body.removeChild(element)
	})

	it('should have global mocks configured', () => {
		// Test that fetch is mocked
		expect(global.fetch).toBeDefined()
		expect(vi.isMockFunction(global.fetch)).toBe(true)

		// Test that localStorage is mocked
		expect(window.localStorage).toBeDefined()
		expect(vi.isMockFunction(window.localStorage.getItem)).toBe(true)

		// Test that matchMedia is mocked
		expect(window.matchMedia).toBeDefined()
		expect(vi.isMockFunction(window.matchMedia)).toBe(true)
	})

	it('should have ResizeObserver and IntersectionObserver mocked', () => {
		expect(global.ResizeObserver).toBeDefined()
		expect(global.IntersectionObserver).toBeDefined()

		const resizeObserver = new ResizeObserver(() => {})
		expect(resizeObserver.observe).toBeDefined()
		expect(vi.isMockFunction(resizeObserver.observe)).toBe(true)

		const intersectionObserver = new IntersectionObserver(() => {})
		expect(intersectionObserver.observe).toBeDefined()
		expect(vi.isMockFunction(intersectionObserver.observe)).toBe(true)
	})

	it('should have scroll methods mocked', () => {
		expect(window.scrollTo).toBeDefined()
		expect(vi.isMockFunction(window.scrollTo)).toBe(true)

		const element = document.createElement('div')
		expect(element.scrollIntoView).toBeDefined()
		expect(vi.isMockFunction(element.scrollIntoView)).toBe(true)
	})

	it('should provide helper functions for API mocking', async () => {
		const mockData = {message: 'success'}
		const response = await createMockResponse(mockData)

		expect(response.ok).toBe(true)
		expect(response.status).toBe(200)
		expect(await response.json()).toEqual(mockData)
	})

	it('should provide mockApiSuccess helper', () => {
		const testData = {id: 1, name: 'Test'}
		mockApiSuccess(testData)

		expect(global.fetch).toHaveBeenCalledTimes(0) // Not called yet, just mocked
	})

	it('should provide TestError class for error boundary testing', () => {
		const error = new TestError('Custom test error')
		expect(error).toBeInstanceOf(Error)
		expect(error.name).toBe('TestError')
		expect(error.message).toBe('Custom test error')
	})

	it('should have DOM environment configured', () => {
		// Test that we're in a DOM environment
		expect(document).toBeDefined()
		expect(window).toBeDefined()
		expect(document.createElement).toBeDefined()

		// Test basic DOM manipulation
		const div = document.createElement('div')
		div.className = 'test-class'
		div.setAttribute('data-testid', 'test-element')

		expect(div.className).toBe('test-class')
		expect(div.getAttribute('data-testid')).toBe('test-element')
	})

	it('should clean up after each test', () => {
		/*
		 * This test verifies that cleanup is working
		 * The cleanup function is called automatically after each test
		 */
		expect(document.body.children.length).toBe(0)
	})
})
