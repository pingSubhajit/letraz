'use server'

import {db} from '@/db/drizzle'
import {eq, and} from 'drizzle-orm'
import {projects} from '@/db/schema'
import {ProjectsInsert} from '@/db/projects.schema'
import {z} from 'zod'

export const createProject = async (userId: string, data: z.infer<typeof ProjectsInsert>) => {
	try {
		const project = await db.insert(projects).values({
			...data,
			userId
		}).returning()

		return project[0]
	} catch (error) {
		throw new Error('Failed to create project')
	}
}

export const getProjects = async (userId: string) => {
	try {
		return await db.query.projects.findMany({
			where: eq(projects.userId, userId)
		})
	} catch (error) {
		throw new Error('Failed to fetch projects')
	}
}

export const updateProject = async (projectId: string, userId: string, data: Partial<z.infer<typeof ProjectsInsert>>) => {
	try {
		const project = await db.update(projects)
			.set(data)
			.where(eq(projects.id, projectId) && eq(projects.userId, userId))
			.returning()

		if (!project.length) {
			throw new Error('Project not found or unauthorized')
		}

		return project[0]
	} catch (error) {
		throw new Error('Failed to update project')
	}
}

export const deleteProject = async (projectId: string, userId: string) => {
	try {
		const project = await db.delete(projects)
			.where(
				and(
					eq(projects.id, projectId),
					eq(projects.userId, userId)
				)
			)
			.returning()

		if (!project.length) {
			throw new Error('Project not found or unauthorized')
		}

		return project[0]
	} catch (error) {
		throw new Error('Failed to delete project')
	}
}
