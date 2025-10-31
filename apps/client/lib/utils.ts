import {type ClassValue, clsx} from 'clsx'
import {twMerge} from 'tailwind-merge'
import DOMPurify from 'dompurify'
import * as sanitizeAndCleanupHtml from 'sanitize-html'

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs))

export const deepCopy = <T>(obj: T): T => JSON.parse(JSON.stringify(obj))

export const stripNullFields = <T extends Record<string, unknown>>(obj: T): Partial<T> => {
	return Object.fromEntries(
		Object.entries(obj).filter(([_, value]) => value !== null)
	) as Partial<T>
}

// utils/date-transformations.ts
export const dateToApiFormat = (date: Date | null | undefined): string | null => {
	return date ?
		`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
		: null
}

export const apiDateToDate = (dateString: string | null | undefined): Date | null => {
	return dateString ? new Date(dateString) : null
}

// Safe HTML sanitization function
export const sanitizeHtml = (html: string): string => {
	// Check if we're in browser environment
	if (typeof window !== 'undefined') {
		return DOMPurify.sanitize(html, {
			ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'ul', 'ol', 'li', 'a'],
			ALLOWED_ATTR: ['href', 'target', 'rel']
		})
	} else {
		return sanitizeAndCleanupHtml.default(html, {
			allowedTags: sanitizeAndCleanupHtml.default.defaults.allowedTags.concat([
				'img',
				'video',
				'h1',
				'h2',
				'h3',
				'h4',
				'h5',
				'h6',
				'pre',
				'code',
				'span'
			]),
			allowedAttributes: {
				'*': ['id', 'class', 'style'],
				a: ['href', 'name', 'target', 'rel'],
				img: ['src', 'alt', 'title', 'width', 'height', 'loading', 'decoding'],
				video: ['src', 'controls', 'autoplay', 'loop', 'muted', 'playsinline', 'poster', 'width', 'height'],
				code: ['class']
			},
			allowedSchemesByTag: {
				img: ['http', 'https', 'data'],
				video: ['http', 'https']
			}
		})
	}
}
