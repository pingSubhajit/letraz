import {SQLDatabase} from 'encore.dev/storage/sqldb'
import {drizzle} from 'drizzle-orm/node-postgres'
import * as schema from '@/services/core/schema'

// Create SQLDatabase instance with migrations configuration
export const database = new SQLDatabase('core', {
	migrations: {
		path: 'migrations',
		source: 'drizzle'
	}
})

// Initialize Drizzle ORM with the connection string
export const db = drizzle(database.connectionString, {schema})
