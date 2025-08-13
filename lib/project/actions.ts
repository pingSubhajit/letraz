'use server'

import {z} from 'zod'
import {Project, ProjectMutation, ProjectMutationSchema, ProjectSchema, GlobalSkillSchema, GlobalSkill} from '@/lib/project/types'
import {api} from '@/lib/config/api-client'
import {handleErrors} from '@/lib/misc/error-handler'

/**
 * Gets all projects from the database for a given resume
 * @param {string} resumeId - The resume id, default is 'base'
 * @returns {Promise<Project[]>} - Array of projects
 * @throws {Error} If authentication or API request fails.
 */
export const getProjectsFromDB = async (resumeId: string = 'base'): Promise<Project[]> => {
	try {
		const data = await api.get<any[]>(`/resume/${resumeId}/project/`)

		// Only normalize resume_section when backend returns it as an id string
		const normalized: any[] = (Array.isArray(data) ? data : []).map((p: any) => ({
			...p,
			resume_section: typeof p?.resume_section === 'string'
				? {id: p.resume_section, resume: resumeId, index: 0, type: 'Project'}
				: p?.resume_section
		}))

		return z.array(ProjectSchema).parse(normalized)
	} catch (error) {
		return handleErrors(error, 'fetch projects')
	}
}

/**
 * Fetches all global skills available in the database
 * @returns {Promise<GlobalSkill[]>} - Array of skills
 * @throws {Error} If API request fails.
 */
export const getGlobalSkills = async (): Promise<GlobalSkill[]> => {
	try {
		const data = await api.get('/skills/')
		return z.array(GlobalSkillSchema).parse(data)
	} catch (error) {
		return handleErrors(error, 'fetch global skills')
	}
}

/**
 * Adds a new project in the database
 * @param {ProjectMutation} projectValues - The project information
 * @param {string} resumeId - The resume id, default is 'base'
 * @returns {Promise<Project>} - The new project object
 * @throws {Error} If validation, authentication, or API request fails.
 */
export const addProjectToDB = async (projectValues: ProjectMutation, resumeId: string = 'base'): Promise<Project> => {
	try {
		const params = ProjectMutationSchema.parse(projectValues)
		const data = await api.post<Project>(`/resume/${resumeId}/project/`, params)
		return ProjectSchema.parse(data)
	} catch (error) {
		return handleErrors(error, 'add project')
	}
}

/**
 * Updates an existing project in the database
 * @param {string} projectId - The project id
 * @param {Partial<ProjectMutation>} projectValues - The updated project information
 * @param {string} resumeId - The resume id, default is 'base'
 * @returns {Promise<Project>} - The updated project object
 * @throws {Error} If validation, authentication, or API request fails.
 */
export const updateProjectInDB = async (
	projectId: string,
	projectValues: Partial<ProjectMutation>,
	resumeId: string = 'base'
): Promise<Project> => {
	try {
		const params = ProjectMutationSchema.partial().parse(projectValues)
		const data = await api.patch<Project>(
			`/resume/${resumeId}/project/${projectId}/`,
			params
		)
		return ProjectSchema.parse(data)
	} catch (error) {
		return handleErrors(error, 'update project')
	}
}

/**
 * Deletes a project from the database
 * @param {string} projectId - The project id
 * @param {string} resumeId - The resume id, default is 'base'
 * @returns {Promise<void>}
 * @throws {Error} If authentication or API request fails.
 */
export const deleteProjectFromDB = async (
	projectId: string,
	resumeId: string = 'base'
): Promise<void> => {
	try {
		await api.delete(`/resume/${resumeId}/project/${projectId}/`)
	} catch (error) {
		return handleErrors(error, 'delete project')
	}
}
