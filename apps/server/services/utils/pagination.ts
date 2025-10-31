export interface PaginationParams {
	/** Page size (number of items per page). */
	page?: number
	/** 1-based page index. */
	page_size?: number
}

export interface PaginatedResponse<T> {
	/** Data object. */
	data: T[]
	/** Current page index. */
	page: number
	/** Page size used when fetching results. */
	page_size: number
	/** Total number of entries available. */
	total: number
	/** Whether there is a subsequent page. */
	has_next: boolean
	/** Whether there is a previous page. */
	has_prev: boolean
}


