import {useState, useEffect, useMemo} from 'react'

interface SkillAlias {
  id: string
  category: string | null
  name: string
  preferred: boolean
  created_at: string
  updated_at: string
}

export interface Skill {
  id: string
  name: string
  category: string | null
  preferred: boolean
  alias: SkillAlias[]
  created_at: string
  updated_at: string
}

interface UseSkillSearchProps {
  skills: Skill[]
  excludeSkillIds?: string[]
  searchQuery: string
}

// Helper function to normalize text for comparison
const normalizeText = (text: string | null): string => {
	if (!text) return ''
	return text
		.toLowerCase()
		.trim()
		.replace(/\s+/g, ' ') // Normalize spaces
		.replace(/[.\-_]/g, ' ') // Convert dots, dashes, and underscores to spaces
}

export const useSkillSearch = ({skills, excludeSkillIds = [], searchQuery}: UseSkillSearchProps) => {
	// Memoize filtered and sorted skills based on the search query
	const filteredSkills = useMemo(() => {
		// First exclude any skills that are already added
		const availableSkills = skills.filter(skill => !excludeSkillIds.includes(skill.id))

		// Debug: Check what skills are available before filtering
		if (process.env.NODE_ENV === 'development') {
			// Use a more concise format that doesn't expand aliases
			const debugSkills = availableSkills.map(s => ({
				id: s.id,
				name: s.name,
				preferred: s.preferred
			}))
			// eslint-disable-next-line no-console
			console.log(`Available skills (${availableSkills.length}):`, debugSkills)
		}

		// If no search query, return all skills sorted by preferred first, then alphabetically
		if (!searchQuery.trim()) {
			return [...availableSkills].sort((a, b) => {
				// Preferred skills first
				if (a.preferred && !b.preferred) return -1
				if (!a.preferred && b.preferred) return 1
				// Then alphabetically
				return a.name.localeCompare(b.name)
			})
		}

		const normalizedQuery = normalizeText(searchQuery)

		// Calculate matches with scoring - but much simpler now
		const matchingSkills = availableSkills.filter(skill => {
			const normalizedName = normalizeText(skill.name)

			// Match on name
			if (normalizedName.includes(normalizedQuery)) {
				return true
			}

			// Match on category
			if (skill.category && normalizeText(skill.category).includes(normalizedQuery)) {
				return true
			}

			// Match on aliases
			if (skill.alias && skill.alias.length > 0) {
				if (skill.alias.some(alias => normalizeText(alias.name).includes(normalizedQuery))) {
					return true
				}
			}

			return false
		})

		// Sort by preferred first, then alphabetically
		return matchingSkills.sort((a, b) => {
			// Preferred skills first
			if (a.preferred && !b.preferred) return -1
			if (!a.preferred && b.preferred) return 1
			// Then alphabetically
			return a.name.localeCompare(b.name)
		})
	}, [skills, excludeSkillIds, searchQuery])

	return {
		results: filteredSkills,
		hasResults: filteredSkills.length > 0,
		isSearching: searchQuery.trim().length > 0
	}
}

