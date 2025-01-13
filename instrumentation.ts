import {validateEnv} from '@/lib/env'
import {ZodIssue} from 'zod'

// Construct error messages from Zod issues
const constructEnvErrorMessages = (errors: ZodIssue[]): string[] => {
	return errors.map((error, idx) => {
		return `${idx + 1}) ${error.path.join('.')} : ${error.message}`
	})
}

// Register and validate environment variables at startup
export const register = async () => {
	const envValidationResult = validateEnv()

	if (envValidationResult.error) {
		const errorMessages = constructEnvErrorMessages(envValidationResult.error.errors)
		throw new Error(
			`\n\n❌ Error in loading environment variables:\n${errorMessages.join('\n')}\n` // TODO: This validation runs at startup, we need to fail the build at build time
		)
	}
}
