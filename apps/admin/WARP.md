# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

Project: Letraz Admin (Next.js 15 + TypeScript)

Common commands
- Install dependencies (Bun preferred):
```bash path=null start=null
bun install
```

- Start development server (Turbopack):
```bash path=null start=null
bun run dev
```

- Build production bundle:
```bash path=null start=null
bun run build
```

- Start production server (after build):
```bash path=null start=null
bun run start
```

- Lint:
```bash path=null start=null
bun run lint
```

- Lint and fix:
```bash path=null start=null
bun run lint:fix
```

- Tests:
  - No test script is currently defined in package.json.
  - If tests are added later (e.g., with Vitest or Jest), prefer Bun-compatible invocations (e.g., `bun test` or `bun run test`) and document how to run a single test here.

Environment
- Copy the example env file and set required variables:
```bash path=null start=null
cp .env.example .env.local
```
- Required keys (see .env.example for the full list):
  - Clerk: CLERK_SECRET_KEY, NEXT_PUBLIC_APP_URL
  - Linear: NEXT_PUBLIC_LINEAR_CLIENT_ID, LINEAR_CLIENT_ID, LINEAR_CLIENT_SECRET
  - OpenAI: OPENAI_API_KEY
  - Admin/backends: CONSUMER_API_KEY, BACKEND_HOST, ADMIN_API_KEY
  - Convex: CONVEX_DEPLOYMENT, NEXT_PUBLIC_CONVEX_URL

High-level architecture
- Framework and routing
  - Next.js 15 App Router under app/.
  - Top-level layout at app/layout.tsx and global styles in app/globals.css.
  - Route groups/pages:
    - app/(dashboard)/team-management/page.tsx
    - app/generate-pr/page.tsx
    - app/settings/page.tsx
    - app/waitlist/page.tsx
    - app/login/page.tsx
    - API route: app/api/generate/route.ts (PR description generation)

- Authentication and providers
  - Linear oAuth for authentication
  - UI/theme via Tailwind CSS and Radix-based UI components in components/ui/.
  - Global providers in components/providers/ (convex-provider.tsx, theme-provider.tsx).

- Feature areas and components
  - Generate PR: components/generate-pr/* (Linear OAuth/connect, issue selection, generation flow, PRDescription rendering).
  - Settings: components/settings/* (GitHub App connection, repository management, tokens).
  - Team Management: components/team-management/* (CRUD dialogs, actions, table interactions).
  - Waitlist: components/waitlist/* (Clerk allowlist status and table).

- Back-end/data layer
  - Convex functions and schema in convex/.
    - convex/schema.ts defines core tables: teamMembers, apiTokens, repositories, githubLinearMappings, githubPrMappings, webhookEvents with relevant indices.
    - convex/*.ts implements server-side operations (e.g., repositories.ts, teamMembers.ts, apiTokens.ts).
  - Server Actions in lib/actions/ (Next.js “use server”):
    - waitlistActions.ts communicates with BACKEND_HOST (requires ADMIN_API_KEY), revalidates relevant paths.
    - clerkAllowlistActions.ts integrates with Clerk server SDK for allowlist management.
    - checkLinearAuth.ts reads Linear OAuth token from cookies.

- External integrations
  - OpenAI via ai-sdk (app/api/generate/route.ts) to generate PR descriptions from Linear Issue data using OPENAI_API_KEY.
  - Linear via @linear/sdk for issue data and OAuth (frontend flow/components).
  - GitHub:
    - lib/github-api.ts wraps REST calls (user, repos, webhooks, branches, issues, PRs, labels, milestones). Uses either OAuth token (cookie github_access_token) or a GitHub App installation token.
    - lib/github-app.ts manages GitHub App auth via @octokit/auth-app and @octokit/rest. Requires GITHUB_APP_ID and GITHUB_APP_PRIVATE_KEY (plus optional client ID/secret). Provides installation discovery and repo-scoped client acquisition.

- Styling and build
  - Tailwind configured in tailwind.config.ts and postcss.config.mjs.
  - ESLint configured in eslint.config.mjs (flat config). Scripts: lint, lint:fix.
  - TypeScript strict config; path alias @/* to project root.

Operational notes for Warp
- Use Bun for all script execution (Node isn’t required in this environment). Prefer `bun run <script>`.
- Ensure .env.local is present with required variables before running dev or calling API routes (PR generation, waitlist actions, and GitHub App/Clerk flows depend on them).
- Convex access uses environment-provided URLs (CONVEX_DEPLOYMENT, NEXT_PUBLIC_CONVEX_URL). There is no local Convex dev script in package.json.

References from repository files
- package.json scripts: dev (next dev --turbopack), build (next build), start (next start), lint, lint:fix.
- app/api/generate/route.ts contains the OpenAI-driven PR generation flow using ai-sdk and @linear/sdk inputs.
- convex/schema.ts defines core data model for team members, repositories, and GitHub/Linear mappings.
