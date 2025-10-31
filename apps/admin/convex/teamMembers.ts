import {mutation, query} from './_generated/server'
import {v} from 'convex/values'
import {DepartmentEnum} from './schema'

// Helper function to get image URL from storage ID
const getImageUrl = async (ctx: any, storageId: string) => {
	if (storageId.startsWith('http')) {
		// It's already a URL, return as is
		return storageId
	}
	// It's a storage ID, get the URL
	try {
		return await ctx.storage.getUrl(storageId)
	} catch {
		return undefined
	}
}

// Helper function to add image URLs to team member objects
const enrichTeamMemberWithImageUrl = async (ctx: any, member: any) => {
	if (member.photo) {
		const imageUrl = await getImageUrl(ctx, member.photo)
		return {...member, photoUrl: imageUrl}
	}
	return {...member, photoUrl: undefined}
}

// Query to get all team members
export const getAllTeamMembers = query({
	args: {},
	handler: async (ctx) => {
		const members = await ctx.db
			.query('teamMembers')
			.filter((q) => q.eq(q.field('isActive'), true))
			.order('desc')
			.collect()

		// Enrich with image URLs
		return await Promise.all(
			members.map(member => enrichTeamMemberWithImageUrl(ctx, member))
		)
	}
})

// Query to get team members by department
export const getTeamMembersByDepartment = query({
	args: {department: DepartmentEnum},
	handler: async (ctx, args) => {
		const members = await ctx.db
			.query('teamMembers')
			.withIndex('by_department', (q) => q.eq('department', args.department))
			.filter((q) => q.eq(q.field('isActive'), true))
			.collect()

		// Enrich with image URLs
		return await Promise.all(
			members.map(member => enrichTeamMemberWithImageUrl(ctx, member))
		)
	}
})

// Query to get a specific team member by ID
export const getTeamMember = query({
	args: {id: v.id('teamMembers')},
	handler: async (ctx, args) => {
		const member = await ctx.db.get(args.id)
		if (!member) return null

		return await enrichTeamMemberWithImageUrl(ctx, member)
	}
})

// Query to search team members
export const searchTeamMembers = query({
	args: {searchTerm: v.string()},
	handler: async (ctx, args) => {
		const allMembers = await ctx.db
			.query('teamMembers')
			.filter((q) => q.eq(q.field('isActive'), true))
			.collect()

		const searchLower = args.searchTerm.toLowerCase()
		const filteredMembers = allMembers.filter((member) => member.name.toLowerCase().includes(searchLower) ||
      member.email.toLowerCase().includes(searchLower) ||
      (member.position && member.position.toLowerCase().includes(searchLower)))

		// Enrich with image URLs
		return await Promise.all(
			filteredMembers.map(member => enrichTeamMemberWithImageUrl(ctx, member))
		)
	}
})

// Mutation to create a new team member
export const createTeamMember = mutation({
	args: {
		name: v.string(),
		email: v.string(),
		phone: v.optional(v.string()),
		department: DepartmentEnum,
		joiningDate: v.string(),
		photo: v.optional(v.string()),
		bio: v.optional(v.string()),
		position: v.optional(v.string())
	},
	handler: async (ctx, args) => {
		// Check if email already exists
		const existingMember = await ctx.db
			.query('teamMembers')
			.withIndex('by_email', (q) => q.eq('email', args.email))
			.first()

		if (existingMember) {
			throw new Error('A team member with this email already exists')
		}

		const now = new Date().toISOString()

		return await ctx.db.insert('teamMembers', {
			...args,
			isActive: true,
			createdAt: now,
			updatedAt: now
		})
	}
})

// Mutation to update a team member
export const updateTeamMember = mutation({
	args: {
		id: v.id('teamMembers'),
		name: v.optional(v.string()),
		email: v.optional(v.string()),
		phone: v.optional(v.string()),
		department: v.optional(DepartmentEnum),
		joiningDate: v.optional(v.string()),
		photo: v.optional(v.string()),
		bio: v.optional(v.string()),
		position: v.optional(v.string()),
		isActive: v.optional(v.boolean())
	},
	handler: async (ctx, args) => {
		const {id, ...updates} = args

		// If email is being updated, check for duplicates
		if (updates.email) {
			const existingMember = await ctx.db
				.query('teamMembers')
				.withIndex('by_email', (q) => q.eq('email', updates.email!))
				.first()

			if (existingMember && existingMember._id !== id) {
				throw new Error('A team member with this email already exists')
			}
		}

		const updatedFields = {
			...updates,
			updatedAt: new Date().toISOString()
		}

		// Remove undefined values
		const cleanUpdates = Object.fromEntries(
			Object.entries(updatedFields).filter(([_, value]) => value !== undefined)
		)

		return await ctx.db.patch(id, cleanUpdates)
	}
})

// Mutation to soft delete a team member
export const deleteTeamMember = mutation({
	args: {id: v.id('teamMembers')},
	handler: async (ctx, args) => {
		return await ctx.db.patch(args.id, {
			isActive: false,
			updatedAt: new Date().toISOString()
		})
	}
})

// Mutation to permanently delete a team member
export const permanentlyDeleteTeamMember = mutation({
	args: {id: v.id('teamMembers')},
	handler: async (ctx, args) => {
		return await ctx.db.delete(args.id)
	}
})

// Query to get team statistics
export const getTeamStats = query({
	args: {},
	handler: async (ctx) => {
		const allMembers = await ctx.db
			.query('teamMembers')
			.filter((q) => q.eq(q.field('isActive'), true))
			.collect()

		const coreTeamCount = allMembers.filter(m => m.department === 'Core Team').length
		const marketingTeamCount = allMembers.filter(m => m.department === 'Marketing Team').length

		return {
			total: allMembers.length,
			coreTeam: coreTeamCount,
			marketingTeam: marketingTeamCount
		}
	}
})
