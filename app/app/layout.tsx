import {ReactNode} from 'react'
import type {Metadata} from 'next'
import {SidebarProvider} from '@/components/providers/SidebarProvider'
import AppLayoutContainer from '@/components/clientContainers/AppLayoutContainer'
import {cookies} from 'next/headers'
import {auth, clerkClient} from '@clerk/nextjs/server'
import {executeRizeBackfill} from '@/lib/rize/actions'

export const metadata: Metadata = {
	title: {
		default: 'Letraz — App',
		template: '%s — Letraz'
	},
	description: 'Your Letraz application workspace to craft and manage tailored resumes.'
}

const AppLayout = async ({children}: {children: ReactNode}) => {
	const {userId, getToken} = await auth()
	if (userId) {
		const cookieStore = await cookies()
		const rizeCookie = cookieStore.get('rize_ctx')
		if (rizeCookie) {
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
	return (
		<SidebarProvider>
			<AppLayoutContainer>
				{children}
			</AppLayoutContainer>
		</SidebarProvider>
	)
}

export default AppLayout
