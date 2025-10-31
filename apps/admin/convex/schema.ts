import {defineSchema, defineTable} from 'convex/server'
import {v} from 'convex/values'

// Define the Department enum
export const DepartmentEnum = v.union(
	v.literal('Core Team'),
	v.literal('Marketing Team')
)

export default defineSchema({
	teamMembers: defineTable({
		name: v.string(),
		email: v.string(),
		phone: v.optional(v.string()),
		department: DepartmentEnum,
		joiningDate: v.string(), // ISO date string
		photo: v.optional(v.string()), // Storage ID or URL to the photo
		bio: v.optional(v.string()),
		position: v.optional(v.string()),
		isActive: v.boolean(),
		createdAt: v.string(),
		updatedAt: v.string()
	})
		.index('by_department', ['department'])
		.index('by_email', ['email'])
		.index('by_active', ['isActive'])
		.index('by_joining_date', ['joiningDate']),
	apiTokens: defineTable({
		tokenHash: v.string(),
		label: v.string(),
		createdByUserId: v.string(),
		createdByUserEmail: v.optional(v.string()),
		createdByUserName: v.optional(v.string()),
		createdAt: v.string(),
		lastUsedAt: v.optional(v.string()),
		isActive: v.boolean()
	})
		.index('by_active', ['isActive'])
		.index('by_tokenHash', ['tokenHash'])
		.index('by_createdByUserId', ['createdByUserId']),

	// GitHub repository integration tables
	repositories: defineTable({
		name: v.string(),
		owner: v.string(),
		githubId: v.number(),
		webhookSecret: v.string(),
		accessToken: v.optional(v.string()), // Encrypted GitHub access token (deprecated - use GitHub App instead)
		githubAppInstallationId: v.optional(v.number()), // GitHub App installation ID
		linearTeamId: v.optional(v.string()), // For team-specific filtering
		isActive: v.boolean(),
		createdByUserId: v.string(),
		createdAt: v.string(),
		updatedAt: v.string()
	})
		.index('by_owner', ['owner'])
		.index('by_github_id', ['githubId'])
		.index('by_created_by', ['createdByUserId'])
		.index('by_active', ['isActive']),

	// Track existing GitHub-Linear issue relationships
	githubLinearMappings: defineTable({
		linearIssueId: v.string(),
		githubIssueId: v.number(),
		githubRepositoryId: v.id('repositories'),
		createdAt: v.string()
	})
		.index('by_linear_issue', ['linearIssueId'])
		.index('by_github_issue', ['githubIssueId'])
		.index('by_repository', ['githubRepositoryId']),

	// Track GitHub PR to Linear issue mappings
	githubPrMappings: defineTable({
		linearIssueId: v.string(),
		githubPrId: v.number(),
		githubRepositoryId: v.id('repositories'),
		githubPrNumber: v.number(),
		githubPrUrl: v.string(),
		status: v.union(
			v.literal('open'),
			v.literal('closed'),
			v.literal('merged')
		),
		createdAt: v.string(),
		updatedAt: v.string()
	})
		.index('by_linear_issue', ['linearIssueId'])
		.index('by_github_pr', ['githubPrId'])
		.index('by_repository', ['githubRepositoryId'])
		.index('by_status', ['status']),

	// Track webhook events for processing
	webhookEvents: defineTable({
		repositoryId: v.id('repositories'),
		eventType: v.string(), // push, pull_request, etc.
		payload: v.any(), // Raw GitHub webhook payload
		processed: v.boolean(),
		processingError: v.optional(v.string()),
		processedAt: v.optional(v.string()),
		createdAt: v.string(),
		updatedAt: v.optional(v.string())
	})
		.index('by_repository', ['repositoryId'])
		.index('by_processed', ['processed'])
		.index('by_event_type', ['eventType'])
		.index('by_created_at', ['createdAt'])
		.index('by_updated_at', ['updatedAt'])
})
