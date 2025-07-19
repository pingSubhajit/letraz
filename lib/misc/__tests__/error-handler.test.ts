import {describe, expect, it} from 'vitest'
import {ZodError} from 'zod'
import {handleErrors} from '@/lib/misc/error-handler'

describe('handleErrors', () => {
	it('should handle ZodError with formatted message', () => {
		const zodError = new ZodError([
			{
				code: 'invalid_type',
				expected: 'string',
				received: 'number',
				path: ['name'],
				message: 'Expected string, received number'
			},
			{
				code: 'too_small',
				minimum: 2,
				type: 'string',
				inclusive: true,
				exact: false,
				path: ['email'],
				message: 'String must contain at least 2 character(s)'
			}
		])

		expect(() => handleErrors(zodError, 'test validation')).toThrow(
			'Validation failed for test validation: Expected string, received number, String must contain at least 2 character(s)'
		)
	})

	it('should handle single ZodError', () => {
		const zodError = new ZodError([
			{
				code: 'invalid_type',
				expected: 'string',
				received: 'number',
				path: ['name'],
				message: 'Expected string, received number'
			}
		])

		expect(() => handleErrors(zodError, 'single validation')).toThrow(
			'Validation failed for single validation: Expected string, received number'
		)
	})

	it('should handle generic Error', () => {
		const genericError = new Error('Something went wrong')

		expect(() => handleErrors(genericError, 'generic operation')).toThrow(
			'Failed to generic operation: Something went wrong'
		)
	})

	it('should handle unknown error types', () => {
		const unknownError = 'string error'

		expect(() => handleErrors(unknownError, 'unknown operation')).toThrow(
			'An unknown error occurred while trying to unknown operation'
		)
	})

	it('should handle null error', () => {
		expect(() => handleErrors(null, 'null operation')).toThrow(
			'An unknown error occurred while trying to null operation'
		)
	})

	it('should handle undefined error', () => {
		expect(() => handleErrors(undefined, 'undefined operation')).toThrow(
			'An unknown error occurred while trying to undefined operation'
		)
	})

	it('should handle object error', () => {
		const objectError = {message: 'Custom error object'}

		expect(() => handleErrors(objectError, 'object operation')).toThrow(
			'An unknown error occurred while trying to object operation'
		)
	})

	it('should always throw and never return', () => {
		let errorThrown = false

		try {
			handleErrors(new Error('test'), 'test context')
		} catch (error) {
			errorThrown = true
		}

		expect(errorThrown).toBe(true)
	})
})
