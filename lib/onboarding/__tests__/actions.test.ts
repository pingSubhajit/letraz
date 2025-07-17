import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import {
	completeOnboarding,
	getOnboardingState,
	progressToNextStep,
	resetOnboarding,
	updateOnboardingStep
} from '../actions'
import {auth, clerkClient} from '@clerk/nextjs/server'
import {ONBOARDING_STEPS, OnboardingMetadata, OnboardingStep} from '../types'

// Mock dependencies
vi.mock('@clerk/nextjs/server')
vi.mock('../types', async () => {
	const actual = await vi.importActual('../types')
	return {
		...actual,
		getNextStep: vi.fn()
	}
})

const mockAuth = vi.mocked(auth)
const mockClerkClient = vi.mocked(clerkClient)
const mockGetNextStep = vi.mocked((await import('../types')).getNextStep)

// Mock Clerk client methods
const mockClient = {
	users: {
		getUser: vi.fn(),
		updateUser: vi.fn()
	}
}

// Helper function to create proper Auth objects for mocking
const createMockAuthObject = (userId: string | null) => {
	if (userId) {
		return {
			userId,
			sessionClaims: {},
			sessionId: 'session_123',
			sessionStatus: 'active' as const,
			actor: null,
			orgId: null,
			orgRole: null,
			orgSlug: null,
			orgPermissions: null,
			has: vi.fn(),
			redirectToSignIn: vi.fn(),
			protect: vi.fn(),
			getToken: vi.fn(),
			factorVerificationAge: null,
			debug: vi.fn()
		} as any
	} else {
		return {
			userId: null,
			sessionClaims: null,
			sessionId: null,
			sessionStatus: 'unauthenticated' as const,
			actor: null,
			orgId: null,
			orgRole: null,
			orgSlug: null,
			orgPermissions: null,
			has: vi.fn(),
			redirectToSignIn: vi.fn(),
			protect: vi.fn(),
			getToken: vi.fn(),
			factorVerificationAge: null,
			debug: vi.fn()
		} as any
	}
}

describe('Onboarding Actions', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		mockClerkClient.mockResolvedValue(mockClient as any)
	})

	afterEach(() => {
		vi.resetAllMocks()
	})

	describe('updateOnboardingStep', () => {
		const mockUser = {
			id: 'user_123',
			publicMetadata: {
				onboardingComplete: false,
				currentOnboardingStep: 'welcome' as OnboardingStep,
				completedSteps: ['welcome'] as OnboardingStep[]
			}
		}

		it('should update onboarding step successfully', async () => {
			mockAuth.mockResolvedValue(createMockAuthObject('user_123'))
			mockClient.users.getUser.mockResolvedValue(mockUser)
			mockClient.users.updateUser.mockResolvedValue({})

			const result = await updateOnboardingStep('about')

			expect(mockAuth).toHaveBeenCalled()
			expect(mockClient.users.getUser).toHaveBeenCalledWith('user_123')
			expect(mockClient.users.updateUser).toHaveBeenCalledWith('user_123', {
				publicMetadata: {
					onboardingComplete: false,
					currentOnboardingStep: 'about',
					completedSteps: ['welcome', 'about']
				}
			})
			expect(result).toEqual({
				onboardingComplete: false,
				currentOnboardingStep: 'about',
				completedSteps: ['welcome', 'about']
			})
		})

		it('should not duplicate steps in completedSteps', async () => {
			const userWithDuplicateStep = {
				...mockUser,
				publicMetadata: {
					...mockUser.publicMetadata,
					completedSteps: ['welcome', 'about'] as OnboardingStep[]
				}
			}

			mockAuth.mockResolvedValue(createMockAuthObject('user_123'))
			mockClient.users.getUser.mockResolvedValue(userWithDuplicateStep)
			mockClient.users.updateUser.mockResolvedValue({})

			const result = await updateOnboardingStep('about')

			expect(mockClient.users.updateUser).toHaveBeenCalledWith('user_123', {
				publicMetadata: {
					onboardingComplete: false,
					currentOnboardingStep: 'about',
					completedSteps: ['welcome', 'about']
				}
			})
			expect(result.completedSteps).toEqual(['welcome', 'about'])
		})

		it('should handle empty publicMetadata', async () => {
			const userWithEmptyMetadata = {
				id: 'user_123',
				publicMetadata: {}
			}

			mockAuth.mockResolvedValue(createMockAuthObject('user_123'))
			mockClient.users.getUser.mockResolvedValue(userWithEmptyMetadata)
			mockClient.users.updateUser.mockResolvedValue({})

			const result = await updateOnboardingStep('welcome')

			expect(mockClient.users.updateUser).toHaveBeenCalledWith('user_123', {
				publicMetadata: {
					currentOnboardingStep: 'welcome',
					completedSteps: ['welcome']
				}
			})
			expect(result.completedSteps).toEqual(['welcome'])
		})

		it('should handle null publicMetadata', async () => {
			const userWithNullMetadata = {
				id: 'user_123',
				publicMetadata: null
			}

			mockAuth.mockResolvedValue(createMockAuthObject('user_123'))
			mockClient.users.getUser.mockResolvedValue(userWithNullMetadata)
			mockClient.users.updateUser.mockResolvedValue({})

			const result = await updateOnboardingStep('welcome')

			expect(result.completedSteps).toEqual(['welcome'])
		})

		it('should throw error when user is not authenticated', async () => {
			mockAuth.mockResolvedValue(createMockAuthObject(null))

			await expect(updateOnboardingStep('about')).rejects.toThrow('User not authenticated')
			expect(mockClient.users.getUser).not.toHaveBeenCalled()
		})

		it('should handle all onboarding steps', async () => {
			mockAuth.mockResolvedValue(createMockAuthObject('user_123'))
			mockClient.users.getUser.mockResolvedValue(mockUser)
			mockClient.users.updateUser.mockResolvedValue({})

			const steps: OnboardingStep[] = ['welcome', 'about', 'personal-details', 'education', 'experience', 'resume']

			for (const step of steps) {
				const result = await updateOnboardingStep(step)
				expect(result.currentOnboardingStep).toBe(step)
				expect(result.completedSteps).toContain(step)
			}
		})

		it('should preserve existing metadata properties', async () => {
			const userWithExtraMetadata = {
				id: 'user_123',
				publicMetadata: {
					onboardingComplete: false,
					currentOnboardingStep: 'welcome' as OnboardingStep,
					completedSteps: ['welcome'] as OnboardingStep[]
				}
			}

			mockAuth.mockResolvedValue(createMockAuthObject('user_123'))
			mockClient.users.getUser.mockResolvedValue(userWithExtraMetadata)
			mockClient.users.updateUser.mockResolvedValue({})

			const result = await updateOnboardingStep('about')

			expect(mockClient.users.updateUser).toHaveBeenCalledWith('user_123', {
				publicMetadata: {
					onboardingComplete: false,
					currentOnboardingStep: 'about',
					completedSteps: ['welcome', 'about']
				}
			})
		})
	})

	describe('progressToNextStep', () => {
		const mockUser = {
			id: 'user_123',
			publicMetadata: {
				onboardingComplete: false,
				currentOnboardingStep: 'welcome' as OnboardingStep,
				completedSteps: ['welcome'] as OnboardingStep[]
			}
		}

		it('should progress to next step successfully', async () => {
			mockGetNextStep.mockReturnValue('about' as OnboardingStep)
			mockAuth.mockResolvedValue(createMockAuthObject('user_123'))
			mockClient.users.getUser.mockResolvedValue(mockUser)
			mockClient.users.updateUser.mockResolvedValue({})

			const result = await progressToNextStep('welcome')

			expect(mockGetNextStep).toHaveBeenCalledWith('welcome')
			expect(result.currentOnboardingStep).toBe('about')
		})

		it('should complete onboarding when no next step exists', async () => {
			mockGetNextStep.mockReturnValue(null)
			mockAuth.mockResolvedValue(createMockAuthObject('user_123'))
			mockClient.users.getUser.mockResolvedValue(mockUser)
			mockClient.users.updateUser.mockResolvedValue({})

			const result = await progressToNextStep('resume')

			expect(mockGetNextStep).toHaveBeenCalledWith('resume')
			expect(result.onboardingComplete).toBe(true)
			expect(result.currentOnboardingStep).toBe('resume')
			expect(result.completedSteps).toEqual(ONBOARDING_STEPS)
		})

		it('should handle progression through all steps', async () => {
			const stepProgression = [
				{current: 'welcome', next: 'about'},
				{current: 'about', next: 'personal-details'},
				{current: 'personal-details', next: 'education'},
				{current: 'education', next: 'experience'},
				{current: 'experience', next: 'resume'},
				{current: 'resume', next: null}
			]

			mockAuth.mockResolvedValue(createMockAuthObject('user_123'))
			mockClient.users.getUser.mockResolvedValue(mockUser)
			mockClient.users.updateUser.mockResolvedValue({})

			for (const {current, next} of stepProgression) {
				mockGetNextStep.mockReturnValue(next as OnboardingStep)

				const result = await progressToNextStep(current as OnboardingStep)

				if (next) {
					expect(result.currentOnboardingStep).toBe(next)
					expect(result.onboardingComplete).toBeFalsy()
				} else {
					expect(result.onboardingComplete).toBe(true)
				}
			}
		})
	})

	describe('completeOnboarding', () => {
		const mockUser = {
			id: 'user_123',
			publicMetadata: {
				onboardingComplete: false,
				currentOnboardingStep: 'experience' as OnboardingStep,
				completedSteps: ['welcome', 'about', 'personal-details', 'education', 'experience'] as OnboardingStep[]
			}
		}

		it('should complete onboarding successfully', async () => {
			mockAuth.mockResolvedValue(createMockAuthObject('user_123'))
			mockClient.users.getUser.mockResolvedValue(mockUser)
			mockClient.users.updateUser.mockResolvedValue({})

			const result = await completeOnboarding()

			expect(mockAuth).toHaveBeenCalled()
			expect(mockClient.users.getUser).toHaveBeenCalledWith('user_123')
			expect(mockClient.users.updateUser).toHaveBeenCalledWith('user_123', {
				publicMetadata: {
					onboardingComplete: true,
					currentOnboardingStep: 'resume',
					completedSteps: ONBOARDING_STEPS
				}
			})
			expect(result).toEqual({
				onboardingComplete: true,
				currentOnboardingStep: 'resume',
				completedSteps: ONBOARDING_STEPS
			})
		})

		it('should handle empty publicMetadata', async () => {
			const userWithEmptyMetadata = {
				id: 'user_123',
				publicMetadata: {}
			}

			mockAuth.mockResolvedValue(createMockAuthObject('user_123'))
			mockClient.users.getUser.mockResolvedValue(userWithEmptyMetadata)
			mockClient.users.updateUser.mockResolvedValue({})

			const result = await completeOnboarding()

			expect(result.onboardingComplete).toBe(true)
			expect(result.currentOnboardingStep).toBe('resume')
			expect(result.completedSteps).toEqual(ONBOARDING_STEPS)
		})

		it('should preserve existing metadata properties', async () => {
			const userWithExtraMetadata = {
				id: 'user_123',
				publicMetadata: {
					...mockUser.publicMetadata,
					customProperty: 'custom_value'
				}
			}

			mockAuth.mockResolvedValue(createMockAuthObject('user_123'))
			mockClient.users.getUser.mockResolvedValue(userWithExtraMetadata)
			mockClient.users.updateUser.mockResolvedValue({})

			await completeOnboarding()

			expect(mockClient.users.updateUser).toHaveBeenCalledWith('user_123', {
				publicMetadata: {
					customProperty: 'custom_value',
					onboardingComplete: true,
					currentOnboardingStep: 'resume',
					completedSteps: ONBOARDING_STEPS
				}
			})
		})

		it('should throw error when user is not authenticated', async () => {
			mockAuth.mockResolvedValue(createMockAuthObject(null))

			await expect(completeOnboarding()).rejects.toThrow('User not authenticated')
			expect(mockClient.users.getUser).not.toHaveBeenCalled()
		})

		it('should handle already completed onboarding', async () => {
			const completedUser = {
				id: 'user_123',
				publicMetadata: {
					onboardingComplete: true,
					currentOnboardingStep: 'resume' as OnboardingStep,
					completedSteps: ONBOARDING_STEPS
				}
			}

			mockAuth.mockResolvedValue(createMockAuthObject('user_123'))
			mockClient.users.getUser.mockResolvedValue(completedUser)
			mockClient.users.updateUser.mockResolvedValue({})

			const result = await completeOnboarding()

			expect(result.onboardingComplete).toBe(true)
			expect(result.completedSteps).toEqual(ONBOARDING_STEPS)
		})
	})

	describe('getOnboardingState', () => {
		const mockOnboardingMetadata: OnboardingMetadata = {
			onboardingComplete: false,
			currentOnboardingStep: 'about',
			completedSteps: ['welcome', 'about']
		}

		const mockUser = {
			id: 'user_123',
			publicMetadata: mockOnboardingMetadata
		}

		it('should get onboarding state successfully', async () => {
			mockAuth.mockResolvedValue(createMockAuthObject('user_123'))
			mockClient.users.getUser.mockResolvedValue(mockUser)

			const result = await getOnboardingState()

			expect(mockAuth).toHaveBeenCalled()
			expect(mockClient.users.getUser).toHaveBeenCalledWith('user_123')
			expect(result).toEqual(mockOnboardingMetadata)
		})

		it('should handle empty publicMetadata', async () => {
			const userWithEmptyMetadata = {
				id: 'user_123',
				publicMetadata: {}
			}

			mockAuth.mockResolvedValue(createMockAuthObject('user_123'))
			mockClient.users.getUser.mockResolvedValue(userWithEmptyMetadata)

			const result = await getOnboardingState()

			expect(result).toEqual({})
		})

		it('should handle null publicMetadata', async () => {
			const userWithNullMetadata = {
				id: 'user_123',
				publicMetadata: null
			}

			mockAuth.mockResolvedValue(createMockAuthObject('user_123'))
			mockClient.users.getUser.mockResolvedValue(userWithNullMetadata)

			const result = await getOnboardingState()

			expect(result).toBeNull()
		})

		it('should throw error when user is not authenticated', async () => {
			mockAuth.mockResolvedValue(createMockAuthObject(null))

			await expect(getOnboardingState()).rejects.toThrow('User not authenticated')
			expect(mockClient.users.getUser).not.toHaveBeenCalled()
		})

		it('should handle completed onboarding state', async () => {
			const completedMetadata: OnboardingMetadata = {
				onboardingComplete: true,
				currentOnboardingStep: 'resume',
				completedSteps: ONBOARDING_STEPS
			}

			const completedUser = {
				id: 'user_123',
				publicMetadata: completedMetadata
			}

			mockAuth.mockResolvedValue(createMockAuthObject('user_123'))
			mockClient.users.getUser.mockResolvedValue(completedUser)

			const result = await getOnboardingState()

			expect(result).toEqual(completedMetadata)
			expect(result.onboardingComplete).toBe(true)
			expect(result.completedSteps).toHaveLength(6)
		})

		it('should handle partial onboarding state', async () => {
			const partialMetadata: OnboardingMetadata = {
				currentOnboardingStep: 'education',
				completedSteps: ['welcome', 'about', 'personal-details']
			}

			const partialUser = {
				id: 'user_123',
				publicMetadata: partialMetadata
			}

			mockAuth.mockResolvedValue(createMockAuthObject('user_123'))
			mockClient.users.getUser.mockResolvedValue(partialUser)

			const result = await getOnboardingState()

			expect(result).toEqual(partialMetadata)
			expect(result.onboardingComplete).toBeUndefined()
			expect(result.completedSteps).toHaveLength(3)
		})
	})

	describe('resetOnboarding', () => {
		it('should reset onboarding successfully', async () => {
			mockAuth.mockResolvedValue(createMockAuthObject('user_123'))
			mockClient.users.updateUser.mockResolvedValue({})

			await resetOnboarding()

			expect(mockAuth).toHaveBeenCalled()
			expect(mockClient.users.updateUser).toHaveBeenCalledWith('user_123', {
				publicMetadata: {
					onboardingComplete: false,
					currentOnboardingStep: 'welcome',
					completedSteps: []
				}
			})
		})

		it('should throw error when user is not authenticated', async () => {
			mockAuth.mockResolvedValue(createMockAuthObject(null))

			await expect(resetOnboarding()).rejects.toThrow('User not authenticated')
			expect(mockClient.users.updateUser).not.toHaveBeenCalled()
		})

		it('should reset from any onboarding state', async () => {
			mockAuth.mockResolvedValue(createMockAuthObject('user_123'))
			mockClient.users.updateUser.mockResolvedValue({})

			// Test multiple calls to ensure consistent reset
			await resetOnboarding()
			await resetOnboarding()

			expect(mockClient.users.updateUser).toHaveBeenCalledTimes(2)
			mockClient.users.updateUser.mock.calls.forEach(call => {
				expect(call[1]).toEqual({
					publicMetadata: {
						onboardingComplete: false,
						currentOnboardingStep: 'welcome',
						completedSteps: []
					}
				})
			})
		})

		it('should handle Clerk client errors', async () => {
			mockAuth.mockResolvedValue(createMockAuthObject('user_123'))
			mockClient.users.updateUser.mockRejectedValue(new Error('Clerk API Error'))

			await expect(resetOnboarding()).rejects.toThrow('Clerk API Error')
		})
	})

	describe('Error Handling', () => {
		it('should handle Clerk authentication errors', async () => {
			mockAuth.mockRejectedValue(new Error('Auth service unavailable'))

			await expect(updateOnboardingStep('about')).rejects.toThrow('Auth service unavailable')
		})

		it('should handle Clerk client initialization errors', async () => {
			mockAuth.mockResolvedValue(createMockAuthObject('user_123'))
			mockClerkClient.mockRejectedValue(new Error('Clerk client initialization failed'))

			await expect(updateOnboardingStep('about')).rejects.toThrow('Clerk client initialization failed')
		})

		it('should handle user fetch errors', async () => {
			mockAuth.mockResolvedValue(createMockAuthObject('user_123'))
			mockClient.users.getUser.mockRejectedValue(new Error('User not found'))

			await expect(updateOnboardingStep('about')).rejects.toThrow('User not found')
		})

		it('should handle user update errors', async () => {
			const mockUser = {
				id: 'user_123',
				publicMetadata: {
					onboardingComplete: false,
					currentOnboardingStep: 'welcome' as OnboardingStep,
					completedSteps: ['welcome'] as OnboardingStep[]
				}
			}

			mockAuth.mockResolvedValue(createMockAuthObject('user_123'))
			mockClient.users.getUser.mockResolvedValue(mockUser)
			mockClient.users.updateUser.mockRejectedValue(new Error('Update failed'))

			await expect(updateOnboardingStep('about')).rejects.toThrow('Update failed')
		})
	})
})
