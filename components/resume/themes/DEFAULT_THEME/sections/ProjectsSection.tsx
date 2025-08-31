"use client"

import '../fontawesome'
import {charter} from '@/components/resume/themes/DEFAULT_THEME/fonts'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faGithub} from '@fortawesome/free-brands-svg-icons'
import {ProjectData} from '@/components/resume/controllers/ProjectController'
import {cn} from '@/lib/utils'
import {useCallback, useEffect, useRef, useState} from 'react'
import {useResumeHighlight} from '@/components/resume/contexts/ResumeHighlightContext'
import {AnimatePresence} from 'motion/react'
import SectionAction from './SectionAction'
import DateMonthSelector, {formatDateRange} from '@/components/resume/editors/shared/DateMonthSelector'
import {useUpdateProjectMutation} from '@/lib/project/mutations'
import {ProjectMutation} from '@/lib/project/types'
import {debounce} from 'lodash'

const ProjectsSection = ({data}: { data: ProjectData }) => {
	const {setHighlightedItem} = useResumeHighlight()
	const [isEditing, setIsEditing] = useState(false)
	const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

	const [name, setName] = useState(data.name || '')
	const [category, setCategory] = useState(data.category.value || '')
	const [role, setRole] = useState(data.role.value || '')
	const [description, setDescription] = useState(data.description.sanitizedHtml || '')
	const [dates, setDates] = useState({
		hasDates: data.dates.hasDates,
		startMonth: data.dates.startMonth ?? null,
		startYear: data.dates.startYear ?? null,
		endMonth: data.dates.endMonth ?? null,
		endYear: data.dates.endYear ?? null,
		current: data.dates.current ?? false
	})

	const nameRef = useRef<HTMLSpanElement>(null)
	const categoryRef = useRef<HTMLSpanElement>(null)
	const roleRef = useRef<HTMLSpanElement>(null)
	const descriptionRef = useRef<HTMLDivElement>(null)

	const {mutateAsync: updateProject, isPending: isUpdating} = useUpdateProjectMutation()

	const debouncedSave = useRef(debounce(async (payload: Partial<ProjectMutation>) => {
		if (!hasUnsavedChanges) return
		try {
			await updateProject({id: data.id, data: payload})
			setHasUnsavedChanges(false)
		} catch {}
	}, 800)).current

	useEffect(() => () => debouncedSave.cancel(), [debouncedSave])

	const handleStartEdit = useCallback(() => {
		setIsEditing(true)
		setHighlightedItem({type: 'project', id: data.id})
	}, [data.id, setHighlightedItem])

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			const target = event.target as Node
			const isInside = nameRef.current?.contains(target) || categoryRef.current?.contains(target) || roleRef.current?.contains(target) || descriptionRef.current?.contains(target)
			if (!isInside && isEditing) {
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
		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape' && isEditing) {
				setIsEditing(false)
				setHighlightedItem(null)
			}
		}
		document.addEventListener('keydown', onKeyDown)
		return () => document.removeEventListener('keydown', onKeyDown)
	}, [isEditing, setHighlightedItem])

	const onInput = (field: 'name' | 'category' | 'role' | 'description') => {
		setHasUnsavedChanges(true)
		if (field === 'name') {
			const v = nameRef.current?.innerText || ''
			setName(v)
			debouncedSave({name: v})
		} else if (field === 'category') {
			const v = categoryRef.current?.innerText || ''
			setCategory(v)
			debouncedSave({category: v || null})
		} else if (field === 'role') {
			const v = roleRef.current?.innerText || ''
			setRole(v)
			debouncedSave({role: v || null})
		} else if (field === 'description') {
			const v = descriptionRef.current?.innerHTML || ''
			setDescription(v)
			debouncedSave({description: v || null})
		}
	}

	const onDateChange = (d: any) => {
		setHasUnsavedChanges(true)
		setDates(d)
		debouncedSave({
			started_from_month: d.startMonth?.toString(),
			started_from_year: d.startYear?.toString(),
			finished_at_month: d.endMonth?.toString(),
			finished_at_year: d.endYear?.toString()
		})
	}

	if (!data.name && !isEditing) return null

	return (
		<article
			className={cn(
				charter.className,
				'relative project-item transition-all duration-300',
				data.spacing.marginTop ? 'mt-2' : ''
			)}
			aria-label={`Project: ${data.name}`}
			data-resume-item={`project-${data.id}`}
		>
			<AnimatePresence mode="wait">
				{isEditing && (
					<SectionAction
						sectionType="project"
						isEditing={isEditing}
						isUpdating={isUpdating}
						isSaving={false}
						hasUnsavedChanges={hasUnsavedChanges}
					/>
				)}
			</AnimatePresence>

			{/* PROJECT HEADER */}
			<div className="project-header">
				{/* PROJECT NAME AND CATEGORY */}
				<h3 className="project-title">
					<span
						ref={nameRef}
						contentEditable
						suppressContentEditableWarning
						className={cn('outline-none rounded px-1', isEditing && 'cursor-text')}
						onFocus={handleStartEdit}
						onInput={() => onInput('name')}
					>
						{name || 'Project name'}
					</span>
					{' '}
					<span>
						–{' '}
						<span
							ref={categoryRef}
							contentEditable
							suppressContentEditableWarning
							className={cn('project-category outline-none rounded px-1', isEditing && 'cursor-text')}
							onFocus={handleStartEdit}
							onInput={() => onInput('category')}
						>
							{category || 'Category'}
						</span>
					</span>
				</h3>

				{/* PROJECT DATE */}
				<DateMonthSelector
					title="Project Duration"
					description="Set the duration for your project."
					value={dates}
					onChange={onDateChange}
				>
					<time className={cn('project-date cursor-pointer hover:text-flame-600 border-b border-dashed border-transparent hover:border-flame-400 transition-all duration-200 px-2 py-1 rounded text-sm')} aria-label="Project duration">
						{dates.hasDates ? formatDateRange(dates) : 'Add dates'}
					</time>
				</DateMonthSelector>
			</div>

			{/* PROJECT ROLE AND LINKS */}
			<div className="project-subtitle">
				<span
					ref={roleRef}
					contentEditable
					suppressContentEditableWarning
					className={cn('project-role outline-none rounded px-1', isEditing && 'cursor-text')}
					onFocus={handleStartEdit}
					onInput={() => onInput('role')}
				>
					{role || 'Role'}
				</span>
				{data.links.hasLinks && (
					<span className="project-links" role="group" aria-label="Project links">
						<span className="project-separator" aria-hidden="true">|</span>
						{data.links.github && (
							<>
								<a
									href={data.links.github}
									target="_blank"
									rel="noopener noreferrer"
									className="project-link"
									aria-label={`View ${data.name} on GitHub`}
								>
									<FontAwesomeIcon icon={faGithub} aria-hidden="true" />
									<span> GitHub</span>
								</a>
								{data.links.live && <span className="project-separator" aria-hidden="true">|</span>}
							</>
						)}
						{data.links.live && (
							<a
								href={data.links.live}
								target="_blank"
								rel="noopener noreferrer"
								className="project-link"
								aria-label={`View ${data.name} live demo`}
							>
								Live Demo
							</a>
						)}
					</span>
				)}
			</div>

			{/* PROJECT TECHNOLOGIES */}
			{data.technologies.hasTechnologies && (
				<div className="project-technologies">
					<span className="tech-label">Skills used: </span>
					<span className="tech-list">{data.technologies.list.join(', ')}</span>
				</div>
			)}

			{/* PROJECT DESCRIPTION */}
			<div
				ref={descriptionRef}
				className="project-details outline-none rounded px-1"
				contentEditable
				suppressContentEditableWarning
				onFocus={handleStartEdit}
				onInput={() => onInput('description')}
				dangerouslySetInnerHTML={{__html: description || ''}}
			/>

		</article>
	)
}

export default ProjectsSection
