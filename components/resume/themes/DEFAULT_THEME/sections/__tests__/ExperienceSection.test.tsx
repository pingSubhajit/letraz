import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import ExperienceSection from '../ExperienceSection'
import { ExperienceData } from '@/components/resume/controllers/ExperienceController'

// --- Mock Data ---
const mockExperienceDataComplete: ExperienceData = {
    role: {
        hasRole: true,
        title: 'Senior Software Engineer',
        employmentType: 'Full-time',
        formatted: 'Senior Software Engineer (Full-time)'
    },
    company: {
        hasCompany: true,
        name: 'Google Inc.',
        location: 'Mountain View, CA',
        formatted: 'Google Inc., Mountain View, CA'
    },
    dates: {
        hasDates: true,
        formatted: 'Jan 2020 – Present'
    },
    description: {
        hasDescription: true,
        sanitizedHtml: '<p>Led development of scalable web applications. Mentored junior developers and improved team productivity by 40%.</p>'
    },
    spacing: {
        marginTop: true
    }
}

const mockExperienceDataMinimal: ExperienceData = {
    role: {
        hasRole: false,
        title: undefined,
        employmentType: undefined,
        formatted: ''
    },
    company: {
        hasCompany: true,
        name: 'Apple Inc.',
        location: undefined,
        formatted: 'Apple Inc.'
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

const mockExperienceDataPartial: ExperienceData = {
    role: {
        hasRole: true,
        title: 'Product Manager',
        employmentType: undefined,
        formatted: 'Product Manager'
    },
    company: {
        hasCompany: true,
        name: 'Microsoft',
        location: 'Seattle, WA',
        formatted: 'Microsoft, Seattle, WA'
    },
    dates: {
        hasDates: true,
        formatted: 'Mar 2019 – Dec 2021'
    },
    description: {
        hasDescription: false,
        sanitizedHtml: undefined
    },
    spacing: {
        marginTop: true
    }
}

const mockExperienceDataNoRole: ExperienceData = {
    role: {
        hasRole: false,
        title: undefined,
        employmentType: undefined,
        formatted: ''
    },
    company: {
        hasCompany: true,
        name: 'Tesla',
        location: 'Austin, TX',
        formatted: 'Tesla, Austin, TX'
    },
    dates: {
        hasDates: true,
        formatted: 'Jun 2018 – Feb 2019'
    },
    description: {
        hasDescription: true,
        sanitizedHtml: '<p>Worked on autonomous vehicle software systems.</p>'
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
describe('ExperienceSection', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    describe('Component Rendering', () => {
        it('renders the experience section with complete data', () => {
            render(<ExperienceSection data={mockExperienceDataComplete} />)

            // Check main container
            const container = document.querySelector('.charter-font')
            expect(container).toBeInTheDocument()
            expect(container).toHaveClass('charter-font', 'experience-item', 'mt-2')

            // Check role title
            expect(screen.getByText('Senior Software Engineer (Full-time)')).toBeInTheDocument()

            // Check company name
            expect(screen.getByText(/Google Inc\., Mountain View, CA/)).toBeInTheDocument()

            // Check dates
            expect(screen.getByText('Jan 2020 – Present')).toBeInTheDocument()

            // Check description
            const descriptionElement = container?.querySelector('.job-details')
            expect(descriptionElement).toBeInTheDocument()
            expect(descriptionElement?.innerHTML).toContain('Led development of scalable web applications')
        })

        it('renders with minimal data (company name only)', () => {
            render(<ExperienceSection data={mockExperienceDataMinimal} />)

            // Check main container
            const container = document.querySelector('.charter-font')
            expect(container).toBeInTheDocument()
            expect(container).toHaveClass('charter-font', 'experience-item')
            expect(container).not.toHaveClass('mt-2')

            // Check company name
            expect(screen.getByText('Apple Inc.')).toBeInTheDocument()

            // Should not render role title
            expect(screen.queryByText('Senior Software Engineer')).not.toBeInTheDocument()

            // Should not render dates
            expect(screen.queryByText('Jan 2020 – Present')).not.toBeInTheDocument()

            // Should not render description
            const descriptionElement = container?.querySelector('.job-details')
            expect(descriptionElement).not.toBeInTheDocument()
        })

        it('renders with partial data (no description)', () => {
            render(<ExperienceSection data={mockExperienceDataPartial} />)

            // Check main container
            const container = document.querySelector('.charter-font')
            expect(container).toBeInTheDocument()
            expect(container).toHaveClass('charter-font', 'experience-item', 'mt-2')

            // Check role title
            expect(screen.getByText('Product Manager')).toBeInTheDocument()

            // Check company name
            expect(screen.getByText(/Microsoft, Seattle, WA/)).toBeInTheDocument()

            // Check dates
            expect(screen.getByText('Mar 2019 – Dec 2021')).toBeInTheDocument()

            // Should not render description
            const descriptionElement = container?.querySelector('.job-details')
            expect(descriptionElement).not.toBeInTheDocument()
        })

        it('renders without role title', () => {
            render(<ExperienceSection data={mockExperienceDataNoRole} />)

            // Check main container
            const container = document.querySelector('.charter-font')
            expect(container).toBeInTheDocument()
            expect(container).toHaveClass('charter-font', 'experience-item')
            expect(container).not.toHaveClass('mt-2')

            // Check company name
            expect(screen.getByText('Tesla, Austin, TX')).toBeInTheDocument()

            // Should not render role title
            expect(screen.queryByText('Senior Software Engineer')).not.toBeInTheDocument()

            // Check dates
            expect(screen.getByText('Jun 2018 – Feb 2019')).toBeInTheDocument()

            // Check description
            const descriptionElement = container?.querySelector('.job-details')
            expect(descriptionElement).toBeInTheDocument()
        })
    })

    describe('Job Header', () => {
        it('renders the job header with role title and company name', () => {
            render(<ExperienceSection data={mockExperienceDataComplete} />)

            const header = document.querySelector('.job-header')
            expect(header).toBeInTheDocument()

            // Check title section
            const titleSection = header?.querySelector('.job-title')
            expect(titleSection).toBeInTheDocument()
            expect(titleSection).toHaveTextContent('Senior Software Engineer (Full-time), Google Inc., Mountain View, CA')

            // Check role title is bold
            const boldTitle = titleSection?.querySelector('.title-bold')
            expect(boldTitle).toBeInTheDocument()
            expect(boldTitle).toHaveTextContent('Senior Software Engineer (Full-time)')
        })

        it('renders the job header with company name only', () => {
            render(<ExperienceSection data={mockExperienceDataMinimal} />)

            const header = document.querySelector('.job-header')
            expect(header).toBeInTheDocument()

            // Check title section
            const titleSection = header?.querySelector('.job-title')
            expect(titleSection).toBeInTheDocument()
            expect(titleSection).toHaveTextContent('Apple Inc.')
            expect(titleSection).not.toHaveTextContent(',')

            // Should not have bold title when no role
            const boldTitle = titleSection?.querySelector('.title-bold')
            expect(boldTitle).not.toBeInTheDocument()
        })

        it('renders the job header with dates', () => {
            render(<ExperienceSection data={mockExperienceDataComplete} />)

            const header = document.querySelector('.job-header')
            expect(header).toBeInTheDocument()

            // Check date section
            const dateSection = header?.querySelector('.job-date')
            expect(dateSection).toBeInTheDocument()
            expect(dateSection).toHaveTextContent('Jan 2020 – Present')
        })

        it('does not render dates when not provided', () => {
            render(<ExperienceSection data={mockExperienceDataMinimal} />)

            const header = document.querySelector('.job-header')
            expect(header).toBeInTheDocument()

            // Check date section should not exist
            const dateSection = header?.querySelector('.job-date')
            expect(dateSection).not.toBeInTheDocument()
        })

        it('handles comma placement correctly with role and company', () => {
            render(<ExperienceSection data={mockExperienceDataComplete} />)

            const titleSection = document.querySelector('.job-title')
            expect(titleSection).toHaveTextContent('Senior Software Engineer (Full-time), Google Inc., Mountain View, CA')
        })

        it('handles comma placement correctly with company only', () => {
            render(<ExperienceSection data={mockExperienceDataMinimal} />)

            const titleSection = document.querySelector('.job-title')
            expect(titleSection).toHaveTextContent('Apple Inc.')
            expect(titleSection?.textContent).not.toContain(',')
        })
    })

    describe('Job Description', () => {
        it('renders the description with HTML content', () => {
            render(<ExperienceSection data={mockExperienceDataComplete} />)

            const descriptionElement = document.querySelector('.job-details')
            expect(descriptionElement).toBeInTheDocument()
            expect(descriptionElement?.innerHTML).toContain('<p>Led development of scalable web applications')
            expect(descriptionElement?.innerHTML).toContain('improved team productivity')
        })

        it('does not render description when not provided', () => {
            render(<ExperienceSection data={mockExperienceDataMinimal} />)

            const descriptionElement = document.querySelector('.job-details')
            expect(descriptionElement).not.toBeInTheDocument()
        })

        it('handles empty description HTML gracefully', () => {
            const dataWithEmptyDescription = {
                ...mockExperienceDataComplete,
                description: {
                    hasDescription: true,
                    sanitizedHtml: ''
                }
            }

            render(<ExperienceSection data={dataWithEmptyDescription} />)

            const descriptionElement = document.querySelector('.job-details')
            expect(descriptionElement).toBeInTheDocument()
            expect(descriptionElement?.innerHTML).toBe('')
        })

        it('renders complex HTML in description', () => {
            const dataWithComplexHTML = {
                ...mockExperienceDataComplete,
                description: {
                    hasDescription: true,
                    sanitizedHtml: '<p><strong>Key Achievements:</strong></p><ul><li>Increased performance by 50%</li><li>Led team of 8 developers</li></ul>'
                }
            }

            render(<ExperienceSection data={dataWithComplexHTML} />)

            const descriptionElement = document.querySelector('.job-details')
            expect(descriptionElement).toBeInTheDocument()
            expect(descriptionElement?.innerHTML).toContain('<strong>Key Achievements:</strong>')
            expect(descriptionElement?.innerHTML).toContain('<ul>')
            expect(descriptionElement?.innerHTML).toContain('<li>Increased performance by 50%</li>')
        })

        it('handles undefined sanitizedHtml when hasDescription is true', () => {
            const dataWithUndefinedHTML = {
                ...mockExperienceDataComplete,
                description: {
                    hasDescription: true,
                    sanitizedHtml: undefined
                }
            }

            render(<ExperienceSection data={dataWithUndefinedHTML} />)

            const descriptionElement = document.querySelector('.job-details')
            expect(descriptionElement).toBeInTheDocument()
            expect(descriptionElement?.innerHTML).toBe('')
        })
    })

    describe('Styling and Classes', () => {
        it('applies Charter font class to main container', () => {
            render(<ExperienceSection data={mockExperienceDataComplete} />)

            const container = document.querySelector('.charter-font')
            expect(container).toBeInTheDocument()
            expect(container).toHaveClass('charter-font')
        })

        it('applies experience-item class to main container', () => {
            render(<ExperienceSection data={mockExperienceDataComplete} />)

            const container = document.querySelector('.experience-item')
            expect(container).toBeInTheDocument()
        })

        it('applies margin-top class when spacing.marginTop is true', () => {
            render(<ExperienceSection data={mockExperienceDataComplete} />)

            const container = document.querySelector('.experience-item')
            expect(container).toHaveClass('mt-2')
        })

        it('does not apply margin-top class when spacing.marginTop is false', () => {
            render(<ExperienceSection data={mockExperienceDataMinimal} />)

            const container = document.querySelector('.experience-item')
            expect(container).not.toHaveClass('mt-2')
        })

        it('applies correct CSS classes to elements', () => {
            render(<ExperienceSection data={mockExperienceDataComplete} />)

            // Check header class
            const header = document.querySelector('.job-header')
            expect(header).toBeInTheDocument()

            // Check title class
            const title = document.querySelector('.job-title')
            expect(title).toBeInTheDocument()

            // Check bold title class
            const boldTitle = document.querySelector('.title-bold')
            expect(boldTitle).toBeInTheDocument()

            // Check date class
            const date = document.querySelector('.job-date')
            expect(date).toBeInTheDocument()

            // Check details class
            const details = document.querySelector('.job-details')
            expect(details).toBeInTheDocument()
        })
    })

    describe('Edge Cases', () => {
        it('handles role title with special characters', () => {
            const dataWithSpecialChars = {
                ...mockExperienceDataComplete,
                role: {
                    hasRole: true,
                    title: 'Développeur Senior & Architecte',
                    employmentType: undefined,
                    formatted: 'Développeur Senior & Architecte'
                }
            }

            render(<ExperienceSection data={dataWithSpecialChars} />)

            expect(screen.getByText('Développeur Senior & Architecte')).toBeInTheDocument()
        })

        it('handles very long role titles and company names', () => {
            const dataWithLongNames = {
                ...mockExperienceDataComplete,
                role: {
                    hasRole: true,
                    title: 'Senior Principal Software Development Engineer and Technical Lead',
                    employmentType: 'Full-time',
                    formatted: 'Senior Principal Software Development Engineer and Technical Lead (Full-time)'
                },
                company: {
                    hasCompany: true,
                    name: 'International Business Machines Corporation (IBM)',
                    location: 'New York, NY',
                    formatted: 'International Business Machines Corporation (IBM), New York, NY'
                }
            }

            render(<ExperienceSection data={dataWithLongNames} />)

            expect(screen.getByText('Senior Principal Software Development Engineer and Technical Lead (Full-time)')).toBeInTheDocument()
            expect(screen.getByText(/International Business Machines Corporation \(IBM\), New York, NY/)).toBeInTheDocument()
        })

        it('handles company name with special characters', () => {
            const dataWithSpecialCompany = {
                ...mockExperienceDataComplete,
                company: {
                    hasCompany: true,
                    name: 'Société Générale & Co.',
                    location: 'Paris, France',
                    formatted: 'Société Générale & Co., Paris, France'
                }
            }

            render(<ExperienceSection data={dataWithSpecialCompany} />)

            expect(screen.getByText(/Société Générale & Co\., Paris, France/)).toBeInTheDocument()
        })

        it('handles all optional fields being undefined', () => {
            const dataAllUndefined: ExperienceData = {
                role: {
                    hasRole: false,
                    title: undefined,
                    employmentType: undefined,
                    formatted: ''
                },
                company: {
                    hasCompany: true,
                    name: 'Basic Company',
                    location: undefined,
                    formatted: 'Basic Company'
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

            render(<ExperienceSection data={dataAllUndefined} />)

            // Should only render company name
            expect(screen.getByText('Basic Company')).toBeInTheDocument()

            // Should not render other elements
            expect(document.querySelector('.job-date')).not.toBeInTheDocument()
            expect(document.querySelector('.job-details')).not.toBeInTheDocument()
            expect(document.querySelector('.title-bold')).not.toBeInTheDocument()
        })

        it('handles role without employment type', () => {
            const dataRoleNoEmploymentType = {
                ...mockExperienceDataComplete,
                role: {
                    hasRole: true,
                    title: 'Software Engineer',
                    employmentType: undefined,
                    formatted: 'Software Engineer'
                }
            }

            render(<ExperienceSection data={dataRoleNoEmploymentType} />)

            expect(screen.getByText('Software Engineer')).toBeInTheDocument()
            expect(screen.queryByText('(Full-time)')).not.toBeInTheDocument()
        })

        it('handles company without location', () => {
            const dataCompanyNoLocation = {
                ...mockExperienceDataComplete,
                company: {
                    hasCompany: true,
                    name: 'Remote Company',
                    location: undefined,
                    formatted: 'Remote Company'
                }
            }

            render(<ExperienceSection data={dataCompanyNoLocation} />)

            expect(screen.getByText(/Remote Company/)).toBeInTheDocument()
            expect(screen.queryByText('Mountain View, CA')).not.toBeInTheDocument()
        })
    })
})
