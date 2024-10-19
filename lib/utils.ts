import {type ClassValue, clsx} from 'clsx'
import {twMerge} from 'tailwind-merge'

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs))

export const deepCopy = <T>(obj: T): T => JSON.parse(JSON.stringify(obj))
