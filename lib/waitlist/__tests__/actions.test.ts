import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest'

// Create a hoisted mock that's available during module import time
const mockEmailSend = vi.hoisted(() => vi.fn())

// Mock Resend with proper structure
vi.mock('resend', () => {
	return {
		Resend: vi.fn().mockImplementation(() => ({
			emails: {
				send: mockEmailSend
			}
		}))
	}
})

import {signUpForWaitlist} from '../actions'
import {Resend} from 'resend'
import WaitlistWelcomeEmail from '@/emails/welcome'
import * as Sentry from '@sentry/nextjs'

// Mock Sentry
vi.mock('@sentry/nextjs', () => ({
	captureException: vi.fn()
}))

// Mock environment variables
const originalEnv = process.env

beforeEach(() => {
	process.env = {
		...originalEnv,
		API_URL: 'https://api.example.com',
		RESEND_API_KEY: 'test-resend-key'
	}
	// Clear only the email send mock, not the Resend constructor mock
	mockEmailSend.mockClear()
	vi.mocked(Sentry.captureException).mockClear()
})

afterEach(() => {
	process.env = originalEnv
})

describe('signUpForWaitlist', () => {
	it('should successfully sign up for waitlist and send welcome email', async () => {
		const mockResponse = {
			ok: true,
			json: vi.fn().mockResolvedValue({
				email: 'test@example.com',
				referrer: 'friend'
			})
		}
		;(global.fetch as any).mockResolvedValue(mockResponse)
		mockEmailSend.mockResolvedValue({id: 'email-123'})

		const result = await signUpForWaitlist('test@example.com', 'friend')

		expect(global.fetch).toHaveBeenCalledWith(`${process.env.API_URL}/waitlist/`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				email: 'test@example.com',
				referrer: 'friend'
			})
		})
		expect(mockEmailSend).toHaveBeenCalledWith({
			from: 'Subhajit from Letraz <subhajit@letraz.app>',
			replyTo: 'Subhajit from Letraz <subhajit@letraz.app>',
			to: 'test@example.com',
			subject: 'Welcome to Letraz waitlist!',
			react: expect.any(Object)
		})
		expect(result).toEqual({
			email: 'test@example.com',
			referrer: 'friend'
		})
	})

	it('should handle signup without referrer', async () => {
		const mockResponse = {
			ok: true,
			json: vi.fn().mockResolvedValue({
				email: 'test@example.com',
				referrer: undefined
			})
		}
		;(global.fetch as any).mockResolvedValue(mockResponse)
		mockEmailSend.mockResolvedValue({id: 'email-123'})

		const result = await signUpForWaitlist('test@example.com')

		expect(global.fetch).toHaveBeenCalledWith(`${process.env.API_URL}/waitlist/`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				email: 'test@example.com',
				referrer: undefined
			})
		})
		expect(result).toEqual({
			email: 'test@example.com',
			referrer: undefined
		})
	})

	it('should handle API failure and return validated params', async () => {
		const mockResponse = {
			ok: false,
			status: 400
		}
		;(global.fetch as any).mockResolvedValue(mockResponse)

		const result = await signUpForWaitlist('test@example.com', 'friend')

		expect(global.fetch).toHaveBeenCalledWith(`${process.env.API_URL}/waitlist/`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				email: 'test@example.com',
				referrer: 'friend'
			})
		})
		expect(result).toEqual({
			email: 'test@example.com',
			referrer: 'friend'
		})
		expect(mockEmailSend).not.toHaveBeenCalled()
	})

	it('should handle email sending failure gracefully', async () => {
		const mockResponse = {
			ok: true,
			json: vi.fn().mockResolvedValue({
				email: 'test@example.com',
				referrer: 'friend'
			})
		}
		;(global.fetch as any).mockResolvedValue(mockResponse)
		mockEmailSend.mockRejectedValue(new Error('Email sending failed'))

		const result = await signUpForWaitlist('test@example.com', 'friend')

		expect(global.fetch).toHaveBeenCalledWith(`${process.env.API_URL}/waitlist/`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				email: 'test@example.com',
				referrer: 'friend'
			})
		})
		expect(result).toEqual({
			email: 'test@example.com',
			referrer: 'friend'
		})
		expect(Sentry.captureException).toHaveBeenCalledWith(new Error('Email sending failed'))
	})

	it('should handle network errors', async () => {
		;(global.fetch as any).mockRejectedValue(new Error('Network error'))

		await expect(signUpForWaitlist('test@example.com')).rejects.toThrow('Network error')
	})

	it('should validate email format', async () => {
		await expect(signUpForWaitlist('invalid-email')).rejects.toThrow()
	})

	it('should handle long referrer strings', async () => {
		const longReferrer = 'a'.repeat(100) // Very long referrer

		await expect(signUpForWaitlist('test@example.com', longReferrer)).rejects.toThrow()
	})

	it('should handle malformed API response', async () => {
		const mockResponse = {
			ok: true,
			json: vi.fn().mockResolvedValue({
				// Missing required fields - this should cause WaitlistMutationSchema.parse to throw
				invalid: 'data'
			})
		}
		;(global.fetch as any).mockResolvedValue(mockResponse)

		await expect(signUpForWaitlist('test@example.com')).rejects.toThrow()
	})

	it('should use Resend service for email sending', async () => {
		const mockResponse = {
			ok: true,
			json: vi.fn().mockResolvedValue({
				email: 'test@example.com'
			})
		}
		;(global.fetch as any).mockResolvedValue(mockResponse)
		mockEmailSend.mockResolvedValue({id: 'email-123'})

		await signUpForWaitlist('test@example.com')

		// Verify that the Resend email service was used correctly
		expect(mockEmailSend).toHaveBeenCalledWith({
			from: 'Subhajit from Letraz <subhajit@letraz.app>',
			replyTo: 'Subhajit from Letraz <subhajit@letraz.app>',
			to: 'test@example.com',
			subject: 'Welcome to Letraz waitlist!',
			react: expect.any(Object)
		})
	})

	it('should handle empty email string', async () => {
		await expect(signUpForWaitlist('')).rejects.toThrow()
	})

	it('should handle null referrer explicitly', async () => {
		const mockResponse = {
			ok: true,
			json: vi.fn().mockResolvedValue({
				email: 'test@example.com',
				referrer: null
			})
		}
		;(global.fetch as any).mockResolvedValue(mockResponse)
		mockEmailSend.mockResolvedValue({id: 'email-123'})

		await signUpForWaitlist('test@example.com', null)

		expect(global.fetch).toHaveBeenCalledWith(`${process.env.API_URL}/waitlist/`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				email: 'test@example.com',
				referrer: null
			})
		})
	})

	it('should handle very long email addresses', async () => {
		const longEmail = 'a'.repeat(250) + '@example.com' // Very long email

		await expect(signUpForWaitlist(longEmail)).rejects.toThrow()
	})
})

describe('signUpForWaitlist integration with external services', () => {
	it('should properly integrate with Resend email service', async () => {
		const mockResponse = {
			ok: true,
			json: vi.fn().mockResolvedValue({
				email: 'test@example.com',
				referrer: 'social'
			})
		}
		;(global.fetch as any).mockResolvedValue(mockResponse)
		mockEmailSend.mockResolvedValue({
			id: 'email-456',
			from: 'Subhajit from Letraz <subhajit@letraz.app>',
			to: 'test@example.com',
			subject: 'Welcome to Letraz waitlist!',
			created_at: '2023-12-15T12:00:00Z'
		})

		const result = await signUpForWaitlist('test@example.com', 'social')

		expect(mockEmailSend).toHaveBeenCalledWith({
			from: 'Subhajit from Letraz <subhajit@letraz.app>',
			replyTo: 'Subhajit from Letraz <subhajit@letraz.app>',
			to: 'test@example.com',
			subject: 'Welcome to Letraz waitlist!',
			react: expect.any(Object)
		})
		expect(result).toEqual({
			email: 'test@example.com',
			referrer: 'social'
		})
	})

	it('should handle concurrent waitlist signups', async () => {
		const mockResponse = {
			ok: true,
			json: vi.fn().mockResolvedValue({
				email: 'test@example.com',
				referrer: 'concurrent'
			})
		}
		;(global.fetch as any).mockResolvedValue(mockResponse)
		mockEmailSend.mockResolvedValue({id: 'email-789'})

		const promises = [
			signUpForWaitlist('test1@example.com', 'concurrent'),
			signUpForWaitlist('test2@example.com', 'concurrent'),
			signUpForWaitlist('test3@example.com', 'concurrent')
		]

		const results = await Promise.all(promises)

		expect(results).toHaveLength(3)
		expect(global.fetch).toHaveBeenCalledTimes(3)
		expect(mockEmailSend).toHaveBeenCalledTimes(3)
	})
})
