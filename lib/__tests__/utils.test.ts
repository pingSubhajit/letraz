import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import {apiDateToDate, dateToApiFormat, sanitizeHtml} from '@/lib/utils'

describe('dateToApiFormat', () => {
	it('should format date to YYYY-MM-DD format', () => {
		const date = new Date('2023-12-15T10:30:00Z')
		const result = dateToApiFormat(date)
		expect(result).toBe('2023-12-15')
	})

	it('should handle single digit months and days', () => {
		const date = new Date('2023-01-05T10:30:00Z')
		const result = dateToApiFormat(date)
		expect(result).toBe('2023-01-05')
	})

	it('should return null for null input', () => {
		const result = dateToApiFormat(null)
		expect(result).toBeNull()
	})

	it('should return null for undefined input', () => {
		const result = dateToApiFormat(undefined)
		expect(result).toBeNull()
	})

	it('should handle leap year dates', () => {
		const date = new Date('2020-02-29T10:30:00Z')
		const result = dateToApiFormat(date)
		expect(result).toBe('2020-02-29')
	})

	it('should handle year boundaries', () => {
		const newYear = new Date('2024-01-01T00:00:00Z')
		const result = dateToApiFormat(newYear)
		expect(result).toBe('2024-01-01')
	})

	it('should preserve local timezone when formatting', () => {
		// Test with a specific date that could be affected by timezone
		const date = new Date(2023, 11, 15) // December 15, 2023 in local time
		const result = dateToApiFormat(date)
		expect(result).toBe('2023-12-15')
	})
})

describe('apiDateToDate', () => {
	it('should convert API date string to Date object', () => {
		const result = apiDateToDate('2023-12-15')
		expect(result).toBeInstanceOf(Date)
		expect(result?.getFullYear()).toBe(2023)
		expect(result?.getMonth()).toBe(11) // December is month 11
		expect(result?.getDate()).toBe(15)
	})

	it('should handle ISO date strings', () => {
		const result = apiDateToDate('2023-12-15T10:30:00Z')
		expect(result).toBeInstanceOf(Date)
		expect(result?.getFullYear()).toBe(2023)
		expect(result?.getMonth()).toBe(11)
		expect(result?.getDate()).toBe(15)
	})

	it('should return null for null input', () => {
		const result = apiDateToDate(null)
		expect(result).toBeNull()
	})

	it('should return null for undefined input', () => {
		const result = apiDateToDate(undefined)
		expect(result).toBeNull()
	})

	it('should return null for empty string', () => {
		const result = apiDateToDate('')
		expect(result).toBeNull()
	})

	it('should handle invalid date strings', () => {
		const result = apiDateToDate('invalid-date')
		expect(result).toBeInstanceOf(Date)
		expect(result?.toString()).toBe('Invalid Date')
	})

	it('should handle leap year dates', () => {
		const result = apiDateToDate('2020-02-29')
		expect(result).toBeInstanceOf(Date)
		expect(result?.getFullYear()).toBe(2020)
		expect(result?.getMonth()).toBe(1) // February is month 1
		expect(result?.getDate()).toBe(29)
	})
})

describe('sanitizeHtml', () => {
	// Mock window for client-side tests
	const mockWindow = {
		location: {href: 'http://localhost'},
		document: {}
	}

	beforeEach(() => {
		vi.stubGlobal('window', mockWindow)
	})

	afterEach(() => {
		vi.unstubAllGlobals()
	})

	it('should preserve allowed tags', () => {
		const html = '<p>Hello <strong>world</strong></p>'
		const result = sanitizeHtml(html)
		expect(result).toBe('<p>Hello <strong>world</strong></p>')
	})

	it('should preserve allowed attributes', () => {
		const html = '<a href="https://example.com" target="_blank" rel="noopener">Link</a>'
		const result = sanitizeHtml(html)

		// Check that all expected attributes are present (order may vary)
		expect(result).toContain('href="https://example.com"')
		expect(result).toContain('target="_blank"')
		expect(result).toContain('rel="noopener"')
		expect(result).toContain('>Link</a>')
		expect(result).toMatch(/<a [^>]*href="https:\/\/example\.com"[^>]*>Link<\/a>/)
	})

	it('should remove disallowed tags', () => {
		const html = '<p>Hello</p><script>alert("xss")</script>'
		const result = sanitizeHtml(html)
		expect(result).toBe('<p>Hello</p>')
	})

	it('should remove disallowed attributes', () => {
		const html = '<p onclick="alert(\'xss\')">Click me</p>'
		const result = sanitizeHtml(html)
		expect(result).toBe('<p>Click me</p>')
	})

	it('should handle nested allowed tags', () => {
		const html = '<p>Text with <em>emphasis</em> and <strong>bold</strong></p>'
		const result = sanitizeHtml(html)
		expect(result).toBe('<p>Text with <em>emphasis</em> and <strong>bold</strong></p>')
	})

	it('should handle lists', () => {
		const html = '<ul><li>Item 1</li><li>Item 2</li></ul>'
		const result = sanitizeHtml(html)
		expect(result).toBe('<ul><li>Item 1</li><li>Item 2</li></ul>')
	})

	it('should handle line breaks', () => {
		const html = 'Line 1<br>Line 2<br/>Line 3'
		const result = sanitizeHtml(html)
		expect(result).toBe('Line 1<br>Line 2<br>Line 3')
	})

	it('should handle underlined text', () => {
		const html = '<p>This is <u>underlined</u> text</p>'
		const result = sanitizeHtml(html)
		expect(result).toBe('<p>This is <u>underlined</u> text</p>')
	})

	it('should handle ordered lists', () => {
		const html = '<ol><li>First</li><li>Second</li></ol>'
		const result = sanitizeHtml(html)
		expect(result).toBe('<ol><li>First</li><li>Second</li></ol>')
	})

	it('should handle empty input', () => {
		const result = sanitizeHtml('')
		expect(result).toBe('')
	})

	it('should handle plain text', () => {
		const html = 'Just plain text'
		const result = sanitizeHtml(html)
		expect(result).toBe('Just plain text')
	})

	describe('server-side fallback', () => {
		beforeEach(() => {
			vi.stubGlobal('window', undefined)
		})

		it('should strip all HTML tags on server-side', () => {
			const html = '<p>Hello <strong>world</strong></p>'
			const result = sanitizeHtml(html)
			expect(result).toBe('Hello world')
		})

		it('should handle complex HTML on server-side', () => {
			const html = '<div><p>Paragraph</p><script>alert("xss")</script><strong>Bold</strong></div>'
			const result = sanitizeHtml(html)
			expect(result).toBe('Paragraphalert("xss")Bold')
		})

		it('should handle empty input on server-side', () => {
			const result = sanitizeHtml('')
			expect(result).toBe('')
		})

		it('should handle plain text on server-side', () => {
			const html = 'Just plain text'
			const result = sanitizeHtml(html)
			expect(result).toBe('Just plain text')
		})
	})
})

describe('date transformation round-trip', () => {
	it('should maintain date integrity through round-trip conversion', () => {
		const originalDate = new Date('2023-12-15T10:30:00Z')
		const apiFormat = dateToApiFormat(originalDate)
		const convertedBack = apiDateToDate(apiFormat)

		expect(convertedBack).toBeInstanceOf(Date)
		expect(convertedBack?.getFullYear()).toBe(2023)
		expect(convertedBack?.getMonth()).toBe(11)
		expect(convertedBack?.getDate()).toBe(15)
	})

	it('should handle edge cases in round-trip conversion', () => {
		const leapYearDate = new Date(2020, 1, 29) // February 29, 2020 (leap year)
		const apiFormat = dateToApiFormat(leapYearDate)
		const convertedBack = apiDateToDate(apiFormat)

		expect(convertedBack).toBeInstanceOf(Date)
		expect(convertedBack?.getFullYear()).toBe(2020)
		expect(convertedBack?.getMonth()).toBe(1) // February is month 1 (0-indexed)
		expect(convertedBack?.getDate()).toBe(29)
	})

	it('should handle null values in round-trip', () => {
		const apiFormat = dateToApiFormat(null)
		const convertedBack = apiDateToDate(apiFormat)

		expect(apiFormat).toBeNull()
		expect(convertedBack).toBeNull()
	})
})
