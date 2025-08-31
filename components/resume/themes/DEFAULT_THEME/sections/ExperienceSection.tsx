
'use client'


import {AnimatePresence, motion} from 'motion/react'
import {charter} from '@/components/resume/themes/DEFAULT_THEME/fonts'
import {ExperienceData, ExperienceDates} from '@/components/resume/controllers/ExperienceController'
import {cn} from '@/lib/utils'
import {useCallback, useEffect, useRef, useState} from 'react'
import {useResumeHighlight} from '@/components/resume/contexts/ResumeHighlightContext'
import {useUpdateExperienceMutation} from '@/lib/experience/mutations'
import {toast} from 'sonner'
import {useQueryClient} from '@tanstack/react-query'
import {BriefcaseIcon, CheckIcon, PlusIcon} from 'lucide-react'
import {debounce, isEmpty} from 'lodash'
import SectionAction from './SectionAction'
import {Button} from '@/components/ui/button'
import {ExperienceMutation} from '@/lib/experience/types'
import DateMonthSelector, {formatDateRange} from '@/components/resume/editors/shared/DateMonthSelector'


const ExperienceSection = ({data}: { data: ExperienceData }) => {
	const [isEditing, setIsEditing] = useState(false)
	const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

	const [experienceDate, setExperienceDate] = useState<ExperienceDates>(data.dates)

	const [isSaving, setIsSaving] = useState(false)

	const {setHighlightedItem} = useResumeHighlight()


	// Track individual field changes
	const [role, setRole] = useState(data.role.formatted || '')
	const [company, setCompany] = useState(data.company.formatted || '')
	const [description, setDescription] = useState(data.description.sanitizedHtml || '')

	// references to the DOM elements
	const roleRef = useRef<HTMLSpanElement>(null)
	const companyRef = useRef<HTMLSpanElement>(null)
	const descriptionRef = useRef<HTMLDivElement>(null)

	const queryClient = useQueryClient()

	const {mutateAsync: updateExperience, isPending: isUpdating} = useUpdateExperienceMutation({
		onSuccess: () => {
			setHasUnsavedChanges(false)
			setIsSaving(false)
		},
		onError: (error) => {
			setIsSaving(false)
			toast.error('Failed to save experience changes', {
				description: 'Please try again or check your connection',
				duration: 4000
			})
		}
	})

	// Debounced save function
	const debouncedSave = useCallback(
		debounce(async (saveData: Partial<ExperienceMutation>) => {
			if (!hasUnsavedChanges) return
			setIsSaving(true)
			try {
				await updateExperience({id: data.id, data: saveData})
			} catch (error) {
				toast.error('Failed to save experience changes', {
					description: 'Please try again or check your connection',
					duration: 4000
				})
			}
		}, 1000),
		[hasUnsavedChanges, updateExperience, data.id]
	)


	const handleStartEdit = useCallback(() => {
		setIsEditing(true)
		setHighlightedItem({
			type: 'experience',
			id: data.id
		})
	}, [data.id, setHighlightedItem])

	// Add click outside handler to stop editing
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			const target = event.target as Node
			const isInsideComponent = roleRef.current?.contains(target) ||
									companyRef.current?.contains(target) ||
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


	// Handle focus events for placeholders
	const handleFocus = useCallback((field: 'role' | 'company' | 'description') => {
		handleStartEdit()

		// Clear placeholder text on focus if field is empty
		setTimeout(() => {
			switch (field) {
			case 'role':

				if (roleRef.current && !role && roleRef.current.innerText.includes('Role')) {
					roleRef.current.innerText = ''
				}
				break
			case 'company':
				if (companyRef.current && !company && companyRef.current.innerText.includes('Company')) {
					companyRef.current.innerText = ''
				}
				break
			case 'description':
				if (descriptionRef.current && !description && descriptionRef.current.innerHTML.includes('Describe your experience')) {
					descriptionRef.current.innerHTML = ''
				}
				break
			}
		}, 0)
	}, [role, company, description, handleStartEdit])


	const handleBlur = useCallback((field: 'role' | 'company' | 'description') => {
		// Don't immediately stop editing - let user move between fields

		// Restore placeholder if field is empty
		setTimeout(() => {
			switch (field) {
			case 'role':
				if (roleRef.current && !role.trim()) {
					roleRef.current.innerText = data.role.formatted || 'Role'
				}
				break
			case 'company':
				if (companyRef.current && !company.trim()) {
					companyRef.current.innerText = data.company.formatted || 'Company'
				}
				break
			case 'description':
				if (descriptionRef.current && !description.trim()) {
					descriptionRef.current.innerHTML = data.description.sanitizedHtml || 'Describe your experience'
				}
				break
			}
		}, 100)
	}, [role, company, description, data])

	const handleContentChange = useCallback((field: 'role' | 'company' | 'description') => {
		setHasUnsavedChanges(true)

		switch (field) {
		case 'role':
			const roleValue = roleRef.current?.innerText || ''
			setRole(roleValue)
			break
		case 'company':
			const companyValue = companyRef.current?.innerText || ''
			setCompany(companyValue)
			break
		case 'description':
			const descriptionValue = descriptionRef.current?.innerHTML || ''
			setDescription(descriptionValue)
			break
		}
	}, [])

	const handleExperienceDateChange = useCallback((dates: ExperienceDates) => {
		setExperienceDate(dates)
		setHasUnsavedChanges(true)
	}, [])


	// Handle saving changes
	useEffect(() => {
		if (!isEditing || !hasUnsavedChanges) return
		const saveData: Partial<ExperienceMutation> = {
			company_name: company,
			job_title: role,
			description: description
		}
		debouncedSave(saveData as ExperienceMutation)
		// console.log('saveData', saveData)


		return () => {
			debouncedSave.cancel()
		}
	}, [company, role, description, isEditing, hasUnsavedChanges, debouncedSave])


	// Check if this is an empty experience entry
	const isEmpty = !data.company.formatted && !data.role.formatted && !data.description.sanitizedHtml
	const hasAnyContent = company.trim() || role.trim() || description.trim()


	// handle escape key to cancel editing, remove the highlighted item and remove focus from the fields
	const handleEscapeKey = useCallback((e: KeyboardEvent) => {
		if (e.key === 'Escape' && isEditing) {
			setIsEditing(false)
			setHighlightedItem(null)
			roleRef.current?.blur()
			companyRef.current?.blur()
			descriptionRef.current?.blur()
		}
	}, [isEditing, setHighlightedItem])

	useEffect(() => {
		document.addEventListener('keydown', handleEscapeKey)
		return () => document.removeEventListener('keydown', handleEscapeKey)
	}, [handleEscapeKey])

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
						<BriefcaseIcon className="h-8 w-8 text-blue-600" />
					</div>
					<h3 className="text-lg font-semibold text-gray-900 mb-2">Add Experience</h3>
					<p className="text-sm text-gray-600 mb-4 max-w-sm mx-auto">
						Showcase your work experience, job titles, and achievements
					</p>
					<Button
						variant="outline"
						size="sm"
						className="text-sm font-medium hover:bg-blue-50 hover:border-blue-300"
					>
						<PlusIcon className="h-4 w-4 mr-2" />
						Add Experience
					</Button>
				</div>
			</motion.div>
		)
	}


	return (
		<motion.div
			initial={{opacity: 0}}
			animate={{opacity: 1}}
			className={cn(
				charter.className,
				'experience-item transition-all duration-300 border-2 border-transparent',
				data.spacing.marginTop ? 'mt-2' : '',
				isEditing && ' border-dashed border-gray-200 rounded-none hover:border-flame-300 hover:bg-flame-50/30 transition-all duration-200 cursor-pointer'
			)}
			data-resume-item={`experience-${data.id}`}
		>
			{/* Action Buttons */}
			<AnimatePresence mode="wait">
				{isEditing && (
					<SectionAction
						sectionType="experience"
						isEditing={isEditing}
						isUpdating={isUpdating || isSaving}
						isSaving={isSaving}
						hasUnsavedChanges={hasUnsavedChanges}
					/>
				)}
			</AnimatePresence>


			{/* JOB HEADER */}
			<div className="job-header">
				{/* JOB TITLE (Role + Company) */}

				<span
					ref={roleRef}
					contentEditable={true}
					suppressContentEditableWarning
					className={cn(
						'job-title outline-none rounded-md px-2 py-1 cursor-text transition-all duration-200',
						(!role && !data.role.formatted) && 'text-gray-400 italic',
					)}
					onFocus={() => handleFocus('role')}
					onBlur={() => handleBlur('role')}
					onInput={() => handleContentChange('role')}
				>
					{data.role.formatted || 'Role'}
				</span>

				{/* JOB DATE */}
				{experienceDate.hasDates && (
					<span
						className="experience-date"
					>{formatDateRange(experienceDate)}</span>
				)}
			</div>

			{/* JOB DETAILS */}
			{data.description.hasDescription && (
				<div
					ref={descriptionRef}
					contentEditable={true}
					className={cn(
						'job-details outline-none rounded-md px-2 py-1 cursor-text transition-all duration-200',
						(!description && !data.description.sanitizedHtml) && 'text-gray-400 italic',
					)}
					onFocus={() => handleFocus('description')}
					onBlur={() => handleBlur('description')}
					onInput={() => handleContentChange('description')}
				/>
			)}

			{/* Empty state helper when editing */}
			{isEditing && !hasAnyContent && (
				<motion.div
					initial={{opacity: 0}}
					animate={{opacity: 1}}
					className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg"
				>
					<p className="text-sm text-blue-700 mb-2 font-medium">Getting started:</p>
					<ul className="text-xs text-blue-600 space-y-1">
						<li>• Add your job title (e.g., "Software Engineer")</li>
						<li>• Include your company name (e.g., "Google")</li>
						<li>• Set your experience dates</li>
						<li>• Describe your responsibilities, achievements, or projects</li>
					</ul>
				</motion.div>
			)}
		</motion.div>
	)
}

export default ExperienceSection
