import {OnboardingMetadata} from './types'

declare global {
  interface CustomJwtSessionClaims {
    metadata: OnboardingMetadata
  }

  interface UserPublicMetadata extends OnboardingMetadata {}
}
