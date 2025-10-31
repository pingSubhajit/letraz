import {SQLDatabase} from 'encore.dev/storage/sqldb'
import {drizzle} from 'drizzle-orm/node-postgres'
import * as schema from '@/services/identity/schema'

/**
 * Identity Database
 * Stores user identity and authentication data
 */
export const identityDB = new SQLDatabase('identity', {
	migrations: {
		path: 'migrations',
		source: 'drizzle'
	}
})

/**
 * Drizzle ORM instance
 */
export const db = drizzle(identityDB.connectionString, {schema})

