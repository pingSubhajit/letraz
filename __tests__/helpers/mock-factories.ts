import {type MockedFunction, vi} from 'vitest'

// Mock data factories for creating test data

// User-related mock data
export const createMockUser = (overrides: Partial<MockUser> = {}): MockUser => ({
	id: 'user_123',
	email: 'test@example.com',
	name: 'Test User',
	firstName: 'Test',
	lastName: 'User',
	createdAt: new Date('2024-01-01'),
	updatedAt: new Date('2024-01-01'),
	...overrides
})

export interface MockUser {
  id: string
  email: string
  name: string
  firstName: string
  lastName: string
  createdAt: Date
  updatedAt: Date
}

// Resume-related mock data
export const createMockResume = (overrides: Partial<MockResume> = {}): MockResume => ({
	id: 'resume_123',
	userId: 'user_123',
	title: 'Software Engineer Resume',
	personalInfo: createMockPersonalInfo(),
	experiences: [createMockExperience()],
	education: [createMockEducation()],
	skills: ['JavaScript', 'TypeScript', 'React'],
	createdAt: new Date('2024-01-01'),
	updatedAt: new Date('2024-01-01'),
	...overrides
})

export interface MockResume {
  id: string
  userId: string
  title: string
  personalInfo: MockPersonalInfo
  experiences: MockExperience[]
  education: MockEducation[]
  skills: string[]
  createdAt: Date
  updatedAt: Date
}

export const createMockPersonalInfo = (overrides: Partial<MockPersonalInfo> = {}): MockPersonalInfo => ({
	firstName: 'John',
	lastName: 'Doe',
	email: 'john.doe@example.com',
	phone: '+1-555-0123',
	location: 'San Francisco, CA',
	website: 'https://johndoe.dev',
	linkedin: 'https://linkedin.com/in/johndoe',
	github: 'https://github.com/johndoe',
	summary: 'Experienced software engineer with expertise in full-stack development.',
	...overrides
})

export interface MockPersonalInfo {
  firstName: string
  lastName: string
  email: string
  phone: string
  location: string
  website?: string
  linkedin?: string
  github?: string
  summary?: string
}

export const createMockExperience = (overrides: Partial<MockExperience> = {}): MockExperience => ({
	id: 'exp_123',
	company: 'Tech Corp',
	position: 'Senior Software Engineer',
	location: 'San Francisco, CA',
	startDate: new Date('2022-01-01'),
	endDate: new Date('2024-01-01'),
	current: false,
	description: 'Led development of web applications using React and Node.js.',
	achievements: [
		'Improved application performance by 40%',
		'Led a team of 5 developers',
		'Implemented CI/CD pipeline'
	],
	...overrides
})

export interface MockExperience {
  id: string
  company: string
  position: string
  location: string
  startDate: Date
  endDate: Date | null
  current: boolean
  description: string
  achievements: string[]
}

export const createMockEducation = (overrides: Partial<MockEducation> = {}): MockEducation => ({
	id: 'edu_123',
	institution: 'University of Technology',
	degree: 'Bachelor of Science',
	field: 'Computer Science',
	location: 'Boston, MA',
	startDate: new Date('2018-09-01'),
	endDate: new Date('2022-05-01'),
	gpa: '3.8',
	achievements: ['Magna Cum Laude', 'Dean\'s List'],
	...overrides
})

export interface MockEducation {
  id: string
  institution: string
  degree: string
  field: string
  location: string
  startDate: Date
  endDate: Date | null
  gpa?: string
  achievements: string[]
}

// Job-related mock data
export const createMockJob = (overrides: Partial<MockJob> = {}): MockJob => ({
	id: 'job_123',
	title: 'Senior Frontend Developer',
	company: 'Awesome Company',
	location: 'Remote',
	type: 'Full-time',
	description: 'We are looking for a senior frontend developer...',
	requirements: [
		'5+ years of React experience',
		'TypeScript proficiency',
		'Experience with testing frameworks'
	],
	salary: {
		min: 120000,
		max: 150000,
		currency: 'USD'
	},
	postedAt: new Date('2024-01-01'),
	...overrides
})

export interface MockJob {
  id: string
  title: string
  company: string
  location: string
  type: string
  description: string
  requirements: string[]
  salary: {
    min: number
    max: number
    currency: string
  }
  postedAt: Date
}

// API Response mock data
export const createMockApiResponse = <T = any>(
	data: T,
	overrides: Partial<MockApiResponse<T>> = {}
): MockApiResponse<T> => ({
		data,
		status: 200,
		statusText: 'OK',
		headers: {},
		success: true,
		message: 'Success',
		...overrides
	})

export interface MockApiResponse<T = any> {
  data: T
  status: number
  statusText: string
  headers: Record<string, string>
  success: boolean
  message: string
}

// Error response mock data
export const createMockApiError = (overrides: Partial<MockApiError> = {}): MockApiError => ({
	status: 500,
	statusText: 'Internal Server Error',
	message: 'An error occurred',
	code: 'INTERNAL_ERROR',
	details: {},
	...overrides
})

export interface MockApiError {
  status: number
  statusText: string
  message: string
  code: string
  details: Record<string, any>
}

// Form data mock factories
export const createMockFormData = (data: Record<string, any>): FormData => {
	const formData = new FormData()
	Object.entries(data).forEach(([key, value]) => {
		if (value !== null && value !== undefined) {
			formData.append(key, String(value))
		}
	})
	return formData
}

// File mock factory
export const createMockFile = (
	name = 'test-file.txt',
	content = 'test content',
	type = 'text/plain'
): File => {
	const blob = new Blob([content], {type})
	return new File([blob], name, {type})
}

// Event mock factories
export const createMockEvent = <T extends Event>(
	type: string,
	overrides: Partial<T> = {}
): T => {
	const event = new Event(type) as T
	Object.assign(event, overrides)
	return event
}

export const createMockMouseEvent = (
	type: string = 'click',
	overrides: Partial<MouseEvent> = {}
): MouseEvent => {
	return createMockEvent<MouseEvent>(type, {
		bubbles: true,
		cancelable: true,
		clientX: 0,
		clientY: 0,
		...overrides
	})
}

export const createMockKeyboardEvent = (
	type: string = 'keydown',
	key: string = 'Enter',
	overrides: Partial<KeyboardEvent> = {}
): KeyboardEvent => {
	return createMockEvent<KeyboardEvent>(type, {
		bubbles: true,
		cancelable: true,
		key,
		code: `Key${key.toUpperCase()}`,
		...overrides
	})
}

// Mock function factories
export const createMockFunction = <T extends (...args: any[]) => any>(): MockedFunction<T> => {
	return vi.fn() as MockedFunction<T>
}

export const createMockPromise = <T>(
	resolveValue?: T,
	rejectValue?: any
): Promise<T> => {
	if (rejectValue) {
		return Promise.reject(rejectValue)
	}
	return Promise.resolve(resolveValue as T)
}

// Date mock utilities
export const createMockDate = (dateString: string = '2024-01-01'): Date => {
	return new Date(dateString)
}

export const mockDateNow = (dateString: string = '2024-01-01'): void => {
	const mockDate = new Date(dateString)
	vi.spyOn(Date, 'now').mockReturnValue(mockDate.getTime())
}

// Local storage mock data
export const createMockLocalStorageData = (data: Record<string, any>): void => {
	Object.entries(data).forEach(([key, value]) => {
		window.localStorage.setItem(key, JSON.stringify(value))
	})
}

// Session storage mock data
export const createMockSessionStorageData = (data: Record<string, any>): void => {
	Object.entries(data).forEach(([key, value]) => {
		window.sessionStorage.setItem(key, JSON.stringify(value))
	})
}
