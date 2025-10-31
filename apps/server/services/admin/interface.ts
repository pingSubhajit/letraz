/**
 * Clear All Databases Response
 * Returns summary of database clearing operation
 */
export interface ClearAllDatabasesResponse {
	success: boolean
	message: string
	cleared_services: string[]
	timestamp: string
}

