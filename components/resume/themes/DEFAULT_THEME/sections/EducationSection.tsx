'use client'

import {useRef, useState, useEffect, useCallback} from 'react'
import {charter} from '@/components/resume/themes/DEFAULT_THEME/fonts'
import {EducationData, EducationDates} from '@/components/resume/controllers/EducationController'
import {Loader2Icon, CheckIcon, RotateCcwIcon, PlusIcon, GraduationCapIcon} from 'lucide-react'
import {debounce} from 'lodash'
import {cn} from '@/lib/utils'
import {useUpdateEducationMutation} from '@/lib/education/mutations'
import {toast} from 'sonner'
import {useQueryClient} from '@tanstack/react-query'
import {educationOptions} from '@/lib/education/queries'
import {Button} from '@/components/ui/button'

import DateMonthSelector, {formatDateRange} from '@/components/resume/editors/shared/DateMonthSelector'
import {Badge} from '@/components/ui/badge'
import {useResumeHighlight} from '@/components/resume/contexts/ResumeHighlightContext'
import SaveIndicator from './SaveIndicator'
import {AnimatePresence, motion} from 'motion/react'
import SectionAction from './SectionAction'

interface EducationMutation {
	institution_name: string
	field_of_study: string
	country: string
	current: boolean
	degree?: string | null
	started_from_month?: string | null
	started_from_year?: string | null
	finished_at_month?: string | null
	finished_at_year?: string | null
	description?: string | null
}

const EducationSection = ({data}: { data: EducationData }) => {
	const [isEditing, setIsEditing] = useState(false)
	const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
	const [educationDate, setEducationDate] = useState<EducationDates>(data.dates)
	const [isSaving, setIsSaving] = useState(false)

	const {setHighlightedItem} = useResumeHighlight()

	// Track individual field changes
	const [institutionName, setInstitutionName] = useState(data.institution.name || '')
	const [degree, setDegree] = useState(data.degree.formatted || '')
	const [description, setDescription] = useState(data.description.sanitizedHtml || '')

	const queryClient = useQueryClient()

	const {mutateAsync: updateEducation, isPending: isUpdating} = useUpdateEducationMutation({
		onSuccess: () => {
			setHasUnsavedChanges(false)
			setIsSaving(false)
			toast.success('Education saved successfully', {
				icon: <CheckIcon className="h-4 w-4" />,
				duration: 2000
			})
		},
		onError: (error) => {
			setIsSaving(false)
			toast.error('Failed to save education changes', {
				description: 'Please try again or check your connection',
				duration: 4000
			})
		}
	})

	const institutionRef = useRef<HTMLSpanElement>(null)
	const degreeRef = useRef<HTMLSpanElement>(null)
	const descriptionRef = useRef<HTMLDivElement>(null)

	// Debounced save function
	const debouncedSave = useCallback(
		debounce(async (saveData: EducationMutation) => {
			if (!hasUnsavedChanges) return

			setIsSaving(true)
			try {
				await updateEducation({
					id: data.educationId,
					data: saveData
				})
			} catch (error) {
				toast.error('Failed to save education changes', {
					description: 'Please try again or check your connection',
					duration: 4000
				})
				// console.error('Auto-save failed:', error)
			}
		}, 2000),
		[hasUnsavedChanges, updateEducation, data.educationId]
	)

	// Add click outside handler to stop editing
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			const target = event.target as Node
			const isInsideComponent = institutionRef.current?.contains(target) ||
									degreeRef.current?.contains(target) ||
									descriptionRef.current?.contains(target)

			if (!isInsideComponent && isEditing) {
				setIsEditing(false)
				setHighlightedItem(null)
			}
		}

		if (isEditing) {
			document.addEventListener('mousedown', handleClickOutside)
			return () => document.removeEventListener('mousedown', handleClickOutside)
		}
	}, [isEditing, setHighlightedItem])
	useEffect(() => {
		if (!isEditing || !hasUnsavedChanges) return

		const saveData: Partial<EducationMutation> = {
			institution_name: institutionName,
			degree: degree,
			description: description,
			// Map dates to the expected format
			started_from_month: educationDate.startMonth?.toString(),
			started_from_year: educationDate.startYear?.toString(),
			finished_at_month: educationDate.endMonth?.toString(),
			finished_at_year: educationDate.endYear?.toString(),
			current: educationDate.current || false
		}

		debouncedSave(saveData as EducationMutation)

		return () => {
			debouncedSave.cancel()
		}
	}, [
		institutionName,
		degree,
		description,
		educationDate,
		isEditing,
		hasUnsavedChanges,
		debouncedSave
	])

	const handleContentChange = useCallback((field: 'institution' | 'degree' | 'description') => {
		setHasUnsavedChanges(true)

		switch (field) {
		case 'institution':
			const instValue = institutionRef.current?.innerText || ''
			setInstitutionName(instValue)
			break
		case 'degree':
			const degreeValue = degreeRef.current?.innerText || ''
			setDegree(degreeValue)
			break
		case 'description':
			const descValue = descriptionRef.current?.innerHTML || ''
			setDescription(descValue)
			break
		}
	}, [])

	const handleDateChange = useCallback((dates: EducationDates) => {
		setEducationDate(dates)
		setHasUnsavedChanges(true)
	}, [])

	const handleReset = useCallback(() => {
		// Cancel any pending saves
		debouncedSave.cancel()

		// Reset to original data values
		const originalInstitution = data.institution.name || ''
		const originalDegree = data.degree.formatted || ''
		const originalDescription = data.description.sanitizedHtml || ''

		// Reset DOM elements to original values
		if (institutionRef.current) {
			institutionRef.current.innerText = originalInstitution
		}
		if (degreeRef.current) {
			degreeRef.current.innerText = originalDegree
		}
		if (descriptionRef.current) {
			descriptionRef.current.innerHTML = originalDescription
		}

		// Reset state to original values
		setInstitutionName(originalInstitution)
		setDegree(originalDegree)
		setDescription(originalDescription)
		setEducationDate(data.dates)
		setHasUnsavedChanges(false)
		setIsSaving(false)

		toast.success('Changes reverted to saved version', {
			icon: <RotateCcwIcon className="h-4 w-4" />,
			duration: 2000
		})
	}, [data, debouncedSave])

	const handleStartEdit = useCallback(() => {
		setIsEditing(true)
		setHighlightedItem({
			type: 'education',
			id: data.educationId
		})
	}, [data.educationId, setHighlightedItem])

	const handleStopEdit = useCallback(() => {
		/*
		 * Don't immediately stop editing, let it persist for better UX
		 * Only stop when user clicks outside or after a delay
		 */
		setTimeout(() => {
			setIsEditing(false)
			setHighlightedItem(null)
		}, 150)
	}, [setHighlightedItem])

	const handleManualSave = async () => {
		if (!hasUnsavedChanges) return

		// Cancel debounced save and save immediately
		debouncedSave.cancel()
		setIsSaving(true)

		try {
			const saveData: EducationMutation = {
				institution_name: institutionName,
				degree: degree,
				description: description,
				started_from_month: educationDate.startMonth?.toString(),
				started_from_year: educationDate.startYear?.toString(),
				finished_at_month: educationDate.endMonth?.toString(),
				finished_at_year: educationDate.endYear?.toString(),
				current: educationDate.current || false,
				country: 'IND',
				field_of_study: 'Computer Science'
			}

			await updateEducation({
				id: data.educationId,
				// @ts-ignore
				data: saveData
			})
		} catch (error) {
			// console.error('Manual save failed:', error)
			toast.error('Failed to save education changes', {
				description: 'Please try again or check your connection',
				duration: 4000
			})
		}
	}

	// Handle focus events for placeholders
	const handleFocus = useCallback((field: 'institution' | 'degree' | 'description') => {
		handleStartEdit()

		// Clear placeholder text on focus if field is empty
		setTimeout(() => {
			switch (field) {
			case 'institution':
				if (institutionRef.current && !institutionName && institutionRef.current.innerText.includes('Institution name')) {
					institutionRef.current.innerText = ''
				}
				break
			case 'degree':
				if (degreeRef.current && !degree && degreeRef.current.innerText.includes('Degree')) {
					degreeRef.current.innerText = ''
				}
				break
			case 'description':
				if (descriptionRef.current && !description && descriptionRef.current.innerHTML.includes('Describe your education')) {
					descriptionRef.current.innerHTML = ''
				}
				break
			}
		}, 0)
	}, [institutionName, degree, description, handleStartEdit])

	const handleBlur = useCallback((field: 'institution' | 'degree' | 'description') => {
		// Don't immediately stop editing - let user move between fields

		// Restore placeholder if field is empty
		setTimeout(() => {
			switch (field) {
			case 'institution':
				if (institutionRef.current && !institutionName.trim()) {
					institutionRef.current.innerText = data.institution.name || 'Institution name'
				}
				break
			case 'degree':
				if (degreeRef.current && !degree.trim()) {
					degreeRef.current.innerText = data.degree.formatted || 'Degree'
				}
				break
			case 'description':
				if (descriptionRef.current && !description.trim()) {
					descriptionRef.current.innerHTML = data.description.sanitizedHtml || 'Describe your education, achievements, relevant coursework, honors, or other academic accomplishments...'
				}
				break
			}
		}, 100)
	}, [institutionName, degree, description, data])

	// Check if this is an empty education entry
	const isEmpty = !data.institution.name && !data.degree.formatted && !data.description.sanitizedHtml
	const hasAnyContent = institutionName.trim() || degree.trim() || description.trim()

	if (isEmpty && !isEditing) {
		return (
			<motion.div
				initial={{opacity: 0, y: 20}}
				animate={{opacity: 1, y: 0}}
				className="relative group border-2 border-dashed border-gray-200 rounded-xl p-8 hover:border-blue-300 hover:bg-blue-50/30 transition-all duration-200 cursor-pointer"
				onClick={handleStartEdit}
			>
				<div className="text-center">
					<div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 mb-4">
						<GraduationCapIcon className="h-8 w-8 text-blue-600" />
					</div>
					<h3 className="text-lg font-semibold text-gray-900 mb-2">Add Education</h3>
					<p className="text-sm text-gray-600 mb-4 max-w-sm mx-auto">
						Showcase your educational background, degrees, and academic achievements
					</p>
					<Button
						variant="outline"
						size="sm"
						className="text-sm font-medium hover:bg-blue-50 hover:border-blue-300"
					>
						<PlusIcon className="h-4 w-4 mr-2" />
						Add Education
					</Button>
				</div>
			</motion.div>
		)
	}

	return (
		<motion.div
			initial={{opacity: 0}}
			animate={{opacity: 1}}
			className={cn('relative group transition-all duration-200 border-2 border-transparent',
				isEditing && 'border-2 border-dashed border-gray-200 rounded-none hover:border-flame-300 hover:bg-flame-50/30 transition-all duration-200 cursor-pointer')}
		>
			{/* Action Buttons */}
			<AnimatePresence mode="wait">
				{isEditing && (
					<SectionAction
						sectionType="education"
						isEditing={isEditing}
						isUpdating={isUpdating || isSaving}
						isSaving={isSaving}
						hasUnsavedChanges={hasUnsavedChanges}
					/>
				)}
			</AnimatePresence>


			<div className={cn(
				`${charter.className} education-item ${data.spacing.marginTop ? 'mt-2' : ''}`,
				'hover:bg-gray-50/50 rounded-lg transition-all duration-200'
			)}>
				<div className="education-header flex justify-between items-start">
					<div className="education-title flex-1">
						{/* Institution Name */}
						<span
							ref={institutionRef}
							contentEditable={true}
							suppressContentEditableWarning
							className={cn(
								'font-semibold outline-none rounded-md px-2 py-1 cursor-text transition-all duration-200',
								(!institutionName && !data.institution.name) && 'text-gray-400 italic',
							)}
							onFocus={() => handleFocus('institution')}
							onBlur={() => handleBlur('institution')}
							onInput={() => handleContentChange('institution')}
						>
							{data.institution.name || 'Institution name'}
						</span>

						{/* Separator - only show if both fields have content */}
						{((institutionName.trim() || data.institution.name) && (degree.trim() || data.degree.formatted)) && (
							<span className="text-gray-600 mx-1">,</span>
						)}

						{/* Degree */}
						<span
							ref={degreeRef}
							contentEditable={true}
							suppressContentEditableWarning
							className={cn(
								'outline-none rounded-md px-2 py-1 cursor-text transition-all duration-200',
								(!degree && !data.degree.formatted) && 'text-gray-400 italic',

							)}
							onFocus={() => handleFocus('degree')}
							onBlur={() => handleBlur('degree')}
							onInput={() => handleContentChange('degree')}
						>
							{data.degree.formatted || 'Degree'}
						</span>
					</div>

					{/* Date Selector */}
					<DateMonthSelector
						title="Education Duration"
						description="Set the duration for your education."
						value={educationDate}
						onChange={handleDateChange}
					>
						<span className={cn(
							'education-date cursor-pointer hover:text-flame-600 border-b border-dashed border-transparent hover:border-flame-400 transition-all duration-200 px-2 py-1 rounded text-sm',
							!educationDate.hasDates && 'text-gray-400',
						)}>
							{educationDate.hasDates
								? formatDateRange(educationDate)
								: 'Add dates'
							}
						</span>
					</DateMonthSelector>
				</div>

				{/* Description */}
				<div
					ref={descriptionRef}
					contentEditable={true}
					className={cn(
						'education-details prose prose-sm max-w-none outline-none rounded-md px-3 py-2 min-h-[3rem] cursor-text mt-3 transition-all duration-200',
						(!description && !data.description.sanitizedHtml) && 'text-gray-400 italic',
					)}
					dangerouslySetInnerHTML={{
						__html: data.description.sanitizedHtml || 'Describe your education, achievements, relevant coursework, honors, or other academic accomplishments...'
					}}
					onFocus={() => handleFocus('description')}
					onBlur={() => handleBlur('description')}
					onInput={() => handleContentChange('description')}
				/>

				{/* Empty state helper when editing */}
				{isEditing && !hasAnyContent && (
					<motion.div
						initial={{opacity: 0}}
						animate={{opacity: 1}}
						className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg"
					>
						<p className="text-sm text-blue-700 mb-2 font-medium">Getting started:</p>
						<ul className="text-xs text-blue-600 space-y-1">
							<li>• Add your institution name (e.g., "Stanford University")</li>
							<li>• Include your degree (e.g., "Bachelor of Science in Computer Science")</li>
							<li>• Set your education dates</li>
							<li>• Describe achievements, GPA, honors, or relevant coursework</li>
						</ul>
					</motion.div>
				)}
			</div>
		</motion.div>
	)
}

export default EducationSection
