/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {ApiFromModules, FilterApi, FunctionReference,} from "convex/server";
import type * as apiTokens from "../apiTokens.js";
import type * as files from "../files.js";
import type * as repositories from "../repositories.js";
import type * as teamMembers from "../teamMembers.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  apiTokens: typeof apiTokens;
  files: typeof files;
  repositories: typeof repositories;
  teamMembers: typeof teamMembers;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
