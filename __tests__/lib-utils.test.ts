import {afterEach, beforeEach, describe, expect, it} from 'vitest'
import {apiDateToDate, cn, dateToApiFormat, deepCopy, sanitizeHtml, stripNullFields} from '../lib/utils'

describe('lib/utils.ts', () => {
	describe('cn function', () => {
		it('should merge class names correctly', () => {
			expect(cn('class1', 'class2')).toBe('class1 class2')
		})

		it('should handle conditional classes', () => {
			expect(cn('base', false && 'conditional')).toBe('base')
			expect(cn('base', true && 'conditional')).toBe('base conditional')
		})

		it('should handle undefined and null values', () => {
			expect(cn('base', undefined, null)).toBe('base')
		})

		it('should handle empty strings', () => {
			expect(cn('base', '', 'other')).toBe('base other')
		})

		it('should handle arrays of classes', () => {
			expect(cn(['class1', 'class2'], 'class3')).toBe('class1 class2 class3')
		})

		it('should handle objects with boolean values', () => {
			expect(cn({
				'active': true,
				'disabled': false,
				'visible': true
			})).toBe('active visible')
		})

		it('should merge Tailwind classes correctly', () => {
			// This tests the twMerge functionality
			expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4')
		})

		it('should handle complex combinations', () => {
			expect(cn(
				'base-class',
				{'conditional': true, 'hidden': false},
				['array-class1', 'array-class2'],
				undefined,
				'final-class'
			)).toBe('base-class conditional array-class1 array-class2 final-class')
		})
	})

	describe('deepCopy function', () => {
		it('should create a deep copy of an object', () => {
			const original = {a: 1, b: {c: 2, d: [3, 4]}}
			const copy = deepCopy(original)

			expect(copy).toEqual(original)
			expect(copy).not.toBe(original)
			expect(copy.b).not.toBe(original.b)
			expect(copy.b.d).not.toBe(original.b.d)
		})

		it('should handle arrays', () => {
			const original = [1, 2, {a: 3}, [4, 5]]
			const copy = deepCopy(original)

			expect(copy).toEqual(original)
			expect(copy).not.toBe(original)
			expect(copy[2]).not.toBe(original[2])
			expect(copy[3]).not.toBe(original[3])
		})

		it('should handle primitive values', () => {
			expect(deepCopy(42)).toBe(42)
			expect(deepCopy('string')).toBe('string')
			expect(deepCopy(true)).toBe(true)
			expect(deepCopy(null)).toBe(null)
		})

		it('should handle nested objects', () => {
			const original = {
				level1: {
					level2: {
						level3: {
							value: 'deep'
						}
					}
				}
			}
			const copy = deepCopy(original)

			expect(copy.level1.level2.level3.value).toBe('deep')
			expect(copy.level1.level2.level3).not.toBe(original.level1.level2.level3)
		})

		it('should handle empty objects and arrays', () => {
			expect(deepCopy({})).toEqual({})
			expect(deepCopy([])).toEqual([])
		})

		it('should handle objects with mixed data types', () => {
			const original = {
				string: 'test',
				number: 42,
				boolean: true,
				nullValue: null,
				array: [1, 'two', {three: 3}],
				object: {nested: 'value'}
			}
			const copy = deepCopy(original)

			expect(copy).toEqual(original)
			expect(copy).not.toBe(original)
			expect(copy.array).not.toBe(original.array)
			expect(copy.object).not.toBe(original.object)
		})

		it('should not handle functions, undefined, or symbols (JSON limitation)', () => {
			const original = {
				func: () => 'test',
				undef: undefined,
				symbol: Symbol('test'),
				valid: 'value'
			}
			const copy = deepCopy(original)

			expect(copy.func).toBeUndefined()
			expect(copy.undef).toBeUndefined()
			expect(copy.symbol).toBeUndefined()
			expect(copy.valid).toBe('value')
		})
	})

	describe('stripNullFields function', () => {
		it('should remove null fields from an object', () => {
			const input = {
				name: 'John',
				age: null,
				email: 'john@example.com',
				phone: null,
				active: true
			}
			const result = stripNullFields(input)

			expect(result).toEqual({
				name: 'John',
				email: 'john@example.com',
				active: true
			})
		})

		it('should preserve undefined values', () => {
			const input = {
				name: 'John',
				age: undefined,
				email: null,
				phone: 'valid'
			}
			const result = stripNullFields(input)

			expect(result).toEqual({
				name: 'John',
				age: undefined,
				phone: 'valid'
			})
		})

		it('should preserve false and 0 values', () => {
			const input = {
				name: 'John',
				active: false,
				count: 0,
				email: null,
				score: null
			}
			const result = stripNullFields(input)

			expect(result).toEqual({
				name: 'John',
				active: false,
				count: 0
			})
		})

		it('should handle empty objects', () => {
			expect(stripNullFields({})).toEqual({})
		})

		it('should handle objects with only null values', () => {
			const input = {
				a: null,
				b: null,
				c: null
			}
			const result = stripNullFields(input)

			expect(result).toEqual({})
		})

		it('should handle objects with no null values', () => {
			const input = {
				name: 'John',
				age: 30,
				active: true
			}
			const result = stripNullFields(input)

			expect(result).toEqual(input)
		})

		it('should preserve empty strings', () => {
			const input = {
				name: '',
				email: null,
				phone: 'valid'
			}
			const result = stripNullFields(input)

			expect(result).toEqual({
				name: '',
				phone: 'valid'
			})
		})

		it('should handle nested objects (shallow operation)', () => {
			const input = {
				user: {
					name: 'John',
					email: null
				},
				settings: null,
				active: true
			}
			const result = stripNullFields(input)

			expect(result).toEqual({
				user: {
					name: 'John',
					email: null // nested nulls are preserved
				},
				active: true
			})
		})
	})

	describe('dateToApiFormat function', () => {
		it('should format valid dates correctly', () => {
			const date = new Date('2024-01-15T10:30:00Z')
			expect(dateToApiFormat(date)).toBe('2024-01-15')
		})

		it('should handle single digit months and days', () => {
			const date = new Date('2024-03-05T10:30:00Z')
			expect(dateToApiFormat(date)).toBe('2024-03-05')
		})

		it('should handle December and day 31', () => {
			const date = new Date('2024-12-31T10:30:00Z')
			expect(dateToApiFormat(date)).toBe('2024-12-31')
		})

		it('should handle January 1st', () => {
			const date = new Date('2024-01-01T10:30:00Z')
			expect(dateToApiFormat(date)).toBe('2024-01-01')
		})

		it('should return null for null input', () => {
			expect(dateToApiFormat(null)).toBeNull()
		})

		it('should return null for undefined input', () => {
			expect(dateToApiFormat(undefined)).toBeNull()
		})

		it('should handle leap year dates', () => {
			const date = new Date('2024-02-29T10:30:00Z')
			expect(dateToApiFormat(date)).toBe('2024-02-29')
		})

		it('should handle different timezones consistently', () => {
			// Create date using local timezone
			const date = new Date(2024, 0, 15) // Month is 0-indexed
			const result = dateToApiFormat(date)
			expect(result).toBe('2024-01-15')
		})

		it('should handle edge case dates', () => {
			// Test with a very old date
			const oldDate = new Date('1900-01-01T00:00:00Z')
			expect(dateToApiFormat(oldDate)).toBe('1900-01-01')

			// Test with a future date - using local timezone to match function behavior
			const futureDate = new Date('2099-12-31T00:00:00')
			expect(dateToApiFormat(futureDate)).toBe('2099-12-31')
		})
	})

	describe('apiDateToDate function', () => {
		it('should convert valid date strings to Date objects', () => {
			const result = apiDateToDate('2024-01-15')
			expect(result).toBeInstanceOf(Date)
			expect(result?.getFullYear()).toBe(2024)
			expect(result?.getMonth()).toBe(0) // January is 0
			expect(result?.getDate()).toBe(15)
		})

		it('should handle ISO date strings', () => {
			const result = apiDateToDate('2024-01-15T10:30:00Z')
			expect(result).toBeInstanceOf(Date)
			expect(result?.getFullYear()).toBe(2024)
		})

		it('should return null for null input', () => {
			expect(apiDateToDate(null)).toBeNull()
		})

		it('should return null for undefined input', () => {
			expect(apiDateToDate(undefined)).toBeNull()
		})

		it('should return null for empty string', () => {
			expect(apiDateToDate('')).toBeNull()
		})

		it('should handle different date formats', () => {
			// MM/DD/YYYY format
			const result1 = apiDateToDate('01/15/2024')
			expect(result1).toBeInstanceOf(Date)

			// YYYY-MM-DD format
			const result2 = apiDateToDate('2024-01-15')
			expect(result2).toBeInstanceOf(Date)
		})

		it('should handle invalid date strings gracefully', () => {
			const result = apiDateToDate('invalid-date')
			expect(result).toBeInstanceOf(Date)
			// Check if the date is invalid by checking if getTime() returns NaN
			expect(Number.isNaN(result?.getTime())).toBe(true)
		})

		it('should be consistent with dateToApiFormat', () => {
			const originalDate = new Date('2024-01-15T10:30:00Z')
			const apiFormat = dateToApiFormat(originalDate)
			const convertedBack = apiDateToDate(apiFormat)

			expect(convertedBack?.getFullYear()).toBe(originalDate.getFullYear())
			expect(convertedBack?.getMonth()).toBe(originalDate.getMonth())
			expect(convertedBack?.getDate()).toBe(originalDate.getDate())
		})
	})

	describe('sanitizeHtml function', () => {
		// Mock window to be undefined for server-side tests
		const originalWindow = global.window

		beforeEach(() => {
			// @ts-ignore
			global.window = undefined
		})

		afterEach(() => {
			global.window = originalWindow
		})

		it('should strip all HTML tags in server environment', () => {
			// In test environment (no window), it should strip all tags
			const input = '<p>Hello <strong>world</strong>!</p>'
			const result = sanitizeHtml(input)

			expect(result).toBe('Hello world!')
		})

		it('should handle complex HTML structures in server environment', () => {
			const input = `
        <div class="container">
          <h1>Title</h1>
          <p>Paragraph with <a href="link">link</a></p>
          <ul>
            <li>Item 1</li>
            <li>Item 2</li>
          </ul>
        </div>
      `
			const result = sanitizeHtml(input)

			expect(result).toBe(`
        
          Title
          Paragraph with link
          
            Item 1
            Item 2
          
        
      `)
		})

		it('should handle self-closing tags', () => {
			const input = 'Line 1<br/>Line 2<hr/>Line 3'
			const result = sanitizeHtml(input)

			expect(result).toBe('Line 1Line 2Line 3')
		})

		it('should handle malformed HTML', () => {
			const input = '<p>Unclosed paragraph<div>Nested <span>content</div>'
			const result = sanitizeHtml(input)

			expect(result).toBe('Unclosed paragraphNested content')
		})

		it('should handle empty strings', () => {
			expect(sanitizeHtml('')).toBe('')
		})

		it('should handle strings without HTML', () => {
			const input = 'Plain text content'
			const result = sanitizeHtml(input)

			expect(result).toBe('Plain text content')
		})

		it('should handle HTML entities', () => {
			const input = '<p>&lt;script&gt;alert("test")&lt;/script&gt;</p>'
			const result = sanitizeHtml(input)

			expect(result).toBe('&lt;script&gt;alert("test")&lt;/script&gt;')
		})

		it('should handle script tags and dangerous content', () => {
			const input = `
        <p>Safe content</p>
        <script>alert('xss')</script>
        <img src="x" onerror="alert('xss')">
        <a href="javascript:alert('xss')">Link</a>
      `
			const result = sanitizeHtml(input)

			expect(result).not.toContain('<script>')
			expect(result).not.toContain('onerror')
			expect(result).not.toContain('javascript:')
			expect(result).toContain('Safe content')
			expect(result).toContain('Link')
		})

		it('should preserve safe HTML content structure when tags are removed', () => {
			const input = '<article><header><h1>Title</h1></header><main><p>Content</p></main></article>'
			const result = sanitizeHtml(input)

			expect(result).toBe('TitleContent')
		})
	})
})
