import React from 'react'
import {render, screen} from '@testing-library/react'
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import PersonalInfoSection from '../PersonalInfoSection'
import {PersonalInfoData} from '@/components/resume/controllers/PersonalInfoController'

// --- Mock Data ---
const mockPersonalInfoData: PersonalInfoData = {
	name: {
		first: 'Jane',
		last: 'Smith',
		full: 'Dr. Jane Smith'
	},
	contact: {
		email: 'jane.smith@example.com',
		phone: '+1 (555) 123-4567',
		website: 'https://drjanesmith.com'
	},
	location: {
		hasLocation: true,
		address: '456 Oak Ave',
		city: 'Boston',
		postal: '02101',
		country: 'United States',
		formatted: 'Boston, MA, United States'
	},
	dateOfBirth: {
		hasDate: true,
		formatted: '5/15/1985'
	},
	profile: {
		hasProfile: true,
		sanitizedText: '<p>Experienced cardiologist with over 10 years of practice in leading medical institutions.</p>'
	}
}

const mockPersonalInfoDataMinimal: PersonalInfoData = {
	name: {
		first: 'John',
		last: 'Doe',
		full: 'John Doe'
	},
	contact: {
		email: undefined,
		phone: undefined,
		website: undefined
	},
	location: {
		hasLocation: false,
		formatted: ''
	},
	dateOfBirth: {
		hasDate: false
	},
	profile: {
		hasProfile: false,
		sanitizedText: undefined
	}
}

const mockPersonalInfoDataPartial: PersonalInfoData = {
	name: {
		first: 'Alice',
		last: 'Johnson',
		full: 'Alice Johnson'
	},
	contact: {
		email: 'alice@example.com',
		phone: undefined,
		website: 'https://alicejohnson.dev'
	},
	location: {
		hasLocation: true,
		formatted: 'San Francisco, CA'
	},
	dateOfBirth: {
		hasDate: false
	},
	profile: {
		hasProfile: false,
		sanitizedText: undefined
	}
}

// --- Mocks ---
vi.mock('@/components/resume/themes/DEFAULT_THEME/fonts', () => ({
	charter: {
		className: 'charter-font'
	}
}))

vi.mock('@/components/resume/themes/DEFAULT_THEME/fontawesome', () => ({}))

vi.mock('@fortawesome/react-fontawesome', () => ({
	FontAwesomeIcon: ({icon, ...props}: any) => (
		<span data-testid="font-awesome-icon" data-icon={icon.iconName} {...props}>
			{icon.iconName}
		</span>
	)
}))

vi.mock('@fortawesome/free-solid-svg-icons', () => ({
	faEnvelope: {iconName: 'envelope'},
	faGlobe: {iconName: 'globe'},
	faPhoneFlip: {iconName: 'phone-flip'}
}))

// --- Tests ---
describe('PersonalInfoSection', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	afterEach(() => {
		vi.clearAllMocks()
	})

	describe('Component Rendering', () => {
		it('renders the personal info section with complete data', () => {
			render(<PersonalInfoSection data={mockPersonalInfoData} />)

			// Check main container
			const container = document.querySelector('.charter-font')
			expect(container).toBeInTheDocument()
			expect(container).toHaveClass('charter-font')

			// Check name
			expect(screen.getByText('Dr. Jane Smith')).toBeInTheDocument()

			// Check contact info
			expect(screen.getByText('jane.smith@example.com')).toBeInTheDocument()
			expect(screen.getByText('+1 (555) 123-4567')).toBeInTheDocument()

			// Check location
			expect(screen.getByText('Boston, MA, United States')).toBeInTheDocument()

			// Check website
			expect(screen.getByText('https://drjanesmith.com')).toBeInTheDocument()

			// Check profile section
			expect(screen.getByText('Profile')).toBeInTheDocument()
		})

		it('renders with minimal data', () => {
			render(<PersonalInfoSection data={mockPersonalInfoDataMinimal} />)

			// Should render name
			expect(screen.getByText('John Doe')).toBeInTheDocument()

			// Should not render contact info when not provided
			expect(screen.queryByText('jane.smith@example.com')).not.toBeInTheDocument()
			expect(screen.queryByText('+1 (555) 123-4567')).not.toBeInTheDocument()

			// Should not render location when hasLocation is false
			expect(screen.queryByText('Boston, MA, United States')).not.toBeInTheDocument()

			// Should not render website when not provided
			expect(screen.queryByText('https://drjanesmith.com')).not.toBeInTheDocument()

			// Should not render profile section when hasProfile is false
			expect(screen.queryByText('Profile')).not.toBeInTheDocument()
		})

		it('renders with partial data', () => {
			render(<PersonalInfoSection data={mockPersonalInfoDataPartial} />)

			// Should render name
			expect(screen.getByText('Alice Johnson')).toBeInTheDocument()

			// Should render email but not phone
			expect(screen.getByText('alice@example.com')).toBeInTheDocument()
			expect(screen.queryByText('+1 (555) 123-4567')).not.toBeInTheDocument()

			// Should render location
			expect(screen.getByText('San Francisco, CA')).toBeInTheDocument()

			// Should render website
			expect(screen.getByText('https://alicejohnson.dev')).toBeInTheDocument()

			// Should not render profile section
			expect(screen.queryByText('Profile')).not.toBeInTheDocument()
		})
	})

	describe('Header Section', () => {
		it('renders the header with correct structure', () => {
			render(<PersonalInfoSection data={mockPersonalInfoData} />)

			const header = screen.getByText('Dr. Jane Smith').closest('.header')
			expect(header).toBeInTheDocument()

			// Check name section
			const nameSection = screen.getByText('Dr. Jane Smith').closest('.name')
			expect(nameSection).toBeInTheDocument()

			// Check contact info section
			const contactInfo = header?.querySelector('.contact-info')
			expect(contactInfo).toBeInTheDocument()
		})

		it('renders name correctly', () => {
			render(<PersonalInfoSection data={mockPersonalInfoData} />)

			const nameElement = screen.getByText('Dr. Jane Smith')
			expect(nameElement).toBeInTheDocument()
			expect(nameElement.closest('.name')).toBeInTheDocument()
		})
	})

	describe('Contact Information', () => {
		it('renders all contact information with icons', () => {
			render(<PersonalInfoSection data={mockPersonalInfoData} />)

			// Check email with icon
			expect(screen.getByText('jane.smith@example.com')).toBeInTheDocument()
			const emailIcons = screen.getAllByTestId('font-awesome-icon')
			const emailIcon = emailIcons.find(icon => icon.getAttribute('data-icon') === 'envelope')
			expect(emailIcon).toBeInTheDocument()

			// Check phone with icon
			expect(screen.getByText('+1 (555) 123-4567')).toBeInTheDocument()
			const phoneIcon = emailIcons.find(icon => icon.getAttribute('data-icon') === 'phone-flip')
			expect(phoneIcon).toBeInTheDocument()

			// Check location with icon
			expect(screen.getByText('Boston, MA, United States')).toBeInTheDocument()
			const globeIcons = emailIcons.filter(icon => icon.getAttribute('data-icon') === 'globe')
			expect(globeIcons.length).toBeGreaterThan(0)
		})

		it('renders info separators correctly', () => {
			render(<PersonalInfoSection data={mockPersonalInfoData} />)

			const separators = screen.getAllByText('|')
			expect(separators.length).toBeGreaterThan(0)

			separators.forEach(separator => {
				expect(separator).toHaveClass('info-separator')
			})
		})

		it('handles missing email gracefully', () => {
			const dataWithoutEmail = {
				...mockPersonalInfoData,
				contact: {
					...mockPersonalInfoData.contact,
					email: undefined
				}
			}

			render(<PersonalInfoSection data={dataWithoutEmail} />)

			expect(screen.queryByText('jane.smith@example.com')).not.toBeInTheDocument()
			expect(screen.getByText('+1 (555) 123-4567')).toBeInTheDocument()
		})

		it('handles missing phone gracefully', () => {
			const dataWithoutPhone = {
				...mockPersonalInfoData,
				contact: {
					...mockPersonalInfoData.contact,
					phone: undefined
				}
			}

			render(<PersonalInfoSection data={dataWithoutPhone} />)

			expect(screen.getByText('jane.smith@example.com')).toBeInTheDocument()
			expect(screen.queryByText('+1 (555) 123-4567')).not.toBeInTheDocument()
		})

		it('handles missing location gracefully', () => {
			const dataWithoutLocation = {
				...mockPersonalInfoData,
				location: {
					hasLocation: false,
					formatted: ''
				}
			}

			render(<PersonalInfoSection data={dataWithoutLocation} />)

			expect(screen.queryByText('Boston, MA, United States')).not.toBeInTheDocument()
			expect(screen.getByText('jane.smith@example.com')).toBeInTheDocument()
		})
	})

	describe('Social Information', () => {
		it('renders website in social info section', () => {
			render(<PersonalInfoSection data={mockPersonalInfoData} />)

			const socialInfo = screen.getByText('https://drjanesmith.com').closest('.social-info')
			expect(socialInfo).toBeInTheDocument()

			// Check website with globe icon
			expect(screen.getByText('https://drjanesmith.com')).toBeInTheDocument()
			const icons = screen.getAllByTestId('font-awesome-icon')
			const globeIcon = icons.find(icon => icon.getAttribute('data-icon') === 'globe')
			expect(globeIcon).toBeInTheDocument()
		})

		it('does not render social info section when website is missing', () => {
			const dataWithoutWebsite = {
				...mockPersonalInfoData,
				contact: {
					...mockPersonalInfoData.contact,
					website: undefined
				}
			}

			render(<PersonalInfoSection data={dataWithoutWebsite} />)

			expect(screen.queryByText('https://drjanesmith.com')).not.toBeInTheDocument()
			const container = screen.getByText('Dr. Jane Smith').closest('div')
			expect(container?.querySelector('.social-info')).not.toBeInTheDocument()
		})
	})

	describe('Profile Section', () => {
		it('renders profile section when hasProfile is true', () => {
			render(<PersonalInfoSection data={mockPersonalInfoData} />)

			// Check section header
			expect(screen.getByText('Profile')).toBeInTheDocument()
			const sectionHeader = screen.getByText('Profile')
			expect(sectionHeader).toHaveClass('section-header')

			// Check section container
			const section = sectionHeader.closest('.section')
			expect(section).toBeInTheDocument()

			// Check profile text with HTML content
			const profileText = section?.querySelector('.profile-text')
			expect(profileText).toBeInTheDocument()
			expect(profileText?.innerHTML).toContain('Experienced cardiologist')
		})

		it('does not render profile section when hasProfile is false', () => {
			render(<PersonalInfoSection data={mockPersonalInfoDataMinimal} />)

			expect(screen.queryByText('Profile')).not.toBeInTheDocument()
			const container = screen.getByText('John Doe').closest('div')
			expect(container?.querySelector('.section')).not.toBeInTheDocument()
		})

		it('renders sanitized HTML content safely', () => {
			const dataWithHTMLProfile = {
				...mockPersonalInfoData,
				profile: {
					hasProfile: true,
					sanitizedText: '<p><strong>Senior</strong> cardiologist with <em>extensive</em> experience.</p>'
				}
			}

			render(<PersonalInfoSection data={dataWithHTMLProfile} />)

			const profileText = screen.getByText('Profile').closest('.section')?.querySelector('.profile-text')
			expect(profileText).toBeInTheDocument()
			expect(profileText?.innerHTML).toContain('<strong>Senior</strong>')
			expect(profileText?.innerHTML).toContain('<em>extensive</em>')
		})

		it('handles empty profile text gracefully', () => {
			const dataWithEmptyProfile = {
				...mockPersonalInfoData,
				profile: {
					hasProfile: true,
					sanitizedText: ''
				}
			}

			render(<PersonalInfoSection data={dataWithEmptyProfile} />)

			expect(screen.getByText('Profile')).toBeInTheDocument()
			const profileText = screen.getByText('Profile').closest('.section')?.querySelector('.profile-text')
			expect(profileText).toBeInTheDocument()
			expect(profileText?.innerHTML).toBe('')
		})

		it('handles null profile text gracefully', () => {
			const dataWithNullProfile = {
				...mockPersonalInfoData,
				profile: {
					hasProfile: true,
					sanitizedText: undefined
				}
			}

			render(<PersonalInfoSection data={dataWithNullProfile} />)

			expect(screen.getByText('Profile')).toBeInTheDocument()
			const profileText = screen.getByText('Profile').closest('.section')?.querySelector('.profile-text')
			expect(profileText).toBeInTheDocument()
			expect(profileText?.innerHTML).toBe('')
		})
	})

	describe('Styling and Classes', () => {
		it('applies Charter font class to main container', () => {
			render(<PersonalInfoSection data={mockPersonalInfoData} />)

			const container = document.querySelector('.charter-font')
			expect(container).toBeInTheDocument()
			expect(container).toHaveClass('charter-font')
		})

		it('applies correct CSS classes to elements', () => {
			render(<PersonalInfoSection data={mockPersonalInfoData} />)

			// Check header class
			const header = screen.getByText('Dr. Jane Smith').closest('.header')
			expect(header).toBeInTheDocument()

			// Check name class
			const name = screen.getByText('Dr. Jane Smith').closest('.name')
			expect(name).toBeInTheDocument()

			// Check contact-info class
			const contactInfo = header?.querySelector('.contact-info')
			expect(contactInfo).toBeInTheDocument()

			// Check social-info class
			const socialInfo = screen.getByText('https://drjanesmith.com').closest('.social-info')
			expect(socialInfo).toBeInTheDocument()

			// Check section classes
			const section = screen.getByText('Profile').closest('.section')
			expect(section).toBeInTheDocument()

			const sectionHeader = screen.getByText('Profile')
			expect(sectionHeader).toHaveClass('section-header')

			const profileText = section?.querySelector('.profile-text')
			expect(profileText).toBeInTheDocument()
		})
	})

	describe('FontAwesome Icons', () => {
		it('renders correct icons for each contact type', () => {
			render(<PersonalInfoSection data={mockPersonalInfoData} />)

			const icons = screen.getAllByTestId('font-awesome-icon')

			// Check for envelope icon (email)
			const envelopeIcon = icons.find(icon => icon.getAttribute('data-icon') === 'envelope')
			expect(envelopeIcon).toBeInTheDocument()

			// Check for phone-flip icon (phone)
			const phoneIcon = icons.find(icon => icon.getAttribute('data-icon') === 'phone-flip')
			expect(phoneIcon).toBeInTheDocument()

			// Check for globe icons (location and website)
			const globeIcons = icons.filter(icon => icon.getAttribute('data-icon') === 'globe')
			expect(globeIcons.length).toBe(2) // One for location, one for website
		})

		it('does not render icons when corresponding data is missing', () => {
			render(<PersonalInfoSection data={mockPersonalInfoDataMinimal} />)

			const icons = screen.queryAllByTestId('font-awesome-icon')
			expect(icons.length).toBe(0)
		})
	})

	describe('Data Structure Handling', () => {
		it('handles complex name structures', () => {
			const dataWithComplexName = {
				...mockPersonalInfoData,
				name: {
					first: 'Maria',
					last: 'Elena',
					full: 'Prof. Dr. Maria Elena Rodriguez-Smith, PhD, MD'
				}
			}

			render(<PersonalInfoSection data={dataWithComplexName} />)

			expect(screen.getByText('Prof. Dr. Maria Elena Rodriguez-Smith, PhD, MD')).toBeInTheDocument()
		})

		it('handles international phone numbers', () => {
			const dataWithIntlPhone = {
				...mockPersonalInfoData,
				contact: {
					...mockPersonalInfoData.contact,
					phone: '+44 20 7946 0958'
				}
			}

			render(<PersonalInfoSection data={dataWithIntlPhone} />)

			expect(screen.getByText('+44 20 7946 0958')).toBeInTheDocument()
		})

		it('handles long location strings', () => {
			const dataWithLongLocation = {
				...mockPersonalInfoData,
				location: {
					hasLocation: true,
					formatted: 'San Francisco Bay Area, California, United States of America'
				}
			}

			render(<PersonalInfoSection data={dataWithLongLocation} />)

			expect(screen.getByText('San Francisco Bay Area, California, United States of America')).toBeInTheDocument()
		})
	})
})
