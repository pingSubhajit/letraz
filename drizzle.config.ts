import {config} from 'dotenv'
import {defineConfig} from 'drizzle-kit'
import {env} from './lib/env'

config({path: '.env.local'})

export default defineConfig({
	schema: './db/schema.ts',
	out: './migrations',
	dialect: 'postgresql',
	dbCredentials: {
		url: env.DATABASE_URL!
	}
})
