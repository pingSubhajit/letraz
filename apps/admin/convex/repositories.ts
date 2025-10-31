import {mutation, query} from "./_generated/server";
import {v} from "convex/values";

// Encrypt/decrypt utility functions for access tokens
// Note: In a production environment, use proper encryption
// For development, we use a simple reversible encoding
const encryptToken = async (token: string): Promise<string> => {
  // Simple encoding that works in Convex environment
  // In production, use proper encryption methods
  const encoded = btoa(token);
  return encoded;
};

const decryptToken = async (encodedToken: string): Promise<string> => {
  // Simple decoding that works in Convex environment
  // In production, use proper decryption methods
  try {
    const decoded = atob(encodedToken);
    return decoded;
  } catch (error) {
    throw new Error('Failed to decode token');
  }
};

// Generate webhook secret
const generateWebhookSecret = (): string => {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
};

// Repository CRUD operations
export const createRepository = mutation({
  args: {
    name: v.string(),
    owner: v.string(),
    githubId: v.number(),
    accessToken: v.string(),
    linearTeamId: v.optional(v.string()),
    createdByUserId: v.string(),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    const webhookSecret = generateWebhookSecret();
    const encryptedToken = await encryptToken(args.accessToken);

    const repositoryId = await ctx.db.insert("repositories", {
      name: args.name,
      owner: args.owner,
      githubId: args.githubId,
      webhookSecret,
      accessToken: encryptedToken,
      linearTeamId: args.linearTeamId,
      isActive: true,
      createdByUserId: args.createdByUserId,
      createdAt: now,
      updatedAt: now,
    });

    return {
      id: repositoryId,
      webhookSecret,
    };
  },
});

export const listRepositories = query({
  args: {
    createdByUserId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let queryBuilder;

    if (args.createdByUserId) {
      queryBuilder = ctx.db
        .query("repositories")
        .withIndex("by_created_by", (q) =>
          q.eq("createdByUserId", args.createdByUserId!)
        );
    } else {
      queryBuilder = ctx.db.query("repositories");
    }

    return await queryBuilder
      .filter((q) => q.eq(q.field("isActive"), true))
      .order("desc")
      .collect();
  },
});

export const getRepository = query({
  args: {
    id: v.id("repositories"),
  },
  handler: async (ctx, args) => {
    const repository = await ctx.db.get(args.id);
    if (!repository || !repository.isActive) {
      return null;
    }

  return {
    ...repository,
    accessToken: repository.accessToken ? await decryptToken(repository.accessToken) : null,
  };
  },
});

export const updateRepository = mutation({
  args: {
    id: v.id("repositories"),
    name: v.optional(v.string()),
    owner: v.optional(v.string()),
    accessToken: v.optional(v.string()),
    linearTeamId: v.optional(v.string()),
    webhookSecret: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const repository = await ctx.db.get(args.id);
    if (!repository) {
      throw new Error("Repository not found");
    }

    const updates: any = {
      updatedAt: new Date().toISOString(),
    };

    if (args.name !== undefined) updates.name = args.name;
    if (args.owner !== undefined) updates.owner = args.owner;
    if (args.linearTeamId !== undefined) updates.linearTeamId = args.linearTeamId;
    if (args.webhookSecret !== undefined) updates.webhookSecret = args.webhookSecret;

    if (args.accessToken !== undefined) {
      updates.accessToken = await encryptToken(args.accessToken);
    }

    await ctx.db.patch(args.id, updates);

  return {
    id: args.id,
    ...repository,
    ...updates,
    accessToken: args.accessToken
      ? await decryptToken(updates.accessToken)
      : repository.accessToken
        ? await decryptToken(repository.accessToken)
        : null,
  };
  },
});

export const deleteRepository = mutation({
  args: {
    id: v.id("repositories"),
  },
  handler: async (ctx, args) => {
    const repository = await ctx.db.get(args.id);
    if (!repository) {
      throw new Error("Repository not found");
    }

    await ctx.db.patch(args.id, { isActive: false, updatedAt: new Date().toISOString() });

    return { success: true };
  },
});

export const getRepositoryByGitHubId = query({
  args: {
    githubId: v.number(),
    owner: v.string(),
  },
  handler: async (ctx, args) => {
    const repository = await ctx.db
      .query("repositories")
      .withIndex("by_github_id", (q) => q.eq("githubId", args.githubId))
      .filter((q) => q.eq(q.field("owner"), args.owner))
      .filter((q) => q.eq(q.field("isActive"), true))
      .first();

    if (!repository) {
      return null;
    }

    // Handle both OAuth tokens (legacy) and GitHub App installations
    let accessToken = null;
    if (repository.accessToken) {
      accessToken = await decryptToken(repository.accessToken);
    }

    return {
      ...repository,
      accessToken,
      hasGitHubApp: !!repository.githubAppInstallationId,
    };
  },
});

// GitHub-Linear mapping operations
export const createGitHubLinearMapping = mutation({
  args: {
    linearIssueId: v.string(),
    githubIssueId: v.number(),
    githubRepositoryId: v.id("repositories"),
  },
  handler: async (ctx, args) => {
    // Check if mapping already exists
    const existingMapping = await ctx.db
      .query("githubLinearMappings")
      .withIndex("by_linear_issue", (q) => q.eq("linearIssueId", args.linearIssueId))
      .filter((q) => q.eq(q.field("githubRepositoryId"), args.githubRepositoryId))
      .first();

    if (existingMapping) {
      throw new Error("Mapping already exists for this Linear issue and repository");
    }

    const id = await ctx.db.insert("githubLinearMappings", {
      linearIssueId: args.linearIssueId,
      githubIssueId: args.githubIssueId,
      githubRepositoryId: args.githubRepositoryId,
      createdAt: new Date().toISOString(),
    });

    return { id };
  },
});

export const getGitHubIssueByLinearIssue = query({
  args: {
    linearIssueId: v.string(),
    githubRepositoryId: v.id("repositories"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("githubLinearMappings")
      .withIndex("by_linear_issue", (q) => q.eq("linearIssueId", args.linearIssueId))
      .filter((q) => q.eq(q.field("githubRepositoryId"), args.githubRepositoryId))
      .first();
  },
});

// GitHub PR mapping operations
export const createGitHubPrMapping = mutation({
  args: {
    linearIssueId: v.string(),
    githubPrId: v.number(),
    githubRepositoryId: v.id("repositories"),
    githubPrNumber: v.number(),
    githubPrUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();

    const id = await ctx.db.insert("githubPrMappings", {
      linearIssueId: args.linearIssueId,
      githubPrId: args.githubPrId,
      githubRepositoryId: args.githubRepositoryId,
      githubPrNumber: args.githubPrNumber,
      githubPrUrl: args.githubPrUrl,
      status: "open",
      createdAt: now,
      updatedAt: now,
    });

    return { id };
  },
});

export const updateGitHubPrMapping = mutation({
  args: {
    id: v.id("githubPrMappings"),
    status: v.union(v.literal("open"), v.literal("closed"), v.literal("merged")),
  },
  handler: async (ctx, args) => {
    const mapping = await ctx.db.get(args.id);
    if (!mapping) {
      throw new Error("PR mapping not found");
    }

    await ctx.db.patch(args.id, {
      status: args.status,
      updatedAt: new Date().toISOString(),
    });

    return { success: true };
  },
});

export const getPrMappingByLinearIssue = query({
  args: {
    linearIssueId: v.string(),
    githubRepositoryId: v.id("repositories"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("githubPrMappings")
      .withIndex("by_linear_issue", (q) => q.eq("linearIssueId", args.linearIssueId))
      .filter((q) => q.eq(q.field("githubRepositoryId"), args.githubRepositoryId))
      .first();
  },
});

// Webhook event processing
export const createWebhookEvent = mutation({
  args: {
    repositoryId: v.id("repositories"),
    eventType: v.string(),
    payload: v.any(),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("webhookEvents", {
      repositoryId: args.repositoryId,
      eventType: args.eventType,
      payload: args.payload,
      processed: false,
      createdAt: new Date().toISOString(),
    });

    return { id };
  },
});

export const getUnprocessedWebhookEvents = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;

    return await ctx.db
      .query("webhookEvents")
      .withIndex("by_processed", (q) => q.eq("processed", false))
      .order("asc")
      .take(limit);
  },
});

export const markWebhookEventProcessed = mutation({
  args: {
    id: v.id("webhookEvents"),
    processingError: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();

    await ctx.db.patch(args.id, {
      processed: true,
      processedAt: now,
      processingError: args.processingError,
      updatedAt: now,
    });

    return { success: true };
  },
});

export const getWebhookEvent = query({
  args: {
    id: v.id("webhookEvents"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});
