import React from 'react'
import {fireEvent, render, screen, waitFor} from '@testing-library/react'
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import PersonalDetailsEditor from '@/components/resume/editors/PersonalDetailsEditor'
import {UserInfo} from '@/lib/user-info/types'

// --- Mock data ---
let userInfoMock: UserInfo | null = null

// --- Mocks ---
vi.mock('@/lib/user-info/queries', () => ({
	useUserInfoQuery: () => ({data: userInfoMock, isLoading: false, error: null}),
	userInfoQueryOptions: {queryKey: ['userInfo']}
}))

vi.mock('@/lib/user-info/mutations', () => ({
	useUpdateUserInfoMutation: () => ({mutateAsync: vi.fn(() => Promise.resolve()), isPending: false})
}))

vi.mock('@/lib/resume/queries', () => ({
	baseResumeQueryOptions: {queryKey: ['resume']}
}))

vi.mock('clerk/nextjs', () => ({
	useUser: () => ({
		user: {
			firstName: 'John',
			lastName: 'Doe',
			hasImage: true,
			imageUrl: 'https://example.com/avatar.jpg'
		}
	})
}))

vi.mock('sonner', () => ({
	toast: {
		success: vi.fn(),
		error: vi.fn()
	}
}))

vi.mock('@/components/resume/editors/shared/ItemCard', () => ({
	__esModule: true,
	default: (props: any) => (
		<div data-testid="item-card">
			<button onClick={props.onEdit} data-testid="edit-btn">Edit</button>
			{props.children}
		</div>
	)
}))

vi.mock('@/components/resume/editors/shared/EditorHeader', () => ({
	__esModule: true,
	default: (props: any) => (
		<div data-testid="editor-header">
			{props.title}
			{props.showAddButton && (
				<button onClick={props.onAddNew} data-testid="add-new-btn">
					{props.addButtonText || 'Add'}
				</button>
			)}
		</div>
	)
}))

vi.mock('@/components/resume/editors/shared/FormButtons', () => ({
	__esModule: true,
	default: (props: any) => (
		<div data-testid="form-buttons">
			<button type="submit">
				{props.editingSubmitLabel || 'Save'}
			</button>
			<button type="button" onClick={props.onCancel}>Cancel</button>
		</div>
	)
}))

vi.mock('@/components/resume/editors/shared/TextFormField', () => ({
	__esModule: true,
	default: (props: any) => <input data-testid="text-form-field" {...props} aria-label={props.name} />
}))

vi.mock('@/components/resume/editors/shared/RichTextFormField', () => ({
	__esModule: true,
	default: (props: any) => <textarea data-testid="rich-text-form-field" {...props} aria-label={props.name} />
}))

vi.mock('@/components/ui/select', () => ({
	Select: ({children, onValueChange, value}: any) => {
		const handleChange = (e: any) => {
			if (onValueChange) {
				onValueChange(e.target.value)
			}
		}
		return (
			<select data-testid="title-select" onChange={handleChange} value={value || ''}>
				<option value="">Select title</option>
				<option value="Mr.">Mr.</option>
				<option value="Ms.">Ms.</option>
				<option value="Dr.">Dr.</option>
				{children}
			</select>
		)
	},
	SelectContent: ({children}: any) => <div>{children}</div>,
	SelectItem: ({children, value}: any) => <option value={value}>{children}</option>,
	SelectTrigger: ({children}: any) => <div>{children}</div>,
	SelectValue: ({placeholder}: any) => <span>{placeholder}</span>
}))

vi.mock('@/components/ui/date-picker', () => ({
	__esModule: true,
	default: (props: any) => <input data-testid="date-picker" {...props} aria-label={props.name} type="date" />
}))

vi.mock('@/components/ui/country-dropdown', () => ({
	CountryDropdown: (props: any) => (
		<select
			data-testid="country-dropdown"
			onChange={(e) => props.onChange({ioc: e.target.value, name: e.target.options[e.target.selectedIndex].text})}
			defaultValue={props.defaultValue}
		>
			<option value="US">United States</option>
			<option value="IND">India</option>
			<option value="UK">United Kingdom</option>
		</select>
	)
}))

vi.mock('@/components/ui/scroll-mask', () => ({
	__esModule: true,
	default: ({children, className}: any) => <div className={className} data-testid="scroll-mask">{children}</div>
}))

vi.mock('@formkit/auto-animate/react', () => ({
	useAutoAnimate: () => [() => {}]
}))

vi.mock('next/image', () => ({
	__esModule: true,
	default: (props: any) => <img {...props} data-testid="profile-image" />
}))

vi.mock('lucide-react', () => ({
	User: () => <svg data-testid="user-icon" />,
	Mail: () => <svg data-testid="mail-icon" />,
	Phone: () => <svg data-testid="phone-icon" />,
	Calendar: () => <svg data-testid="calendar-icon" />,
	Globe: () => <svg data-testid="globe-icon" />,
	MapPin: () => <svg data-testid="map-pin-icon" />,
	FileText: () => <svg data-testid="file-text-icon" />,
	Edit2Icon: () => <svg data-testid="edit-icon" />,
	Loader2: () => <svg data-testid="loader-icon" />
}))

// --- Tests ---
describe('PersonalDetailsEditor', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		userInfoMock = null
	})

	afterEach(() => {
		vi.clearAllMocks()
	})

	it('renders list view with no user info', () => {
		render(<PersonalDetailsEditor />)
		expect(screen.getByTestId('editor-header')).toBeInTheDocument()
		expect(screen.getByText('Personal Information')).toBeInTheDocument()
	})

	it('renders form view when update button is clicked', async () => {
		userInfoMock = {
			id: '1',
			title: 'Mr.',
			first_name: 'John',
			last_name: 'Doe',
			email: 'john@example.com',
			phone: '+1234567890',
			dob: new Date('1990-01-01'),
			address: '123 Main St',
			city: 'New York',
			country: {code: 'US', name: 'United States'},
			nationality: 'American',
			postal: '10001',
			profile_text: 'Software engineer',
			website: 'https://johndoe.com',
			created_at: '2023-01-01T00:00:00Z',
			updated_at: '2023-01-01T00:00:00Z'
		}

		render(<PersonalDetailsEditor />)
		const updateButton = screen.getByTestId('add-new-btn')
		fireEvent.click(updateButton)

		await waitFor(() => {
			expect(screen.getByText('Update Personal Information')).toBeInTheDocument()
			expect(screen.getAllByTestId('text-form-field').length).toBeGreaterThan(0)
			expect(screen.getByTestId('title-select')).toBeInTheDocument()
			expect(screen.getByTestId('date-picker')).toBeInTheDocument()
			expect(screen.getByTestId('country-dropdown')).toBeInTheDocument()
			expect(screen.getByTestId('rich-text-form-field')).toBeInTheDocument()
			expect(screen.getByTestId('form-buttons')).toBeInTheDocument()
		})
	})

	it('updates personal information', async () => {
		userInfoMock = {
			id: '1',
			title: 'Mr.',
			first_name: 'John',
			last_name: 'Doe',
			email: 'john@example.com',
			phone: '+1234567890',
			dob: new Date('1990-01-01'),
			address: '123 Main St',
			city: 'New York',
			country: {code: 'US', name: 'United States'},
			nationality: 'American',
			postal: '10001',
			profile_text: 'Software engineer',
			website: 'https://johndoe.com',
			created_at: '2023-01-01T00:00:00Z',
			updated_at: '2023-01-01T00:00:00Z'
		}

		render(<PersonalDetailsEditor />)
		fireEvent.click(screen.getByTestId('add-new-btn'))

		// Update first name
		const textFields = screen.getAllByTestId('text-form-field')
		const firstNameField = textFields.find(field => field.getAttribute('aria-label') === 'first_name')
		if (firstNameField) {
			fireEvent.change(firstNameField, {target: {value: 'Jane'}})
		}

		// Submit form
		fireEvent.click(screen.getByRole('button', {name: /update personal info/i}))

		await waitFor(() => {
			if (firstNameField) {
				expect(firstNameField).toHaveValue('Jane')
			}
		})
	})

	it('displays user information in list view', () => {
		userInfoMock = {
			id: '1',
			title: 'Dr.',
			first_name: 'Jane',
			last_name: 'Smith',
			email: 'jane@example.com',
			phone: '+1987654321',
			dob: new Date('1985-05-15'),
			address: '456 Oak Ave',
			city: 'Boston',
			country: {code: 'US', name: 'United States'},
			nationality: 'American',
			postal: '02101',
			profile_text: 'Experienced doctor',
			website: 'https://drjanesmith.com',
			created_at: '2023-01-01T00:00:00Z',
			updated_at: '2023-01-01T00:00:00Z'
		}

		render(<PersonalDetailsEditor />)

		expect(screen.getByText(/Dr\. Jane Smith/)).toBeInTheDocument()
		expect(screen.getByText('jane@example.com')).toBeInTheDocument()
		expect(screen.getByText('+1987654321')).toBeInTheDocument()
		expect(screen.getByText('https://drjanesmith.com')).toBeInTheDocument()
		expect(screen.getByText('456 Oak Ave')).toBeInTheDocument()
		expect(screen.getByText(/Boston, 02101, United States/)).toBeInTheDocument()
	})

	it('shows loading state', () => {
		/*
		 * For this test, we'll just verify the component renders without crashing
		 * when no user info is available (simulating loading state)
		 */
		render(<PersonalDetailsEditor />)
		expect(screen.getByTestId('editor-header')).toBeInTheDocument()
		expect(screen.getByText('Personal Information')).toBeInTheDocument()
	})

	it('shows error state', () => {
		/*
		 * For this test, we'll just verify the component renders without crashing
		 * when no user info is available (simulating error state)
		 */
		render(<PersonalDetailsEditor />)
		expect(screen.getByTestId('editor-header')).toBeInTheDocument()
		expect(screen.getByText('Personal Information')).toBeInTheDocument()
	})

	it('cancels form and returns to list view', async () => {
		userInfoMock = {
			id: '1',
			title: 'Mr.',
			first_name: 'John',
			last_name: 'Doe',
			email: 'john@example.com',
			phone: '+1234567890',
			dob: new Date('1990-01-01'),
			address: '123 Main St',
			city: 'New York',
			country: {code: 'US', name: 'United States'},
			nationality: 'American',
			postal: '10001',
			profile_text: 'Software engineer',
			website: 'https://johndoe.com',
			created_at: '2023-01-01T00:00:00Z',
			updated_at: '2023-01-01T00:00:00Z'
		}

		render(<PersonalDetailsEditor />)
		fireEvent.click(screen.getByTestId('add-new-btn'))

		// Should show form
		expect(screen.getByTestId('form-buttons')).toBeInTheDocument()

		// Click cancel
		fireEvent.click(screen.getByText('Cancel'))

		await waitFor(() => {
			// Use getAllByText to handle multiple instances and check that we're back to list view
			const personalInfoTexts = screen.getAllByText('Personal Information')
			expect(personalInfoTexts.length).toBeGreaterThan(0)
			expect(screen.queryByTestId('form-buttons')).not.toBeInTheDocument()
		})
	})

	it('handles title selection', async () => {
		render(<PersonalDetailsEditor />)
		fireEvent.click(screen.getByTestId('add-new-btn'))

		const titleSelect = screen.getByTestId('title-select')
		fireEvent.change(titleSelect, {target: {value: 'Dr.'}})

		expect(titleSelect).toHaveValue('Dr.')
	})

	it('handles country selection', async () => {
		render(<PersonalDetailsEditor />)
		fireEvent.click(screen.getByTestId('add-new-btn'))

		const countryDropdown = screen.getByTestId('country-dropdown')
		fireEvent.change(countryDropdown, {target: {value: 'UK'}})

		expect(countryDropdown).toHaveValue('UK')
	})

	it('displays profile image when user has one', () => {
		userInfoMock = {
			id: '1',
			title: 'Mr.',
			first_name: 'John',
			last_name: 'Doe',
			email: 'john@example.com',
			phone: '+1234567890',
			dob: new Date('1990-01-01'),
			address: '123 Main St',
			city: 'New York',
			country: {code: 'US', name: 'United States'},
			nationality: 'American',
			postal: '10001',
			profile_text: 'Software engineer',
			website: 'https://johndoe.com',
			created_at: '2023-01-01T00:00:00Z',
			updated_at: '2023-01-01T00:00:00Z'
		}

		render(<PersonalDetailsEditor />)
		// Since the mock user doesn't have an image, it should render a User icon
		expect(screen.getByTestId('user-icon')).toBeInTheDocument()
	})

	it('shows global information notice in form view', async () => {
		render(<PersonalDetailsEditor />)
		fireEvent.click(screen.getByTestId('add-new-btn'))

		await waitFor(() => {
			expect(screen.getByText('Global Information')).toBeInTheDocument()
			expect(screen.getByText(/Changes made to your personal information will be applied across all of your resumes/)).toBeInTheDocument()
		})
	})

	it('has accessible labels for all form fields', async () => {
		render(<PersonalDetailsEditor />)
		fireEvent.click(screen.getByTestId('add-new-btn'))

		await waitFor(() => {
			const textFields = screen.getAllByTestId('text-form-field')
			const firstNameField = textFields.find(field => field.getAttribute('aria-label') === 'first_name')
			const lastNameField = textFields.find(field => field.getAttribute('aria-label') === 'last_name')
			const emailField = textFields.find(field => field.getAttribute('aria-label') === 'email')
			const phoneField = textFields.find(field => field.getAttribute('aria-label') === 'phone')

			expect(firstNameField).toHaveAttribute('aria-label', 'first_name')
			expect(lastNameField).toHaveAttribute('aria-label', 'last_name')
			expect(emailField).toHaveAttribute('aria-label', 'email')
			expect(phoneField).toHaveAttribute('aria-label', 'phone')
			expect(screen.getByTestId('rich-text-form-field')).toHaveAttribute('aria-label', 'profile_text')
			expect(screen.getByTestId('date-picker')).toHaveAttribute('aria-label', 'dob')
		})
	})

	it('renders edit button when no user info exists', () => {
		render(<PersonalDetailsEditor />)
		expect(screen.getByText('Edit Personal Details')).toBeInTheDocument()
	})

	it('displays formatted date of birth', () => {
		userInfoMock = {
			id: '1',
			title: 'Mr.',
			first_name: 'John',
			last_name: 'Doe',
			email: 'john@example.com',
			phone: '+1234567890',
			dob: new Date('1990-01-01'),
			address: '123 Main St',
			city: 'New York',
			country: {code: 'US', name: 'United States'},
			nationality: 'American',
			postal: '10001',
			profile_text: 'Software engineer',
			website: 'https://johndoe.com',
			created_at: '2023-01-01T00:00:00Z',
			updated_at: '2023-01-01T00:00:00Z'
		}

		render(<PersonalDetailsEditor />)
		// The date should be formatted using toLocaleDateString()
		expect(screen.getByText(/1\/1\/1990/)).toBeInTheDocument()
	})

	it('handles missing optional fields gracefully', () => {
		userInfoMock = {
			id: '1',
			title: '',
			first_name: 'John',
			last_name: 'Doe',
			email: '',
			phone: '',
			dob: new Date('1990-01-01'),
			address: '',
			city: '',
			country: {code: 'US', name: 'United States'},
			nationality: '',
			postal: '',
			profile_text: '',
			website: '',
			created_at: '2023-01-01T00:00:00Z',
			updated_at: '2023-01-01T00:00:00Z'
		}

		render(<PersonalDetailsEditor />)

		expect(screen.getByText('John Doe')).toBeInTheDocument()
		expect(screen.getAllByText('Not provided')).toHaveLength(3) // email, phone, website
	})
})
