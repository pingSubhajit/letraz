import {type ClassValue, clsx} from 'clsx'
import {twMerge} from 'tailwind-merge'

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs))

export const deepCopy = <T>(obj: T): T => JSON.parse(JSON.stringify(obj))

export const stripNullFields = (obj: Record<any, any>) => {
	for (const key in obj) {
		if (obj[key] === null) {
			delete obj[key]
		}
	}
	return obj
}
