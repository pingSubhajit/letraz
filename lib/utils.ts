import {type ClassValue, clsx} from 'clsx'
import {twMerge} from 'tailwind-merge'

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs))

export const deepCopy = <T>(obj: T): T => JSON.parse(JSON.stringify(obj))

export const stripNullFields = <T extends Record<string, unknown>>(obj: T): Partial<T> => {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, value]) => value !== null)
  ) as Partial<T>;
}
