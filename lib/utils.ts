import {type ClassValue, clsx} from 'clsx'
import {twMerge} from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

export function deepCopy<T>(obj: T): T {
	return JSON.parse(JSON.stringify(obj))
}
