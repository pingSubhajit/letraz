export const ACCEPTED_FILE_EXTENSIONS = ['.pdf', '.txt', '.doc', '.docx', '.rtf', '.odt'] as const

export const ACCEPTED_MIME_TYPES = [
	'application/pdf',
	'application/msword',
	'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
	'text/plain',
	'application/rtf',
	'application/vnd.oasis.opendocument.text'
] as const

export const ACCEPT_ATTRIBUTE = [...ACCEPTED_FILE_EXTENSIONS, ...ACCEPTED_MIME_TYPES].join(',')

export const ACCEPTED_LABEL = ACCEPTED_FILE_EXTENSIONS.join(', ')

export const isAcceptedByName = (fileName: string): boolean => {
	const lower = fileName.toLowerCase()
	return ACCEPTED_FILE_EXTENSIONS.some(ext => lower.endsWith(ext))
}

export const isAcceptedFile = (file: File): boolean => {
	return isAcceptedByName(file.name) || ACCEPTED_MIME_TYPES.includes(file.type as typeof ACCEPTED_MIME_TYPES[number])
}


