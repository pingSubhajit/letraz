import {clerkMiddleware, createRouteMatcher} from '@clerk/nextjs/server'
import {NextResponse} from 'next/server'
import {OnboardingMetadata} from '@/lib/onboarding/types'

const isProtectedRoute = createRouteMatcher(['/app(.*)'])
const isOnboardingRoute = createRouteMatcher(['/app/onboarding(.*)'])

export default clerkMiddleware(async (auth, req) => {
	const {userId} = await auth()
	
	if (isProtectedRoute(req)) {
		await auth.protect()
		
		// Check onboarding state for authenticated users
		if (userId) {
			try {
				const {clerkClient} = await import('@clerk/nextjs/server')
				const client = await clerkClient()
				const user = await client.users.getUser(userId)
				const metadata = user.publicMetadata as OnboardingMetadata
				
				// If user is on onboarding page but has completed onboarding, redirect to main app
				if (isOnboardingRoute(req) && metadata.onboardingComplete) {
					return NextResponse.redirect(new URL('/app', req.url))
				}
				
				// If user is not on onboarding page but hasn't completed onboarding, redirect to current step
				if (!isOnboardingRoute(req) && !metadata.onboardingComplete) {
					const currentStep = metadata.currentOnboardingStep || 'welcome'
					return NextResponse.redirect(new URL(`/app/onboarding?step=${currentStep}`, req.url))
				}
			} catch (error) {
				console.error('Failed to fetch user metadata in middleware:', error)
				// If metadata fetch fails, allow normal flow
			}
		}
	}
})

export const config = {
	matcher: [
		// Skip Next.js internals and all static files, unless found in search params
		'/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
		// Always run for API routes
		'/(api|trpc)(.*)',
	],
}
