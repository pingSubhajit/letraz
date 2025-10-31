import 'dotenv/config'
import {defineConfig} from 'drizzle-kit'

/**
 * Drizzle configuration for job service migrations
 */
export default defineConfig({
	out: 'migrations',
	schema: 'schema.ts',
	dialect: 'postgresql'
})

