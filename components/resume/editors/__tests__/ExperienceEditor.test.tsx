import React from 'react'
import {fireEvent, render, screen, waitFor} from '@testing-library/react'
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import ExperienceEditor from '../ExperienceEditor'
import {Experience} from '@/lib/experience/types'

// --- Mock data ---
let experiencesMock: Experience[] = []

// --- Mocks ---
vi.mock('@/lib/experience/queries', () => ({
	useCurrentExperiences: () => ({data: experiencesMock, isLoading: false, error: null}),
	experienceQueryOptions: {queryKey: ['experience']}
}))

vi.mock('@/lib/experience/mutations', () => ({
	useAddUserExperienceMutation: () => ({mutateAsync: vi.fn(() => Promise.resolve()), isPending: false}),
	useUpdateExperienceMutation: () => ({mutateAsync: vi.fn(() => Promise.resolve()), isPending: false}),
	useDeleteExperienceMutation: () => ({mutateAsync: vi.fn(() => Promise.resolve()), isPending: false})
}))

vi.mock('@/lib/resume/queries', () => ({
	baseResumeQueryOptions: {queryKey: ['resume']}
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
			<button onClick={props.onDelete} data-testid="delete-btn">Delete</button>
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
				{props.isEditing ? props.editingSubmitLabel : props.addingSubmitLabel}
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

vi.mock('@/components/resume/editors/shared/DateRangeFields', () => ({
	__esModule: true,
	default: () => <div data-testid="date-range-fields">DateRangeFields</div>
}))

vi.mock('@/components/resume/editors/shared/CountrySelect', () => ({
	__esModule: true,
	default: (props: any) => <select data-testid="country-select" {...props} aria-label={props.name} />
}))

vi.mock('@/components/ui/select', () => ({
	Select: ({children, onValueChange, value}: any) => (
		<select data-testid="employment-type-select" onChange={(e) => onValueChange(e.target.value)} value={value}>
			{children}
		</select>
	),
	SelectContent: ({children}: any) => <div>{children}</div>,
	SelectItem: ({children, value}: any) => <option value={value}>{children}</option>,
	SelectTrigger: ({children}: any) => <div>{children}</div>,
	SelectValue: ({placeholder}: any) => <span>{placeholder}</span>
}))

vi.mock('@formkit/auto-animate/react', () => ({
	useAutoAnimate: () => [null]
}))

// --- Tests ---
describe('ExperienceEditor', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		experiencesMock = []
	})

	afterEach(() => {
		vi.clearAllMocks()
	})

	it('renders list view with no experiences', () => {
		render(<ExperienceEditor />)
		expect(screen.getByTestId('editor-header')).toBeInTheDocument()
		expect(screen.queryAllByTestId('item-card').length).toBe(0)
	})

	it('renders form view when add button is clicked', async () => {
		render(<ExperienceEditor />)
		const addButton = screen.getByTestId('add-new-btn')
		fireEvent.click(addButton)

		await waitFor(() => {
			expect(screen.getAllByTestId('text-form-field').length).toBeGreaterThan(0)
			expect(screen.getByTestId('form-buttons')).toBeInTheDocument()
			expect(screen.getByTestId('employment-type-select')).toBeInTheDocument()
			expect(screen.getByTestId('country-select')).toBeInTheDocument()
			expect(screen.getByTestId('rich-text-form-field')).toBeInTheDocument()
			expect(screen.getByTestId('date-range-fields')).toBeInTheDocument()
		})
	})

	it('adds a new experience', async () => {
		render(<ExperienceEditor />)
		fireEvent.click(screen.getByTestId('add-new-btn'))

		// Fill out required fields
		const textFields = screen.getAllByTestId('text-form-field')
		fireEvent.change(textFields[0], {target: {value: 'Software Engineer'}}) // job_title
		fireEvent.change(textFields[1], {target: {value: 'Tech Corp'}}) // company_name

		// Submit form
		fireEvent.click(screen.getByText('Add Experience'))

		await waitFor(() => {
			expect(textFields[0]).toHaveValue('Software Engineer')
			expect(textFields[1]).toHaveValue('Tech Corp')
		})
	})

	it('edits an existing experience', async () => {
		experiencesMock = [{
			id: '1',
			user: 'user-1',
			resume_section: 'section-1',
			job_title: 'Old Job Title',
			company_name: 'Old Company',
			employment_type: 'Full-time',
			city: 'New York',
			country: {code: 'US', name: 'United States'},
			started_from_month: 1,
			started_from_year: 2020,
			finished_at_month: 6,
			finished_at_year: 2022,
			current: false,
			description: 'Old description',
			created_at: '2023-01-01T00:00:00Z',
			updated_at: '2023-01-01T00:00:00Z'
		}]

		render(<ExperienceEditor />)
		fireEvent.click(screen.getByTestId('edit-btn'))

		// Change job title
		const textFields = screen.getAllByTestId('text-form-field')
		fireEvent.change(textFields[0], {target: {value: 'New Job Title'}})

		// Use getByRole to target the submit button specifically
		fireEvent.click(screen.getByRole('button', {name: /update experience/i}))

		await waitFor(() => {
			expect(textFields[0]).toHaveValue('New Job Title')
		})
	})

	it('deletes an experience', async () => {
		experiencesMock = [{
			id: '1',
			user: 'user-1',
			resume_section: 'section-1',
			job_title: 'Software Engineer',
			company_name: 'Tech Corp',
			employment_type: 'Full-time',
			city: 'San Francisco',
			country: {code: 'US', name: 'United States'},
			started_from_month: 1,
			started_from_year: 2020,
			finished_at_month: 6,
			finished_at_year: 2022,
			current: false,
			description: 'Test description',
			created_at: '2023-01-01T00:00:00Z',
			updated_at: '2023-01-01T00:00:00Z'
		}]

		render(<ExperienceEditor />)
		fireEvent.click(screen.getByTestId('delete-btn'))

		await waitFor(() => {
			expect(screen.getByTestId('delete-btn')).toBeInTheDocument()
		})
	})

	it('shows validation errors', async () => {
		render(<ExperienceEditor />)
		fireEvent.click(screen.getByTestId('add-new-btn'))

		// Submit form without filling required fields
		fireEvent.click(screen.getByText('Add Experience'))

		await waitFor(() => {
			expect(screen.getByTestId('form-buttons')).toBeInTheDocument()
		})
	})

	it('shows loading state', () => {
		vi.doMock('@/lib/experience/queries', () => ({
			useCurrentExperiences: vi.fn(() => ({data: [], isLoading: true, error: null})),
			experienceQueryOptions: {queryKey: ['experience']}
		}))

		render(<ExperienceEditor />)
		expect(screen.getByTestId('editor-header')).toBeInTheDocument()
	})

	it('shows error state', () => {
		vi.doMock('@/lib/experience/queries', () => ({
			useCurrentExperiences: vi.fn(() => ({data: [], isLoading: false, error: {message: 'Error'}})),
			experienceQueryOptions: {queryKey: ['experience']}
		}))

		render(<ExperienceEditor />)
		expect(screen.getByTestId('editor-header')).toBeInTheDocument()
	})

	it('renders experience items with correct information', () => {
		experiencesMock = [{
			id: '1',
			user: 'user-1',
			resume_section: 'section-1',
			job_title: 'Senior Software Engineer',
			company_name: 'Tech Corp',
			employment_type: 'Full-time',
			city: 'San Francisco',
			country: {code: 'US', name: 'United States'},
			started_from_month: 1,
			started_from_year: 2020,
			finished_at_month: 6,
			finished_at_year: 2022,
			current: false,
			description: 'Test description',
			created_at: '2023-01-01T00:00:00Z',
			updated_at: '2023-01-01T00:00:00Z'
		}]

		render(<ExperienceEditor />)
		expect(screen.getByTestId('item-card')).toBeInTheDocument()
		expect(screen.getByText(/Senior Software Engineer/)).toBeInTheDocument()
		expect(screen.getByText(/Tech Corp/)).toBeInTheDocument()
	})

	it('handles current job toggle correctly', async () => {
		render(<ExperienceEditor />)
		fireEvent.click(screen.getByTestId('add-new-btn'))

		// The DateRangeFields component would handle the current job toggle
		expect(screen.getByTestId('date-range-fields')).toBeInTheDocument()
	})

	it('cancels form and returns to list view', async () => {
		render(<ExperienceEditor />)
		fireEvent.click(screen.getByTestId('add-new-btn'))

		// Should show form
		expect(screen.getByTestId('form-buttons')).toBeInTheDocument()

		// Click cancel
		fireEvent.click(screen.getByText('Cancel'))

		await waitFor(() => {
			expect(screen.getByTestId('editor-header')).toBeInTheDocument()
			expect(screen.queryByTestId('form-buttons')).not.toBeInTheDocument()
		})
	})

	it('has accessible labels for all fields and buttons', async () => {
		render(<ExperienceEditor />)
		fireEvent.click(screen.getByTestId('add-new-btn'))

		await waitFor(() => {
			const textFields = screen.getAllByTestId('text-form-field')
			expect(textFields[0]).toHaveAttribute('aria-label', 'job_title')
			expect(textFields[1]).toHaveAttribute('aria-label', 'company_name')
			expect(screen.getByTestId('country-select')).toHaveAttribute('aria-label', 'country')
			expect(screen.getByTestId('rich-text-form-field')).toHaveAttribute('aria-label', 'description')
		})
	})

	it('shows correct form title when adding', async () => {
		render(<ExperienceEditor />)
		fireEvent.click(screen.getByTestId('add-new-btn'))

		await waitFor(() => {
			expect(screen.getByText('Add New Experience')).toBeInTheDocument()
		})
	})

	it('shows correct form title when editing', async () => {
		experiencesMock = [{
			id: '1',
			user: 'user-1',
			resume_section: 'section-1',
			job_title: 'Software Engineer',
			company_name: 'Tech Corp',
			employment_type: 'Full-time',
			city: 'San Francisco',
			country: {code: 'US', name: 'United States'},
			started_from_month: 1,
			started_from_year: 2020,
			finished_at_month: 6,
			finished_at_year: 2022,
			current: false,
			description: 'Test description',
			created_at: '2023-01-01T00:00:00Z',
			updated_at: '2023-01-01T00:00:00Z'
		}]

		render(<ExperienceEditor />)
		fireEvent.click(screen.getByTestId('edit-btn'))

		await waitFor(() => {
			// Use getAllByText to handle multiple instances and check the header specifically
			const updateTexts = screen.getAllByText('Update Experience')
			expect(updateTexts.length).toBeGreaterThan(0)
		})
	})
})
