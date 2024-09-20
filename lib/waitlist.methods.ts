'use server'

import {db} from '@/db/drizzle'
import {waitlist, WaitlistInsert} from '@/db/schema'
import {Resend} from 'resend'
import WaitlistWelcomeEmail from '@/emails/welcome'
import {eq} from 'drizzle-orm'

const resend = new Resend(process.env.RESEND_API_KEY)

export const signUpForWaitlist = async (email: string, referrer?: any) => {
	const params = WaitlistInsert.parse({email, referrer})

	const existingSignUp = await db.query.waitlist.findFirst({
		where: eq(waitlist.email, params.email)
	})

	if (existingSignUp) return existingSignUp

	const newSignUp = db.insert(waitlist).values({
		email: params.email,
		referrer: params.referrer || 'website',
	}).returning()

	resend.emails.send({
		from: 'Letraz <hello@letraz.app>',
		to: params.email,
		subject: 'Welcome to Letraz waitlist!',
		react: WaitlistWelcomeEmail()
	})

	return newSignUp
}
