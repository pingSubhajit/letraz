'use client'

import {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import {charter} from '@/components/resume/themes/DEFAULT_THEME/fonts'
import {SkillsData} from '@/components/resume/controllers/SkillsController'
import {cn} from '@/lib/utils'
import {useUpdateSkillMutation} from '@/lib/skill/mutations'
import {AnimatePresence} from 'motion/react'
import SectionAction from './SectionAction'
import {debounce} from 'lodash'
import {useResumeHighlight} from '@/components/resume/contexts/ResumeHighlightContext'
import {SkillMutation} from '@/lib/skill/types'
import {toast} from 'sonner'

const SkillsSection = ({data}: { data: SkillsData }) => {
	const {setHighlightedItem} = useResumeHighlight()
	const [isEditing, setIsEditing] = useState(false)
	const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

	const [skillNames, setSkillNames] = useState<Record<string, string>>({})
	const [groupCategories, setGroupCategories] = useState<Record<string, string>>({})

	const nameRefs = useRef<Record<string, HTMLSpanElement | null>>({})
	const categoryRefs = useRef<Record<string, HTMLSpanElement | null>>({})

	useEffect(() => {
		const initialNames: Record<string, string> = {}
		const initialCategories: Record<string, string> = {}
		Object.entries(data.groupedSkills).forEach(([category, skills]) => {
			initialCategories[category] = category
			skills.forEach(skill => {initialNames[skill.id] = skill.name})
		})
		setSkillNames(initialNames)
		setGroupCategories(initialCategories)
	}, [data.groupedSkills])

	const {mutateAsync: updateSkill, isPending: isUpdating} = useUpdateSkillMutation(
		{
			onSuccess: () => {
				setHasUnsavedChanges(false)
			},
			onError: (error) => {
				setHasUnsavedChanges(false)
				toast.error('Failed to update skill')
			}
		}
	)

	const debouncedSave = useCallback(
		debounce(async (data: SkillMutation) => {
			if (!hasUnsavedChanges) return
			await updateSkill({id: data.skill_id, data: data})
		}, 2000),
		[hasUnsavedChanges, updateSkill]
	)


	const handleStartEdit = useCallback(() => {
		setIsEditing(true)
		setHighlightedItem({type: 'skill'})
	}, [setHighlightedItem])

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			const target = event.target as Node
			const insideName = Object.values(nameRefs.current).some(ref => ref?.contains(target) ?? false)
			const insideCategory = Object.values(categoryRefs.current).some(ref => ref?.contains(target) ?? false)
			if (!insideName && !insideCategory && isEditing) {
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

	const onNameInput = (skillId: string) => {
		setHasUnsavedChanges(true)
		const value = nameRefs.current[skillId]?.innerText || ''
		setSkillNames(prev => ({...prev, [skillId]: value}))
		debouncedSave({skill_id: `custom:${value}`, level: 'INT'})
	}

	const onCategoryInput = (originalCategory: string) => {
		setHasUnsavedChanges(true)
		const node = categoryRefs.current[originalCategory]
		const value = node?.innerText || ''
		setGroupCategories(prev => ({...prev, [originalCategory]: value}))
		const affectedSkills = data.groupedSkills[originalCategory] || []
		affectedSkills.forEach(skill => {
			debouncedSave({category: value.trim() || undefined, level: 'INT', skill_id: skill.id})
		})
	}

	return (
		<div
			className={cn(
				charter.className,
				'relative skills-section transition-all duration-300',
				data.spacing.marginTop ? 'mt-2' : ''
			)}
			data-resume-item="skill-section"
		>
			<AnimatePresence mode="wait">
				{isEditing && (
					<SectionAction
						sectionType="skill"
						isEditing={isEditing}
						isUpdating={isUpdating}
						isSaving={false}
						hasUnsavedChanges={hasUnsavedChanges}
					/>
				)}
			</AnimatePresence>

			{Object.entries(data.groupedSkills).map(([category, skills]) => (
				<div key={category} className="skill-category">
					<span
						ref={el => {categoryRefs.current[category] = el}}
						className={cn('skill-category-name outline-none rounded-md px-1', isEditing && 'cursor-text')}
						contentEditable={true}
						suppressContentEditableWarning
						onFocus={handleStartEdit}
						onInput={() => onCategoryInput(category)}
					>
						{groupCategories[category] ?? category}
					</span>
					{': '}
					<span className="skill-list">
						{skills.map((skill, index) => (
							<span key={skill.id}>
								<span
									ref={el => {nameRefs.current[skill.id] = el}}
									className={cn('outline-none rounded-md px-1', isEditing && 'cursor-text')}
									contentEditable={true}
									suppressContentEditableWarning
									onFocus={handleStartEdit}
									onInput={() => onNameInput(skill.id)}
								>
									{skillNames[skill.id] ?? skill.name}
								</span>
								{index < skills.length - 1 && ', '}
							</span>
						))}
					</span>
				</div>
			))}
		</div>
	)
}

export default SkillsSection
