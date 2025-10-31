import {SQLDatabase} from 'encore.dev/storage/sqldb'
import {drizzle} from 'drizzle-orm/node-postgres'
import * as schema from '@/services/job/schema'

/**
 * Job Database
 * SQLDatabase instance for the job service with Drizzle ORM
 */
export const database = new SQLDatabase('job', {
	migrations: {
		path: 'migrations',
		source: 'drizzle'
	}
})

// Initialize Drizzle ORM with the connection string
export const db = drizzle(database.connectionString, {schema})

