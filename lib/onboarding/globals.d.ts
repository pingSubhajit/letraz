import {OnboardingMetadata} from '@/lib/onboarding/types'

declare global {
  interface CustomJwtSessionClaims {
    metadata: OnboardingMetadata
  }

  interface UserPublicMetadata extends OnboardingMetadata {}
}
