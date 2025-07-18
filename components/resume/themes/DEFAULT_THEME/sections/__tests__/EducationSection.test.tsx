import React from 'react'
import {render, screen} from '@testing-library/react'
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import EducationSection from '@/components/resume/themes/DEFAULT_THEME/sections/EducationSection'
import {EducationData} from '@/components/resume/controllers/EducationController'

// --- Mock Data ---
const mockEducationDataComplete: EducationData = {
	institution: {
		hasInstitution: true,
		name: 'Harvard University',
		location: 'United States',
		formatted: 'Harvard University, United States'
	},
	degree: {
		hasDegree: true,
		degreeType: 'Bachelor of Science',
		fieldOfStudy: 'Computer Science',
		formatted: 'Bachelor of Science in Computer Science'
	},
	dates: {
		hasDates: true,
		formatted: '2018 – 2022'
	},
	description: {
		hasDescription: true,
		sanitizedHtml: '<p>Graduated with honors. Specialized in artificial intelligence and machine learning.</p>'
	},
	spacing: {
		marginTop: true
	}
}

const mockEducationDataMinimal: EducationData = {
	institution: {
		hasInstitution: true,
		name: 'Stanford University',
		location: undefined,
		formatted: 'Stanford University'
	},
	degree: {
		hasDegree: false,
		degreeType: undefined,
		fieldOfStudy: undefined,
		formatted: ''
	},
	dates: {
		hasDates: false,
		formatted: ''
	},
	description: {
		hasDescription: false,
		sanitizedHtml: undefined
	},
	spacing: {
		marginTop: false
	}
}

const mockEducationDataPartial: EducationData = {
	institution: {
		hasInstitution: true,
		name: 'MIT',
		location: 'United States',
		formatted: 'MIT, United States'
	},
	degree: {
		hasDegree: true,
		degreeType: 'Master of Engineering',
		fieldOfStudy: undefined,
		formatted: 'Master of Engineering'
	},
	dates: {
		hasDates: true,
		formatted: '2022 – Present'
	},
	description: {
		hasDescription: false,
		sanitizedHtml: undefined
	},
	spacing: {
		marginTop: true
	}
}

const mockEducationDataDegreeOnly: EducationData = {
	institution: {
		hasInstitution: true,
		name: 'University of California, Berkeley',
		location: 'United States',
		formatted: 'University of California, Berkeley, United States'
	},
	degree: {
		hasDegree: true,
		degreeType: undefined,
		fieldOfStudy: 'Physics',
		formatted: 'Physics'
	},
	dates: {
		hasDates: true,
		formatted: '2015 – 2019'
	},
	description: {
		hasDescription: true,
		sanitizedHtml: '<p>Focus on quantum mechanics and theoretical physics.</p>'
	},
	spacing: {
		marginTop: false
	}
}

// --- Mocks ---
vi.mock('@/components/resume/themes/DEFAULT_THEME/fonts', () => ({
	charter: {
		className: 'charter-font'
	}
}))

// --- Tests ---
describe('EducationSection', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	afterEach(() => {
		vi.clearAllMocks()
	})

	describe('Component Rendering', () => {
		it('renders the education section with complete data', () => {
			render(<EducationSection data={mockEducationDataComplete} />)

			// Check main container
			const container = document.querySelector('.charter-font')
			expect(container).toBeInTheDocument()
			expect(container).toHaveClass('charter-font', 'education-item', 'mt-2')

			// Check institution name
			expect(screen.getByText('Harvard University')).toBeInTheDocument()

			// Check degree
			expect(screen.getByText(/Bachelor of Science in Computer Science/)).toBeInTheDocument()

			// Check dates
			expect(screen.getByText('2018 – 2022')).toBeInTheDocument()

			// Check description
			const descriptionElement = container?.querySelector('.education-details')
			expect(descriptionElement).toBeInTheDocument()
			expect(descriptionElement?.innerHTML).toContain('Graduated with honors')
		})

		it('renders with minimal data (institution name only)', () => {
			render(<EducationSection data={mockEducationDataMinimal} />)

			// Check main container
			const container = document.querySelector('.charter-font')
			expect(container).toBeInTheDocument()
			expect(container).toHaveClass('charter-font', 'education-item')
			expect(container).not.toHaveClass('mt-2')

			// Check institution name
			expect(screen.getByText('Stanford University')).toBeInTheDocument()

			// Should not render degree
			expect(screen.queryByText(/Bachelor of Science/)).not.toBeInTheDocument()

			// Should not render dates
			expect(screen.queryByText('2018 – 2022')).not.toBeInTheDocument()

			// Should not render description
			const descriptionElement = container?.querySelector('.education-details')
			expect(descriptionElement).not.toBeInTheDocument()
		})

		it('renders with partial data (no description)', () => {
			render(<EducationSection data={mockEducationDataPartial} />)

			// Check main container
			const container = document.querySelector('.charter-font')
			expect(container).toBeInTheDocument()
			expect(container).toHaveClass('charter-font', 'education-item', 'mt-2')

			// Check institution name
			expect(screen.getByText('MIT')).toBeInTheDocument()

			// Check degree
			expect(screen.getByText(/Master of Engineering/)).toBeInTheDocument()

			// Check dates
			expect(screen.getByText('2022 – Present')).toBeInTheDocument()

			// Should not render description
			const descriptionElement = container?.querySelector('.education-details')
			expect(descriptionElement).not.toBeInTheDocument()
		})

		it('renders with field of study only (no degree type)', () => {
			render(<EducationSection data={mockEducationDataDegreeOnly} />)

			// Check main container
			const container = document.querySelector('.charter-font')
			expect(container).toBeInTheDocument()
			expect(container).toHaveClass('charter-font', 'education-item')
			expect(container).not.toHaveClass('mt-2')

			// Check institution name
			expect(screen.getByText('University of California, Berkeley')).toBeInTheDocument()

			// Check field of study
			expect(screen.getByText(/Physics/)).toBeInTheDocument()

			// Check dates
			expect(screen.getByText('2015 – 2019')).toBeInTheDocument()

			// Check description
			const descriptionElement = container?.querySelector('.education-details')
			expect(descriptionElement).toBeInTheDocument()
		})
	})

	describe('Education Header', () => {
		it('renders the education header with institution name and degree', () => {
			render(<EducationSection data={mockEducationDataComplete} />)

			const header = document.querySelector('.education-header')
			expect(header).toBeInTheDocument()

			// Check title section
			const titleSection = header?.querySelector('.education-title')
			expect(titleSection).toBeInTheDocument()
			expect(titleSection).toHaveTextContent('Harvard University, Bachelor of Science in Computer Science')

			// Check institution name is bold
			const boldTitle = titleSection?.querySelector('.title-bold')
			expect(boldTitle).toBeInTheDocument()
			expect(boldTitle).toHaveTextContent('Harvard University')
		})

		it('renders the education header with institution name only', () => {
			render(<EducationSection data={mockEducationDataMinimal} />)

			const header = document.querySelector('.education-header')
			expect(header).toBeInTheDocument()

			// Check title section
			const titleSection = header?.querySelector('.education-title')
			expect(titleSection).toBeInTheDocument()
			expect(titleSection).toHaveTextContent('Stanford University')
			expect(titleSection).not.toHaveTextContent(',')

			// Check institution name is bold
			const boldTitle = titleSection?.querySelector('.title-bold')
			expect(boldTitle).toBeInTheDocument()
			expect(boldTitle).toHaveTextContent('Stanford University')
		})

		it('renders the education header with dates', () => {
			render(<EducationSection data={mockEducationDataComplete} />)

			const header = document.querySelector('.education-header')
			expect(header).toBeInTheDocument()

			// Check date section
			const dateSection = header?.querySelector('.education-date')
			expect(dateSection).toBeInTheDocument()
			expect(dateSection).toHaveTextContent('2018 – 2022')
		})

		it('does not render dates when not provided', () => {
			render(<EducationSection data={mockEducationDataMinimal} />)

			const header = document.querySelector('.education-header')
			expect(header).toBeInTheDocument()

			// Check date section should not exist
			const dateSection = header?.querySelector('.education-date')
			expect(dateSection).not.toBeInTheDocument()
		})

		it('handles comma placement correctly with institution and degree', () => {
			render(<EducationSection data={mockEducationDataComplete} />)

			const titleSection = document.querySelector('.education-title')
			expect(titleSection).toHaveTextContent('Harvard University, Bachelor of Science in Computer Science')
		})

		it('handles comma placement correctly with institution only', () => {
			render(<EducationSection data={mockEducationDataMinimal} />)

			const titleSection = document.querySelector('.education-title')
			expect(titleSection).toHaveTextContent('Stanford University')
			expect(titleSection?.textContent).not.toContain(',')
		})
	})

	describe('Education Description', () => {
		it('renders the description with HTML content', () => {
			render(<EducationSection data={mockEducationDataComplete} />)

			const descriptionElement = document.querySelector('.education-details')
			expect(descriptionElement).toBeInTheDocument()
			expect(descriptionElement?.innerHTML).toContain('<p>Graduated with honors')
			expect(descriptionElement?.innerHTML).toContain('artificial intelligence')
		})

		it('does not render description when not provided', () => {
			render(<EducationSection data={mockEducationDataMinimal} />)

			const descriptionElement = document.querySelector('.education-details')
			expect(descriptionElement).not.toBeInTheDocument()
		})

		it('handles empty description HTML gracefully', () => {
			const dataWithEmptyDescription = {
				...mockEducationDataComplete,
				description: {
					hasDescription: true,
					sanitizedHtml: ''
				}
			}

			render(<EducationSection data={dataWithEmptyDescription} />)

			const descriptionElement = document.querySelector('.education-details')
			expect(descriptionElement).toBeInTheDocument()
			expect(descriptionElement?.innerHTML).toBe('')
		})

		it('renders complex HTML in description', () => {
			const dataWithComplexHTML = {
				...mockEducationDataComplete,
				description: {
					hasDescription: true,
					sanitizedHtml: '<p><strong>Achievements:</strong></p><ul><li>Dean\'s List</li><li>Research Assistant</li></ul>'
				}
			}

			render(<EducationSection data={dataWithComplexHTML} />)

			const descriptionElement = document.querySelector('.education-details')
			expect(descriptionElement).toBeInTheDocument()
			expect(descriptionElement?.innerHTML).toContain('<strong>Achievements:</strong>')
			expect(descriptionElement?.innerHTML).toContain('<ul>')
			expect(descriptionElement?.innerHTML).toContain('<li>Dean\'s List</li>')
		})

		it('handles undefined sanitizedHtml when hasDescription is true', () => {
			const dataWithUndefinedHTML = {
				...mockEducationDataComplete,
				description: {
					hasDescription: true,
					sanitizedHtml: undefined
				}
			}

			render(<EducationSection data={dataWithUndefinedHTML} />)

			const descriptionElement = document.querySelector('.education-details')
			expect(descriptionElement).toBeInTheDocument()
			expect(descriptionElement?.innerHTML).toBe('')
		})
	})

	describe('Styling and Classes', () => {
		it('applies Charter font class to main container', () => {
			render(<EducationSection data={mockEducationDataComplete} />)

			const container = document.querySelector('.charter-font')
			expect(container).toBeInTheDocument()
			expect(container).toHaveClass('charter-font')
		})

		it('applies education-item class to main container', () => {
			render(<EducationSection data={mockEducationDataComplete} />)

			const container = document.querySelector('.education-item')
			expect(container).toBeInTheDocument()
		})

		it('applies margin-top class when spacing.marginTop is true', () => {
			render(<EducationSection data={mockEducationDataComplete} />)

			const container = document.querySelector('.education-item')
			expect(container).toHaveClass('mt-2')
		})

		it('does not apply margin-top class when spacing.marginTop is false', () => {
			render(<EducationSection data={mockEducationDataMinimal} />)

			const container = document.querySelector('.education-item')
			expect(container).not.toHaveClass('mt-2')
		})

		it('applies correct CSS classes to elements', () => {
			render(<EducationSection data={mockEducationDataComplete} />)

			// Check header class
			const header = document.querySelector('.education-header')
			expect(header).toBeInTheDocument()

			// Check title class
			const title = document.querySelector('.education-title')
			expect(title).toBeInTheDocument()

			// Check bold title class
			const boldTitle = document.querySelector('.title-bold')
			expect(boldTitle).toBeInTheDocument()

			// Check date class
			const date = document.querySelector('.education-date')
			expect(date).toBeInTheDocument()

			// Check details class
			const details = document.querySelector('.education-details')
			expect(details).toBeInTheDocument()
		})
	})

	describe('Edge Cases', () => {
		it('handles institution name with special characters', () => {
			const dataWithSpecialChars = {
				...mockEducationDataComplete,
				institution: {
					hasInstitution: true,
					name: 'École Polytechnique Fédérale de Lausanne',
					location: 'Switzerland',
					formatted: 'École Polytechnique Fédérale de Lausanne, Switzerland'
				}
			}

			render(<EducationSection data={dataWithSpecialChars} />)

			expect(screen.getByText('École Polytechnique Fédérale de Lausanne')).toBeInTheDocument()
		})

		it('handles very long institution names and degrees', () => {
			const dataWithLongNames = {
				...mockEducationDataComplete,
				institution: {
					hasInstitution: true,
					name: 'The International University of Advanced Technology and Applied Sciences',
					location: 'United Kingdom',
					formatted: 'The International University of Advanced Technology and Applied Sciences, United Kingdom'
				},
				degree: {
					hasDegree: true,
					degreeType: 'Bachelor of Science',
					fieldOfStudy: 'Artificial Intelligence and Computational Neuroscience with Honors',
					formatted: 'Bachelor of Science in Artificial Intelligence and Computational Neuroscience with Honors'
				}
			}

			render(<EducationSection data={dataWithLongNames} />)

			expect(screen.getByText('The International University of Advanced Technology and Applied Sciences')).toBeInTheDocument()
			expect(screen.getByText(/, Bachelor of Science in Artificial Intelligence and Computational Neuroscience with Honors/)).toBeInTheDocument()
		})

		it('handles degree with only field of study', () => {
			const dataFieldOfStudyOnly = {
				...mockEducationDataComplete,
				degree: {
					hasDegree: true,
					degreeType: undefined,
					fieldOfStudy: 'Computer Science',
					formatted: 'Computer Science'
				}
			}

			render(<EducationSection data={dataFieldOfStudyOnly} />)

			expect(screen.getByText(/Computer Science/)).toBeInTheDocument()
			expect(screen.queryByText('Bachelor of Science')).not.toBeInTheDocument()
		})

		it('handles degree with only degree type', () => {
			const dataDegreeTypeOnly = {
				...mockEducationDataComplete,
				degree: {
					hasDegree: true,
					degreeType: 'Master of Arts',
					fieldOfStudy: undefined,
					formatted: 'Master of Arts'
				}
			}

			render(<EducationSection data={dataDegreeTypeOnly} />)

			expect(screen.getByText(/Master of Arts/)).toBeInTheDocument()
		})

		it('handles institution without location', () => {
			const dataNoLocation = {
				...mockEducationDataComplete,
				institution: {
					hasInstitution: true,
					name: 'Online University',
					location: undefined,
					formatted: 'Online University'
				}
			}

			render(<EducationSection data={dataNoLocation} />)

			expect(screen.getByText('Online University')).toBeInTheDocument()
		})

		it('handles dates with Present', () => {
			const dataWithPresent = {
				...mockEducationDataComplete,
				dates: {
					hasDates: true,
					formatted: '2020 – Present'
				}
			}

			render(<EducationSection data={dataWithPresent} />)

			expect(screen.getByText('2020 – Present')).toBeInTheDocument()
		})

		it('handles single year date', () => {
			const dataSingleYear = {
				...mockEducationDataComplete,
				dates: {
					hasDates: true,
					formatted: '2022'
				}
			}

			render(<EducationSection data={dataSingleYear} />)

			expect(screen.getByText('2022')).toBeInTheDocument()
		})

		it('handles all optional fields being undefined', () => {
			const dataAllUndefined: EducationData = {
				institution: {
					hasInstitution: true,
					name: 'Basic University',
					location: undefined,
					formatted: 'Basic University'
				},
				degree: {
					hasDegree: false,
					degreeType: undefined,
					fieldOfStudy: undefined,
					formatted: ''
				},
				dates: {
					hasDates: false,
					formatted: ''
				},
				description: {
					hasDescription: false,
					sanitizedHtml: undefined
				},
				spacing: {
					marginTop: false
				}
			}

			render(<EducationSection data={dataAllUndefined} />)

			// Should only render institution name
			expect(screen.getByText('Basic University')).toBeInTheDocument()

			// Should not render other elements
			expect(document.querySelector('.education-date')).not.toBeInTheDocument()
			expect(document.querySelector('.education-details')).not.toBeInTheDocument()
			expect(screen.queryByText(',')).not.toBeInTheDocument()
		})
	})
})
