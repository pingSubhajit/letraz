'use server'

import {z} from 'zod'

export const signUpForWaitlist = async (email: string, referralLink?: any) => {
	const parametersSchema = z.object({
		email: z.string().email(),
		referralLink: z.string().optional(),
	})

	const params = parametersSchema.parse({email, referralLink})
	console.log(params)
}
