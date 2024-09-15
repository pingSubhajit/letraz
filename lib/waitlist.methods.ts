'use server'

import {z} from 'zod'
import {db} from '@/db/drizzle'
import {waitlist} from '@/db/schema'
import {Resend} from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export const signUpForWaitlist = async (email: string, referralLink?: any) => {
	const parametersSchema = z.object({
		email: z.string().email(),
		referralLink: z.string().optional(),
	})

	const params = parametersSchema.parse({email, referralLink})
	const newSignUp = db.insert(waitlist).values({
		email: params.email,
		referralLink: params.referralLink,
	}).returning()

	await resend.emails.send({
		from: 'hello@letraz.app',
		to: params.email,
		subject: 'Welcome to Letraz!',
		html: '<p>Congrats on sending your <strong>first email</strong>!</p>'
	})

	return newSignUp
}
