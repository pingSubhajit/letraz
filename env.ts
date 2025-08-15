import {z} from 'zod'

/**
 * Schema for environment variables validation using Zod.
 */
const envSchema = z.object({
	// Optional environment variable for Vercel environment
	VERCEL_ENV: z.enum(['development', 'production', 'preview'], {
		errorMap: () => ({message: 'Environment must be either "development", "preview" or "production"'})
	}).optional().default('development'),

	// Optional main URL, must be a valid URL
	MAIN_URL: z.string().url({
		message: 'MAIN_URL must be a valid URL (e.g., http://localhost:3000)'
	}).optional().default('http://localhost:3000'),

	// Required backend API URL, must be a valid URL
	API_URL: z.string().url({
		message: 'API_URL must be a valid URL'
	}),

	// Required Clerk publishable key, must start with "pk_"
	NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().startsWith('pk_', {
		message: 'Clerk publishable key must start with "pk_"'
	}),

	// Required Clerk secret key, must start with "sk_"
	CLERK_SECRET_KEY: z.string().startsWith('sk_', {
		message: 'Clerk secret key must start with "sk_"'
	}),

	// Required Clerk sign-in URL, must start with "/"
	NEXT_PUBLIC_CLERK_SIGN_IN_URL: z.string().startsWith('/', {
		message: 'Sign in URL must start with "/" (e.g., /signin)'
	}),

	// Required Clerk sign-up URL, must start with "/"
	NEXT_PUBLIC_CLERK_SIGN_UP_URL: z.string().startsWith('/', {
		message: 'Sign up URL must start with "/" (e.g., /signup)'
	}),

	// Required Resend API key, must start with "re_"
	RESEND_API_KEY: z.string().startsWith('re_', {
		message: 'Resend API key must start with "re_"'
	}),

	// Required Anthropic API key, must start with "sk-ant-api03-"
	ANTHROPIC_API_KEY: z.string().startsWith('sk-ant-api03-', {
		message: 'Anthropic API key must start with "sk-ant-api03-"'
	}),

	// Required Ghost CMS API key
	GHOST_API_KEY: z.string({
		message: 'Ghost API key must be a string'
	}),

	// Required PostHog key, must start with "phc_"
	NEXT_PUBLIC_POSTHOG_KEY: z.string().startsWith('phc_', {
		message: 'PostHog key must start with "phc_"'
	}),

	// Required PostHog host URL, must be a valid URL
	NEXT_PUBLIC_POSTHOG_HOST: z.string().url({
		message: 'PostHog host must be a valid URL (e.g., https://us.i.posthog.com)'
	}),

	// Required Discord bot token
	DISCORD_BOT_TOKEN: z.string({
		required_error: 'Discord bot token is required',
		invalid_type_error: 'Discord bot token must be a string'
	}),

	// Optional Sentry auth token, must start with "sntrys_"
	SENTRY_AUTH_TOKEN: z.string()
		.regex(/^sntrys_.*/, {
			message: 'Sentry auth token must start with "sntrys_"'
		})
		.optional(),

	// Required Sentry DSN, must be a valid URL and match specific format
	SENTRY_DSN: z.string()
		.url({message: 'SENTRY_DSN must be a valid URL'})
		.regex(/^https:\/\/[a-zA-Z0-9]+@[a-zA-Z0-9]+\.ingest\.(us|uk)\.sentry\.io\/[0-9]+$/, {
			message: 'Invalid Sentry DSN format'
		})
		.transform(url => url.toString()),

	// Required Knock public API key for client-side usage
	NEXT_PUBLIC_KNOCK_PUBLIC_API_KEY: z.string({
		required_error: 'Knock public API key is required',
		invalid_type_error: 'Knock public API key must be a string'
	}),

	// Required Knock feed channel ID
	NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID: z.string({
		required_error: 'Knock feed channel ID is required',
		invalid_type_error: 'Knock feed channel ID must be a string'
	}),

	// Required backend admin API key for accessing admin endpoints
	BACKEND_ADMIN_API_KEY: z.string({
		required_error: 'Backend admin API key is required',
		invalid_type_error: 'Backend admin API key must be a string'
	}),

	// Required self secret key for API route authentication
	SELF_SECRET_KEY: z.string({
		required_error: 'Self secret key is required',
		invalid_type_error: 'Self secret key must be a string'
	}),

	// Required Gemini API key for Vercel AI SDK
	GOOGLE_GENERATIVE_AI_API_KEY: z.string({
		required_error: 'Gemini API key is required',
		invalid_type_error: 'Gemini API key must be a string'
	}),

	// Optional feature flag for Resume Editor tabs new design
	NEXT_PUBLIC_RESUME_EDITOR_TABS_NEW_DESIGN_ENABLED: z.string()
		.optional()
		.default('true')
  ,

  // Optional Algolia search configuration for client-side search
  NEXT_PUBLIC_ALGOLIA_APPLICATION_ID: z.string()
    .optional(),
  NEXT_PUBLIC_ALGOLIA_SEARCH_ONLY_API_KEY: z.string()
    .optional(),
  NEXT_PUBLIC_ALGOLIA_INDEX_NAME: z.string()
    .optional()
})


// Type representing the environment variables schema.
type Env = z.infer<typeof envSchema>


/**
 * Validates the environment variables against the schema.
 * @returns {Env} - The validated environment variables.
 * @throws {Error} - Throws an error if validation fails.
 */
const validateEnv = (): Env => {
	try {
		return envSchema.parse(process.env)
	} catch (error) {
		if (error instanceof z.ZodError) {
			const errorMessages = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join('\n')
			throw new Error(`❌ Invalid environment variables:\n${errorMessages}`)
		}
		throw error
	}
}

declare global {
	namespace NodeJS {
		 // Extends the Node.js ProcessEnv interface with the environment variables schema.
		interface ProcessEnv extends z.infer<typeof envSchema> {}
	}
}

export {validateEnv, envSchema}
