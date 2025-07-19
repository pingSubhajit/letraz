// Main export file for all test utilities and helpers
// This allows for clean imports like: import { render, createMockUser, apiMocks } from '__tests__/helpers'

// Re-export all utilities from test-utils
export * from './test-utils'

// Re-export specific utilities for convenience
export { 
  // Render utilities
  render,
  renderWithProviders,
  renderWithoutProviders,
  renderWithQueryClient,
  createTestQueryClient,
  
  // Testing Library utilities
  screen,
  waitFor,
  within,
  userEvent
} from './test-utils'

// Re-export mock factories
export {
  createMockUser,
  createMockResume,
  createMockPersonalInfo,
  createMockExperience,
  createMockEducation,
  createMockJob,
  createMockParsedJob,
  createMockApiResponse,
  createMockApiError,
  createMockFormData,
  createMockFile,
  createMockEvent,
  createMockMouseEvent,
  createMockKeyboardEvent,
  createMockFunction,
  createMockPromise,
  createMockDate,
  mockDateNow,
  createMockLocalStorageData,
  createMockSessionStorageData
} from './mock-factories'

// Re-export API mocks
export { apiMocks } from './api-mocks'

// Re-export test helpers
export {
  userInteraction,
  assertions,
  asyncHelpers,
  formHelpers,
  componentHelpers,
  mockHelpers,
  testDataHelpers,
  cleanupHelpers,
  testHelpers
} from './test-helpers'