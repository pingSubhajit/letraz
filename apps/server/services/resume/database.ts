import {SQLDatabase} from 'encore.dev/storage/sqldb'
import {drizzle} from 'drizzle-orm/node-postgres'
import * as schema from '@/services/resume/schema'

/**
 * Resume database instance with migrations configuration
 */
export const database = new SQLDatabase('resume', {
	migrations: {
		path: 'migrations',
		source: 'drizzle'
	}
})

/**
 * Drizzle ORM instance for type-safe database operations
 */
export const db = drizzle(database.connectionString, {schema})

