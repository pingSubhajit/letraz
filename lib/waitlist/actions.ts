'use server'

import {Resend} from 'resend'
import WaitlistWelcomeEmail from '@/emails/welcome'
import {WaitlistMutationSchema} from '@/lib/waitlist/types'
import * as Sentry from '@sentry/nextjs'

const resend = new Resend(process.env.RESEND_API_KEY)

export const signUpForWaitlist = async (email: string, referrer?: string | null) => {
	const params = WaitlistMutationSchema.parse({email, referrer})

	const response = await fetch(`${process.env.API_URL}/waitlist/`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			...params
		})
	})

	if (!response.ok) {
		return params
	}

	try {
		await resend.emails.send({
			from: 'Subhajit from Letraz <subhajit@letraz.app>',
			replyTo: 'Subhajit from Letraz <subhajit@letraz.app>',
			to: params.email,
			subject: 'Welcome to Letraz waitlist!',
			react: WaitlistWelcomeEmail()
		})
	} catch (error: any) {
		Sentry.captureException(error)
	}

	return WaitlistMutationSchema.parse(await response.json())
}
