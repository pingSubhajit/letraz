'use client'

import {useRef, useState} from 'react'

import {charter} from '@/components/resume/themes/DEFAULT_THEME/fonts'
import {EducationData} from '@/components/resume/controllers/EducationController'
import {Button} from '@/components/ui/button'
import {Edit2Icon, Loader2Icon, SaveIcon, XIcon} from 'lucide-react'
import {cn} from '@/lib/utils'
import {useUpdateEducationMutation} from '@/lib/education/mutations'
import {toast} from 'sonner'
import {useQueryClient} from '@tanstack/react-query'
import {educationOptions} from '@/lib/education/queries'
import DateMonthSelector, {formatDateRange} from '@/components/resume/editors/shared/DateMonthSelector'

const EducationSection = ({data}: { data: EducationData }) => {
	const [isEditing, setIsEditing] = useState(false)

	const [educationDate, setEducationDate] = useState(data.dates)


	const queryClient = useQueryClient()

	const {mutateAsync: updateEducation, isPending: isUpdating} = useUpdateEducationMutation({
		// TODO optimistic query
		onSuccess: () => {
			queryClient.invalidateQueries({queryKey: educationOptions.queryKey})
			setIsEditing(false)
		},
		onError: () => {
			toast.error('Failed to update education. Please try again.')
		}
	})

	const institutionRef = useRef<HTMLSpanElement>(null)
	const degreeRef = useRef<HTMLSpanElement>(null)
	const descriptionRef = useRef<HTMLDivElement>(null)

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
	}

	const handleSave = () => {
		updateEducation({
			id: data.educationId,
			data: {
				institution_name: institutionRef.current?.innerText || '',
				degree: degreeRef.current?.innerText || '',
				description: descriptionRef.current?.innerHTML || ''
			}
		})
	}

	return (
		<div className="relative group">
			<div className={cn(
				`${charter.className} education-item ${data.spacing.marginTop ? 'mt-2' : ''}`,
				isEditing && 'outline outline-2 outline-blue-500 rounded px-4'
			)}>
				<div className="education-header">
					<span className="education-title">
						{data.institution.name && (
							<span
								ref={institutionRef}
								contentEditable={isEditing}
								suppressContentEditableWarning
								className="font-semibold"
							>{data.institution.name}</span>
						)}
						{data.institution.name && data.degree.hasDegree && ', '}
						{data.degree.hasDegree && (
							<span
								ref={degreeRef}
								contentEditable={isEditing}
								suppressContentEditableWarning
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
							onChange={setEducationDate}
						>
							<span className="education-date cursor-pointer  hover:text-gray-900 border-b border-dashed border-transparent hover:border-gray-600">
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
						contentEditable={isEditing}
						className="education-details prose prose-sm max-w-none"
						dangerouslySetInnerHTML={{__html: data.description.sanitizedHtml || ''}}
					/>
				)}
			</div>

			<div className="absolute -right-5 top-1/2 translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
				<Button
					variant="outline"
					size="sm"
					className="h-7 w-7 p-0 bg-white shadow-sm hover:bg-gray-50 border-gray-200"
					onClick={() => {
						if (isEditing) handleReset()
						setIsEditing(prev => !prev)
					}}
				>
					{isEditing ? (
						<XIcon className="size-3" />
					) : (
						<Edit2Icon className="size-3" />
					)}
				</Button>

				{isEditing && (
					<Button
						variant="outline"
						size="sm"
						disabled={isUpdating}
						className="h-7 w-7 p-0 bg-white shadow-sm hover:bg-gray-50 border-gray-200"
						onClick={handleSave}
					>
						{isUpdating ? (
							<Loader2Icon className="animate-spin size-3" />
						) : (
							<SaveIcon className="size-3" />
						)}
					</Button>
				)}
			</div>
		</div>
	)
}

export default EducationSection
