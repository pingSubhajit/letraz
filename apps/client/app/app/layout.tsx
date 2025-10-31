import {ReactNode} from 'react'
import type {Metadata} from 'next'
import {SidebarProvider} from '@/components/providers/SidebarProvider'
import AppLayoutContainer from '@/components/clientContainers/AppLayoutContainer'
import {cookies} from 'next/headers'
import {auth, clerkClient} from '@clerk/nextjs/server'
import {executeRizeBackfill} from '@/lib/rize/actions'
import {KnockProvider} from '@/components/providers/KnockProvider'

export const metadata: Metadata = {
	title: {
		default: 'Letraz — App',
		template: '%s — Letraz'
	},
	description: 'Your Letraz application workspace to craft and manage tailored resumes.'
}

const initiateRizeBackfill = async () => {
	try {
		const rizeCookie = (await cookies()).get('rize_ctx')
		if (rizeCookie) {
			const {userId, getToken} = await auth()
			if (userId) {
				try {
					const {integrate, userId: rizeUserId} = JSON.parse(rizeCookie.value || '{}') as {integrate?: string, userId?: string}
					if (integrate === 'rize' && rizeUserId) {
						const client = await clerkClient()
						const user = await client.users.getUser(userId)
						const pm = (user.privateMetadata as any) || {}

						const hasBackfill = typeof pm.rizeBackfill?.status === 'string'
						const isComplete = pm.rizeBackfill?.status === 'complete'
						const needsUserIdUpdate = pm.rizeUserId !== rizeUserId
						let justSetPending = false

						// Ensure metadata is set to pending synchronously and rizeUserId stored (first-time or user change)
						if (!hasBackfill || needsUserIdUpdate) {
							await client.users.updateUser(userId, {
								privateMetadata: {
									...pm,
									rizeUserId,
									rizeBackfill: {status: 'pending', startedAt: new Date().toISOString()}
								}
							})
							justSetPending = true
						}

						// Only schedule if not complete AND we just transitioned to pending in this request
						if (!isComplete && justSetPending) {
							const token = await getToken({template: 'LONGER_VALIDITY'})
							const authHeaders = token ? {Authorization: `Bearer ${token}`} : undefined
							await executeRizeBackfill(userId, rizeUserId, authHeaders)
						}
					}
				} catch {}
			}
		}
	} catch {}
}

const AppLayout = async ({children}: {children: ReactNode}) => {
	await initiateRizeBackfill()

	return (
		<KnockProvider>
			<SidebarProvider>
				<AppLayoutContainer>
					{children}
				</AppLayoutContainer>
			</SidebarProvider>
		</KnockProvider>
	)
}

export default AppLayout
