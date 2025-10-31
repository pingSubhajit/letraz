import {mutation, query} from "./_generated/server";
import {v} from "convex/values";

const toHex = (bytes: Uint8Array) =>
  Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

const hashToken = async (raw: string) => {
  const data = new TextEncoder().encode(raw);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return toHex(new Uint8Array(digest));
};

const generateToken = () => {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return toHex(bytes);
};

export const createToken = mutation({
  args: { label: v.string(), createdByUserId: v.string(), createdByUserEmail: v.optional(v.string()), createdByUserName: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const raw = generateToken();
    const tokenHash = await hashToken(raw);
    const now = new Date().toISOString();
    const id = await ctx.db.insert("apiTokens", {
      tokenHash,
      label: args.label,
      createdByUserId: args.createdByUserId,
      createdByUserEmail: args.createdByUserEmail,
      createdByUserName: args.createdByUserName,
      createdAt: now,
      isActive: true,
    });
    return { id, token: raw };
  },
});

export const revokeToken = mutation({
  args: { id: v.id("apiTokens") },
  handler: async (ctx, { id }) => {
    await ctx.db.patch(id, { isActive: false });
  },
});

export const listTokens = query({
  args: { createdByUserId: v.string() },
  handler: async (ctx, { createdByUserId }) => {
    return await ctx.db
      .query("apiTokens")
      .withIndex("by_createdByUserId", (q) => q.eq("createdByUserId", createdByUserId))
      .order("desc")
      .collect();
  },
});

export const verifyToken = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const tokenHash = await hashToken(token);
    const rec = await ctx.db
      .query("apiTokens")
      .withIndex("by_tokenHash", (q) => q.eq("tokenHash", tokenHash))
      .filter((q) => q.eq(q.field("isActive"), true))
      .first();
    return !!rec;
  },
});

export const recordTokenUse = mutation({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const tokenHash = await hashToken(token);
    const rec = await ctx.db
      .query("apiTokens")
      .withIndex("by_tokenHash", (q) => q.eq("tokenHash", tokenHash))
      .filter((q) => q.eq(q.field("isActive"), true))
      .first();
    if (!rec) return false;
    await ctx.db.patch(rec._id, { lastUsedAt: new Date().toISOString() });
    return true;
  },
});


