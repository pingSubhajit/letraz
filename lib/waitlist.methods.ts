'use server'

import {z} from 'zod'
import {GETWAITLIST} from '@/constants'

export const signUpForWaitlist = async (email: string, referralLink?: any) => {
	const parametersSchema = z.object({
		email: z.string().email(),
		referralLink: z.string().optional(),
	})

	const params = parametersSchema.parse({email, referralLink})
	const response = await (await fetch(`${GETWAITLIST}/signup`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			email: params.email,
			referral_link: params.referralLink,
			waitlist_id: process.env.WAITLIST_ID,
		}),
	})).json()

	if (response.error) {
		throw new Error(response.error)
	}

	return response
}
