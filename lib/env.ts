import {z} from 'zod'

const envSchema = z.object({
	// Optional
	VERCEL_ENV: z.enum(['development', 'production'], {
		errorMap: () => ({message: 'Environment must be either "development" or "production"'})
	}).optional().default('development'),

	MAIN_URL: z.string().url({
		message: 'MAIN_URL must be a valid URL (e.g., http://localhost:3000)'
	}).optional().default('http://localhost:3000'),

	// Database
	DATABASE_URL: z.string().url({
		message: 'DATABASE_URL must be a valid PostgreSQL connection string'
	}),

	// Clerk Authentication
	NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().startsWith('pk_', {
		message: 'Clerk publishable key must start with "pk_"'
	}),

	CLERK_SECRET_KEY: z.string().startsWith('sk_', {
		message: 'Clerk secret key must start with "sk_"'
	}),

	NEXT_PUBLIC_CLERK_SIGN_IN_URL: z.string().startsWith('/', {
		message: 'Sign in URL must start with "/" (e.g., /signin)'
	}),

	NEXT_PUBLIC_CLERK_SIGN_UP_URL: z.string().startsWith('/', {
		message: 'Sign up URL must start with "/" (e.g., /signup)'
	}),

	// Email Service
	RESEND_API_KEY: z.string().startsWith('re_', {
		message: 'Resend API key must start with "re_"'
	}),

	// AI Service
	ANTHROPIC_API_KEY: z.string().startsWith('sk-ant-api03-', {
		message: 'Anthropic API key must start with "sk-ant-api03-"'
	}),

	// Ghost CMS
	GHOST_API_KEY: z.string({
		required_error: 'Ghost API key is required',
		invalid_type_error: 'Ghost API key must be a string'
	}),

	// PostHog Analytics
	NEXT_PUBLIC_POSTHOG_KEY: z.string().startsWith('phc_', {
		message: 'PostHog key must start with "phc_"'
	}),

	NEXT_PUBLIC_POSTHOG_HOST: z.string().url({
		message: 'PostHog host must be a valid URL (e.g., https://us.i.posthog.com)'
	})
})

// Create a type from the schema
type Env = z.infer<typeof envSchema>

// Validate environment variables
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

// Usage example
const env = validateEnv()

export {env, validateEnv, envSchema}
