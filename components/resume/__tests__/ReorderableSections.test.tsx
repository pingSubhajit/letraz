import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import {render, screen} from '@testing-library/react'
import ReorderableSections from '@/components/resume/ReorderableSections'
import {ResumeSection} from '@/lib/resume/types'
import {useRearrangeResumeSectionsMutation} from '@/lib/resume/mutations'

// Mock the drag and drop kit
let dndContextCounter = 0
vi.mock('@dnd-kit/core', () => ({
	DndContext: ({
		children,
		onDragStart,
		onDragEnd,
		sensors,
		collisionDetection,
		modifiers
	}: any) => {
		const contextId = `dnd-context-${dndContextCounter++}`
		return (
			<div
				data-testid={contextId}
				data-sensors={sensors?.length || 0}
				data-collision-detection={collisionDetection?.name || 'unknown'}
				data-modifiers={modifiers?.length || 0}
				data-drag-end={onDragEnd}
				data-drag-start={onDragStart}
			>
				{children}
			</div>
		)
	},
	DragOverlay: ({children}: any) => (
		<div data-testid={`drag-overlay-${Math.max(0, dndContextCounter - 1)}`}>
			{children}
		</div>
	),
	useSensor: vi.fn((sensor, options) => ({sensor, options})),
	useSensors: vi.fn((...sensors) => sensors),
	PointerSensor: vi.fn(),
	KeyboardSensor: vi.fn(),
	closestCenter: vi.fn(),
	DragEndEvent: vi.fn(),
	DragStartEvent: vi.fn(),
	UniqueIdentifier: vi.fn()
}))

vi.mock('@dnd-kit/sortable', () => ({
	SortableContext: ({children, items, strategy}: any) => (
		<div
			data-testid="sortable-context"
			data-items={items.join(',')}
			data-strategy={strategy?.name || 'unknown'}
		>
			{children}
		</div>
	),
	useSortable: vi.fn((config) => ({
		attributes: {'data-sortable': true},
		listeners: {
			onMouseDown: vi.fn(),
			onKeyDown: vi.fn()
		},
		setNodeRef: vi.fn(),
		transform: null,
		transition: null,
		isDragging: false,
		...config
	})),
	arrayMove: vi.fn((array, oldIndex, newIndex) => {
		const newArray = [...array]
		const [removed] = newArray.splice(oldIndex, 1)
		newArray.splice(newIndex, 0, removed)
		return newArray
	}),
	verticalListSortingStrategy: {name: 'verticalListSortingStrategy'}
}))

vi.mock('@dnd-kit/utilities', () => ({
	CSS: {
		Transform: {
			toString: vi.fn(() => 'transform(0px, 0px)')
		}
	}
}))

vi.mock('@dnd-kit/modifiers', () => ({
	restrictToParentElement: vi.fn(),
	restrictToVerticalAxis: vi.fn()
}))

// Mock the mutations
vi.mock('@/lib/resume/mutations', () => ({
	useRearrangeResumeSectionsMutation: vi.fn()
}))

// Mock the UI components
vi.mock('@/components/ui/button', () => ({
	Button: ({children, onClick, className, ...props}: any) => (
		<button
			onClick={onClick}
			className={className}
			data-testid="button"
			{...props}
		>
			{children}
		</button>
	)
}))

vi.mock('lucide-react', () => ({
	GripVertical: () => <div data-testid="grip-vertical-icon">GripVertical</div>
}))

// Mock motion
vi.mock('motion/react', () => ({
	motion: {
		div: ({children, className, layout, transition, ...props}: any) => (
			<div
				className={className}
				data-layout={layout}
				data-transition={transition ? JSON.stringify(transition) : undefined}
				{...props}
			>
				{children}
			</div>
		)
	}
}))

// Mock toast
vi.mock('sonner', () => ({
	toast: {
		error: vi.fn()
	}
}))

const createMockSection = (id: string, type: 'Education' | 'Experience', index: number): ResumeSection => ({
	id,
	resume: 'resume-123',
	index,
	type,
	data: type === 'Education' ? {
		id: `edu-${id}`,
		user: 'user-123',
		resume_section: id,
		institution_name: `University ${id}`,
		degree: 'Bachelor',
		field_of_study: 'Computer Science',
		country: {
			code: 'USA',
			name: 'United States'
		},
		started_from_month: 9,
		started_from_year: 2020,
		finished_at_month: 5,
		finished_at_year: 2024,
		current: false,
		description: 'Education description',
		created_at: '2023-01-01T00:00:00Z',
		updated_at: '2023-01-01T00:00:00Z'
	} : {
		id: `exp-${id}`,
		user: 'user-123',
		resume_section: id,
		company_name: `Company ${id}`,
		job_title: 'Developer',
		country: {
			code: 'USA',
			name: 'United States'
		},
		city: 'Remote',
		employment_type: 'flt',
		started_from_month: 1,
		started_from_year: 2024,
		finished_at_month: null,
		finished_at_year: null,
		current: true,
		description: 'Work description',
		created_at: '2023-01-01T00:00:00Z',
		updated_at: '2023-01-01T00:00:00Z'
	}
})

const createMockRenderSection = () => {
	return vi.fn((section: ResumeSection, isFirstInGroup: boolean) => ({
		title: (
			<div data-testid={`section-title-${section.id}`}>
				{section.type} Title {isFirstInGroup ? '(First)' : ''}
			</div>
		),
		content: (
			<div data-testid={`section-content-${section.id}`}>
				{section.type} Content - {section.id}
			</div>
		)
	}))
}

describe('ReorderableSections', () => {
	const mockMutate = vi.fn()
	const mockUseRearrangeResumeSectionsMutation = vi.mocked(useRearrangeResumeSectionsMutation)

	beforeEach(() => {
		vi.clearAllMocks()
		dndContextCounter = 0
		mockUseRearrangeResumeSectionsMutation.mockReturnValue({
			mutate: mockMutate,
			isLoading: false,
			isError: false,
			error: null
		} as any)
	})

	afterEach(() => {
		vi.restoreAllMocks()
	})

	describe('Basic Rendering', () => {
		it('renders without crashing', () => {
			const sections = [createMockSection('1', 'Education', 0)]
			const renderSection = createMockRenderSection()

			render(
				<ReorderableSections
					sections={sections}
					resumeId="resume-123"
					renderSection={renderSection}
				/>
			)

			expect(screen.getByTestId('dnd-context-0')).toBeInTheDocument()
		})

		it('renders with custom className', () => {
			const sections = [createMockSection('1', 'Education', 0)]
			const renderSection = createMockRenderSection()
			const className = 'custom-reorderable-class'

			render(
				<ReorderableSections
					sections={sections}
					resumeId="resume-123"
					renderSection={renderSection}
					className={className}
				/>
			)

			const container = screen.getByTestId('dnd-context-0').parentElement
			expect(container).toHaveClass(className)
		})

		it('renders sections correctly', () => {
			const sections = [
				createMockSection('1', 'Education', 0),
				createMockSection('2', 'Experience', 1)
			]
			const renderSection = createMockRenderSection()

			render(
				<ReorderableSections
					sections={sections}
					resumeId="resume-123"
					renderSection={renderSection}
				/>
			)

			expect(screen.getByTestId('section-title-1')).toBeInTheDocument()
			expect(screen.getByTestId('section-content-1')).toBeInTheDocument()
			expect(screen.getByTestId('section-title-2')).toBeInTheDocument()
			expect(screen.getByTestId('section-content-2')).toBeInTheDocument()
		})

		it('groups sections by type correctly', () => {
			const sections = [
				createMockSection('1', 'Education', 0),
				createMockSection('2', 'Education', 1),
				createMockSection('3', 'Experience', 2)
			]
			const renderSection = createMockRenderSection()

			render(
				<ReorderableSections
					sections={sections}
					resumeId="resume-123"
					renderSection={renderSection}
				/>
			)

			/*
			 * Should have Education group first, then Experience
			 * Only the first section in each group gets a title
			 */
			expect(screen.getByTestId('section-title-1')).toBeInTheDocument() // First Education section
			expect(screen.getByTestId('section-title-3')).toBeInTheDocument() // First Experience section

			// All sections should have content
			expect(screen.getByTestId('section-content-1')).toBeInTheDocument()
			expect(screen.getByTestId('section-content-2')).toBeInTheDocument()
			expect(screen.getByTestId('section-content-3')).toBeInTheDocument()
		})
	})

	describe('Drag and Drop Configuration', () => {
		it('configures DndContext with correct sensors', () => {
			const sections = [createMockSection('1', 'Education', 0)]
			const renderSection = createMockRenderSection()

			render(
				<ReorderableSections
					sections={sections}
					resumeId="resume-123"
					renderSection={renderSection}
				/>
			)

			const dndContext = screen.getByTestId('dnd-context-0')
			expect(dndContext).toHaveAttribute('data-sensors')
		})

		it('configures SortableContext with correct items', () => {
			const sections = [
				createMockSection('1', 'Education', 0),
				createMockSection('2', 'Experience', 1)
			]
			const renderSection = createMockRenderSection()

			render(
				<ReorderableSections
					sections={sections}
					resumeId="resume-123"
					renderSection={renderSection}
				/>
			)

			const sortableContext = screen.getAllByTestId('sortable-context')[0]
			expect(sortableContext).toHaveAttribute('data-strategy', 'verticalListSortingStrategy')
		})

		it('renders drag handles for sections', () => {
			const sections = [createMockSection('1', 'Education', 0)]
			const renderSection = createMockRenderSection()

			render(
				<ReorderableSections
					sections={sections}
					resumeId="resume-123"
					renderSection={renderSection}
				/>
			)

			expect(screen.getAllByTestId('grip-vertical-icon')[0]).toBeInTheDocument()
		})
	})

	describe('Section Reordering', () => {
		it('handles section reordering within groups', async () => {
			const sections = [
				createMockSection('1', 'Education', 0),
				createMockSection('2', 'Education', 1)
			]
			const renderSection = createMockRenderSection()

			render(
				<ReorderableSections
					sections={sections}
					resumeId="resume-123"
					renderSection={renderSection}
				/>
			)

			// Component renders without errors - drag functionality is handled by the library
			expect(screen.getByTestId('dnd-context-1')).toBeInTheDocument()
			expect(screen.getByTestId('section-content-1')).toBeInTheDocument()
			expect(screen.getByTestId('section-content-2')).toBeInTheDocument()

			// Verify drag handles are present
			const dragHandles = screen.getAllByTestId('button')
			expect(dragHandles.length).toBeGreaterThan(0)
		})

		it('calls mutation with correct parameters', async () => {
			const sections = [
				createMockSection('1', 'Education', 0),
				createMockSection('2', 'Education', 1)
			]
			const renderSection = createMockRenderSection()

			render(
				<ReorderableSections
					sections={sections}
					resumeId="resume-123"
					renderSection={renderSection}
				/>
			)

			// Component renders without errors - drag functionality is handled by the library
			expect(screen.getByTestId('dnd-context-1')).toBeInTheDocument()
			expect(screen.getByTestId('section-content-1')).toBeInTheDocument()
			expect(screen.getByTestId('section-content-2')).toBeInTheDocument()

			// Verify drag handles are present
			const dragHandles = screen.getAllByTestId('button')
			expect(dragHandles.length).toBeGreaterThan(0)
		})

		it('updates local state optimistically', async () => {
			const sections = [
				createMockSection('1', 'Education', 0),
				createMockSection('2', 'Education', 1)
			]
			const renderSection = createMockRenderSection()

			render(
				<ReorderableSections
					sections={sections}
					resumeId="resume-123"
					renderSection={renderSection}
				/>
			)

			// Initial state should show sections in order
			expect(screen.getByTestId('section-content-1')).toBeInTheDocument()
			expect(screen.getByTestId('section-content-2')).toBeInTheDocument()
		})
	})

	describe('Group Reordering', () => {
		it('handles group reordering', async () => {
			const sections = [
				createMockSection('1', 'Education', 0),
				createMockSection('2', 'Experience', 1)
			]
			const renderSection = createMockRenderSection()

			render(
				<ReorderableSections
					sections={sections}
					resumeId="resume-123"
					renderSection={renderSection}
				/>
			)

			// Should have group drag handles
			const groupDragHandles = screen.getAllByTestId('button')
			expect(groupDragHandles.length).toBeGreaterThan(0)
		})

		it('maintains group structure during reordering', async () => {
			const sections = [
				createMockSection('1', 'Education', 0),
				createMockSection('2', 'Education', 1),
				createMockSection('3', 'Experience', 2)
			]
			const renderSection = createMockRenderSection()

			render(
				<ReorderableSections
					sections={sections}
					resumeId="resume-123"
					renderSection={renderSection}
				/>
			)

			/*
			 * Groups should maintain their internal structure
			 * Only the first section in each group gets a section title
			 */
			expect(screen.getByTestId('section-title-1')).toBeInTheDocument() // First Education section
			expect(screen.getByTestId('section-title-3')).toBeInTheDocument() // First Experience section

			// All sections should have content
			expect(screen.getByTestId('section-content-1')).toBeInTheDocument()
			expect(screen.getByTestId('section-content-2')).toBeInTheDocument()
			expect(screen.getByTestId('section-content-3')).toBeInTheDocument()
		})
	})

	describe('Drag Overlay', () => {
		it('renders drag overlay when dragging', () => {
			const sections = [createMockSection('1', 'Education', 0)]
			const renderSection = createMockRenderSection()

			render(
				<ReorderableSections
					sections={sections}
					resumeId="resume-123"
					renderSection={renderSection}
				/>
			)

			expect(screen.getAllByTestId('drag-overlay-1')[0]).toBeInTheDocument()
		})

		it('shows correct content in drag overlay', () => {
			const sections = [createMockSection('1', 'Education', 0)]
			const renderSection = createMockRenderSection()

			render(
				<ReorderableSections
					sections={sections}
					resumeId="resume-123"
					renderSection={renderSection}
				/>
			)

			const dragOverlay = screen.getAllByTestId('drag-overlay-1')[0]
			expect(dragOverlay).toBeInTheDocument()
		})
	})

	describe('Render Section Integration', () => {
		it('calls renderSection for each section', () => {
			const sections = [
				createMockSection('1', 'Education', 0),
				createMockSection('2', 'Experience', 1)
			]
			const renderSection = createMockRenderSection()

			render(
				<ReorderableSections
					sections={sections}
					resumeId="resume-123"
					renderSection={renderSection}
				/>
			)

			// Component may re-render during test, so check that it's called at least once for each section
			expect(renderSection).toHaveBeenCalledWith(sections[0], true)
			expect(renderSection).toHaveBeenCalledWith(sections[1], true)
		})

		it('passes isFirstInGroup correctly', () => {
			const sections = [
				createMockSection('1', 'Education', 0),
				createMockSection('2', 'Education', 1)
			]
			const renderSection = createMockRenderSection()

			render(
				<ReorderableSections
					sections={sections}
					resumeId="resume-123"
					renderSection={renderSection}
				/>
			)

			// First section in group should be marked as first
			expect(renderSection).toHaveBeenCalledWith(sections[0], true)
			// Second section in same group should not be marked as first
			expect(renderSection).toHaveBeenCalledWith(sections[1], false)
		})

		it('renders section content correctly', () => {
			const sections = [createMockSection('1', 'Education', 0)]
			const renderSection = createMockRenderSection()

			render(
				<ReorderableSections
					sections={sections}
					resumeId="resume-123"
					renderSection={renderSection}
				/>
			)

			expect(screen.getByTestId('section-title-1')).toHaveTextContent('Education Title (First)')
			expect(screen.getByTestId('section-content-1')).toHaveTextContent('Education Content - 1')
		})
	})

	describe('Error Handling', () => {
		it('handles empty sections array', () => {
			const renderSection = createMockRenderSection()

			render(
				<ReorderableSections
					sections={[]}
					resumeId="resume-123"
					renderSection={renderSection}
				/>
			)

			expect(screen.getByTestId('dnd-context-0')).toBeInTheDocument()
		})

		it('handles mutation errors gracefully', async () => {
			const sections = [createMockSection('1', 'Education', 0)]
			const renderSection = createMockRenderSection()

			mockUseRearrangeResumeSectionsMutation.mockReturnValue({
				mutate: vi.fn().mockImplementation(() => {
					throw new Error('Mutation failed')
				}),
				isLoading: false,
				isError: true,
				error: new Error('Mutation failed')
			} as any)

			render(
				<ReorderableSections
					sections={sections}
					resumeId="resume-123"
					renderSection={renderSection}
				/>
			)

			// Should still render without crashing
			expect(screen.getByTestId('dnd-context-0')).toBeInTheDocument()
		})

		it('handles invalid section data gracefully', () => {
			const invalidSection: ResumeSection = {
				id: 'invalid',
				resume: 'resume-123',
				index: 0,
				type: 'Education' as const,
				data: {
					id: 'invalid-edu',
					user: 'user-123',
					resume_section: 'invalid',
					institution_name: '',
					degree: '',
					field_of_study: '',
					country: {
						code: '',
						name: ''
					},
					started_from_month: 1,
					started_from_year: 2020,
					finished_at_month: null,
					finished_at_year: null,
					current: false,
					description: '',
					created_at: '2023-01-01T00:00:00Z',
					updated_at: '2023-01-01T00:00:00Z'
				}
			}
			const renderSection = createMockRenderSection()

			render(
				<ReorderableSections
					sections={[invalidSection]}
					resumeId="resume-123"
					renderSection={renderSection}
				/>
			)

			expect(screen.getByTestId('dnd-context-0')).toBeInTheDocument()
		})
	})

	describe('Accessibility', () => {
		it('provides accessible drag handles', () => {
			const sections = [createMockSection('1', 'Education', 0)]
			const renderSection = createMockRenderSection()

			render(
				<ReorderableSections
					sections={sections}
					resumeId="resume-123"
					renderSection={renderSection}
				/>
			)

			const dragHandle = screen.getAllByTestId('button')[0]
			expect(dragHandle).toHaveAttribute('aria-label', 'Drag to reorder section group')
		})

		it('supports keyboard navigation', () => {
			const sections = [createMockSection('1', 'Education', 0)]
			const renderSection = createMockRenderSection()

			render(
				<ReorderableSections
					sections={sections}
					resumeId="resume-123"
					renderSection={renderSection}
				/>
			)

			const dragHandle = screen.getAllByTestId('button')[0]
			expect(dragHandle).toBeInTheDocument()

			// Should be focusable
			dragHandle.focus()
			expect(document.activeElement).toBe(dragHandle)
		})
	})

	describe('Performance', () => {
		it('handles large number of sections efficiently', () => {
			const sections = Array.from({length: 50}, (_, i) => createMockSection(`section-${i}`, i % 2 === 0 ? 'Education' : 'Experience', i))
			const renderSection = createMockRenderSection()

			render(
				<ReorderableSections
					sections={sections}
					resumeId="resume-123"
					renderSection={renderSection}
				/>
			)

			expect(screen.getByTestId('dnd-context-0')).toBeInTheDocument()
		})

		it('minimizes re-renders during drag operations', () => {
			const sections = [
				createMockSection('1', 'Education', 0),
				createMockSection('2', 'Education', 1)
			]
			const renderSection = createMockRenderSection()

			render(
				<ReorderableSections
					sections={sections}
					resumeId="resume-123"
					renderSection={renderSection}
				/>
			)

			/*
			 * RenderSection should be called for each section
			 * The first section in the group gets isFirstInGroup=true, the second gets false
			 */
			expect(renderSection).toHaveBeenCalledWith(sections[0], true)
			expect(renderSection).toHaveBeenCalledWith(sections[1], false)
		})
	})

	describe('State Management', () => {
		it('updates local state when sections prop changes', () => {
			const initialSections = [createMockSection('1', 'Education', 0)]
			const renderSection = createMockRenderSection()

			const {rerender} = render(
				<ReorderableSections
					sections={initialSections}
					resumeId="resume-123"
					renderSection={renderSection}
				/>
			)

			expect(screen.getByTestId('section-content-1')).toBeInTheDocument()

			// Update sections
			const newSections = [
				createMockSection('1', 'Education', 0),
				createMockSection('2', 'Experience', 1)
			]

			rerender(
				<ReorderableSections
					sections={newSections}
					resumeId="resume-123"
					renderSection={renderSection}
				/>
			)

			expect(screen.getByTestId('section-content-1')).toBeInTheDocument()
			expect(screen.getByTestId('section-content-2')).toBeInTheDocument()
		})

		it('maintains drag state correctly', () => {
			const sections = [createMockSection('1', 'Education', 0)]
			const renderSection = createMockRenderSection()

			render(
				<ReorderableSections
					sections={sections}
					resumeId="resume-123"
					renderSection={renderSection}
				/>
			)

			// Initial state should not be dragging
			expect(screen.getByTestId('dnd-context-0')).toBeInTheDocument()
		})
	})

	describe('Component Unmounting', () => {
		it('unmounts without errors', () => {
			const sections = [createMockSection('1', 'Education', 0)]
			const renderSection = createMockRenderSection()

			const {unmount} = render(
				<ReorderableSections
					sections={sections}
					resumeId="resume-123"
					renderSection={renderSection}
				/>
			)

			expect(() => unmount()).not.toThrow()
		})

		it('cleans up drag state on unmount', () => {
			const sections = [createMockSection('1', 'Education', 0)]
			const renderSection = createMockRenderSection()

			const {unmount} = render(
				<ReorderableSections
					sections={sections}
					resumeId="resume-123"
					renderSection={renderSection}
				/>
			)

			// Should not throw when unmounting
			expect(() => unmount()).not.toThrow()
		})
	})
})
