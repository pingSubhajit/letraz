import {ClearAllDatabasesResponse} from '@/services/admin/interface'
import log from 'encore.dev/log'
import {core, identity, job, resume} from '~encore/clients'

export const AdminService = {
	/**
	 * Clear all databases across all services
	 * Excludes waitlist and countries tables from core service
	 *
	 * This operation:
	 * 1. Calls clearDatabase on each service with a database
	 * 2. Aggregates results from all services
	 * 3. Returns summary of the operation
	 *
	 * WARNING: This is a destructive operation and cannot be undone
	 */
	clearAllDatabases: async (): Promise<ClearAllDatabasesResponse> => {
		log.info('Starting database clearing operation across all services')

		const clearedServices: string[] = []
		const timestamp = new Date().toISOString()

		try {
			// Clear core service database (except waitlist and countries)
			log.info('Clearing core service database...')
			await core.clearDatabase()
			clearedServices.push('core')

			// Clear identity service database
			log.info('Clearing identity service database...')
			await identity.clearDatabase()
			clearedServices.push('identity')

			// Clear job service database
			log.info('Clearing job service database...')
			await job.clearDatabase()
			clearedServices.push('job')

			// Clear resume service database
			log.info('Clearing resume service database...')
			await resume.clearDatabase()
			clearedServices.push('resume')

			log.info('Database clearing operation completed successfully', {
				cleared_services: clearedServices,
				timestamp
			})

			return {
				success: true,
				message: `Successfully cleared databases for ${clearedServices.length} services`,
				cleared_services: clearedServices,
				timestamp
			}
		} catch (error) {
			log.error(error as Error, 'Failed to clear databases', {
				cleared_services: clearedServices,
				timestamp
			})

			throw error
		}
	}
}

