'use client'


import {useRef, useState, useEffect, useCallback} from 'react'
import {charter} from '@/components/resume/themes/DEFAULT_THEME/fonts'
import {EducationData} from '@/components/resume/controllers/EducationController'
import {Loader2Icon, CheckIcon} from 'lucide-react'
import {cn} from '@/lib/utils'
import {useUpdateEducationMutation} from '@/lib/education/mutations'
import {toast} from 'sonner'
import {useQueryClient} from '@tanstack/react-query'
import {educationOptions} from '@/lib/education/queries'
// import {useDebounce} from 'use-debounce'
import DateMonthSelector, {formatDateRange} from '@/components/resume/editors/shared/DateMonthSelector'
import {Badge} from '@/components/ui/badge'

function useDebounce<T>(value: T, delay: number): T {
	const [debouncedValue, setDebouncedValue] = useState(value)

	useEffect(() => {
		const timeoutId = setTimeout(() => {
			setDebouncedValue(value)
		}, delay)

		return () => {
			clearTimeout(timeoutId)
		}
	}, [value, delay])

	return debouncedValue
}


const EducationSection = ({data}: { data: EducationData }) => {
	const [isEditing, setIsEditing] = useState(false)
	const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
	const [educationDate, setEducationDate] = useState(data.dates)

	// Track individual field changes
	const [institutionName, setInstitutionName] = useState(data.institution.name || '')
	const [degree, setDegree] = useState(data.degree.formatted || '')
	const [description, setDescription] = useState(data.description.sanitizedHtml || '')

	const queryClient = useQueryClient()

	const {mutateAsync: updateEducation, isPending: isUpdating} = useUpdateEducationMutation({
		onSuccess: () => {
			queryClient.invalidateQueries({queryKey: educationOptions.queryKey})
			setHasUnsavedChanges(false)
		},
		onError: () => {
			toast.error('Failed to update education. Please try again.')
		}
	})

	const institutionRef = useRef<HTMLSpanElement>(null)
	const degreeRef = useRef<HTMLSpanElement>(null)
	const descriptionRef = useRef<HTMLDivElement>(null)

	// Create debounced values for auto-save
	const debouncedInstitutionName = useDebounce(institutionName, 1000)
	const debouncedDegree = useDebounce(degree, 1000)
	const debouncedDescription = useDebounce(description, 1000)
	const debouncedEducationDate = useDebounce<EducationData['dates']>(educationDate, 1000)

	// Auto-save effect
	useEffect(() => {
		if (!isEditing || !hasUnsavedChanges) return

		const shouldUpdate =
			debouncedInstitutionName !== data.institution.name ||
			debouncedDegree !== data.degree.formatted ||
			debouncedDescription !== data.description.sanitizedHtml ||
			JSON.stringify(debouncedEducationDate) !== JSON.stringify(data.dates)

		if (shouldUpdate) {
			updateEducation({
				id: data.educationId,
				data: {
					institution_name: debouncedInstitutionName,
					degree: debouncedDegree,
					description: debouncedDescription,
					dates: debouncedEducationDate
				}
			})
		}
	}, [debouncedInstitutionName, debouncedDegree, debouncedDescription, debouncedEducationDate, isEditing, hasUnsavedChanges, updateEducation, data])

	const handleContentChange = useCallback((field: 'institution' | 'degree' | 'description') => {
		setHasUnsavedChanges(true)

		switch (field) {
		case 'institution':
			setInstitutionName(institutionRef.current?.innerText || '')
			break
		case 'degree':
			setDegree(degreeRef.current?.innerText || '')
			break
		case 'description':
			setDescription(descriptionRef.current?.innerHTML || '')
			break
		}
	}, [])

	const handleDateChange = useCallback((dates: typeof educationDate) => {
		setEducationDate(dates)
		setHasUnsavedChanges(true)
	}, [])

	const handleReset = () => {
		if (institutionRef.current) {
			institutionRef.current.innerText = data.institution.name || ''
		}
		if (degreeRef.current) {
			degreeRef.current.innerText = data.degree.formatted || ''
		}
		if (descriptionRef.current) {
			descriptionRef.current.innerHTML = data.description.sanitizedHtml || ''
		}

		// Reset state
		setInstitutionName(data.institution.name || '')
		setDegree(data.degree.formatted || '')
		setDescription(data.description.sanitizedHtml || '')
		setEducationDate(data.dates)
		setHasUnsavedChanges(false)
	}

	const handleStartEdit = () => {
		setIsEditing(true)
	}

	const handleStopEdit = () => {
		setIsEditing(false)
		setHasUnsavedChanges(false)
	}


	const SaveIndicator = () => {
		if (!isEditing) return null

		const baseClasses =
		'absolute -top-8 right-0 flex items-center gap-1 text-xs font-medium !px-1 shadow-sm transition-all duration-200'


		if (isUpdating) {
			return (
				<Badge className={cn(baseClasses, 'bg-blue-100 text-blue-600')}>
					<Loader2Icon className="w-3.5 h-3.5 animate-spin" />
					Saving...
				</Badge>
			)
		}


		if (hasUnsavedChanges) {
			return (
				<Badge className={cn(baseClasses, 'bg-yellow-100 text-yellow-700')}>
					<span className="w-2 h-2 bg-yellow-400 rounded-full" />
					Unsaved changes
				</Badge>
			)
		}


		return (
			<Badge className={cn(baseClasses, 'bg-green-100 text-green-700')}>
				<CheckIcon className="w-3.5 h-3.5" />
				Saved
			</Badge>
		)

	}


	return (
		<div className="relative group">
			<SaveIndicator />

			<div className={cn(
				`${charter.className} education-item ${data.spacing.marginTop ? 'mt-2' : ''}`,
				isEditing && 'outline outline-2 outline-blue-500 rounded px-4 py-2'
			)}>
				<div className="education-header">
					<span className="education-title">
						{data.institution.name && (
							<span
								ref={institutionRef}
								contentEditable={true}
								suppressContentEditableWarning
								className={cn(
									'font-semibold focus:outline-none focus:bg-blue-50 rounded px-1 cursor-text'
								)}
								onFocus={handleStartEdit}
								onBlur={handleStopEdit}
								onInput={() => handleContentChange('institution')}
							>{data.institution.name}</span>
						)}
						{data.institution.name && data.degree.hasDegree && ', '}
						{data.degree.hasDegree && (
							<span
								ref={degreeRef}
								contentEditable={true}
								suppressContentEditableWarning
								className={cn(
									'focus:outline-none focus:bg-blue-50 rounded px-1 cursor-text'
								)}
								onFocus={handleStartEdit}
								onBlur={handleStopEdit}
								onInput={() => handleContentChange('degree')}
							>
								{data.degree.formatted}
							</span>
						)}
					</span>
					{data.dates.hasDates && (
						<DateMonthSelector
							title="Education Duration"
							description="Set the duration for your education."
							value={educationDate}
							onChange={handleDateChange}
						>
							<span className={cn(
								'education-date cursor-pointer hover:text-gray-900 border-b border-dashed border-transparent hover:border-gray-600'
							)}>
								{educationDate.hasDates
									? formatDateRange(educationDate)
									: 'Add dates'
								}
							</span>
						</DateMonthSelector>
					)}
				</div>

				{data.description.hasDescription && (
					<div
						ref={descriptionRef}
						contentEditable={true}
						className={cn(
							'education-details prose prose-sm max-w-none focus:outline-none focus:bg-blue-50 rounded px-2 py-1 min-h-[2rem] cursor-text'
						)}
						dangerouslySetInnerHTML={{__html: data.description.sanitizedHtml || ''}}
						onFocus={handleStartEdit}
						onBlur={handleStopEdit}
						onInput={() => handleContentChange('description')}
					/>
				)}
			</div>
		</div>
	)
}

export default EducationSection
