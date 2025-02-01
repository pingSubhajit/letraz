export interface ApiError {
	uuid: string
	code: string
	message: string
	details: Record<string, unknown>
	extra: Record<string, unknown>
}

export interface ApiResponse<T> {
	data?: T
	error?: ApiError
}
