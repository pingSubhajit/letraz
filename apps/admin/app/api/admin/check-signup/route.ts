import {NextRequest, NextResponse} from 'next/server'
import {clerkClient} from '@clerk/nextjs/server'

export const GET = async (request: NextRequest) => {
	try {
		// Extract admin API key from headers
		const adminApiKey = request.headers.get('x-admin-api-key')

		// Verify admin API key (using CLERK_SECRET_KEY as the admin key)
		if (!adminApiKey || adminApiKey !== process.env.CONSUMER_API_KEY) {
			return NextResponse.json(
				{error: 'Unauthorized: Invalid admin API key'},
				{status: 401}
			)
		}

		// Extract email from query parameters
		const {searchParams} = new URL(request.url)
		const email = searchParams.get('email')

		if (!email) {
			return NextResponse.json(
				{error: 'Missing required parameter: email'},
				{status: 400}
			)
		}

		try {
			/*
			 * Use Clerk's backend API to find user by email address
			 * getUserList with emailAddress filter returns users with matching emails
			 * Check if user has completed basic signup requirements
			 * Consider a user "signed up" if they have:
			 * 1. A verified email address OR phone number
			 * 2. Basic profile information (first/last name or username)
			 */
			const clerk = await clerkClient()
			const userListResponse = await clerk.users.getUserList({
				emailAddress: [email]
			})

			// Check if any users were found with this email
			if (userListResponse.data.length === 0) {
				return NextResponse.json({
					is_signed_up: false,
					email: email,
					user_found: false,
					message: 'No user found with this email address'
				})
			}

			// Get the first user (there should only be one user per email in most cases)
			const user = userListResponse.data[0]

			const hasVerifiedIdentity = user.emailAddresses.some(emailAddr => emailAddr.verification?.status === 'verified') ||
				user.phoneNumbers.some(phone => phone.verification?.status === 'verified')

			const hasBasicProfile = !!(user.firstName || user.lastName || user.username)

			const isSignedUp = hasVerifiedIdentity && hasBasicProfile

			return NextResponse.json({
				is_signed_up: isSignedUp,
				email: email,
				user_found: true,
				user_id: user.id,
				verified_email: user.emailAddresses.some(emailAddr => emailAddr.verification?.status === 'verified'),
				verified_phone: user.phoneNumbers.some(phone => phone.verification?.status === 'verified'),
				has_profile: hasBasicProfile,
				created_at: user.createdAt,
				last_sign_in_at: user.lastSignInAt,
				total_users_with_email: userListResponse.data.length
			})

		} catch (clerkError: any) {
			// Handle Clerk API errors
			throw clerkError
		}

	} catch (error: any) {
		return NextResponse.json(
			{
				error: 'Internal server error while checking user signup status',
				details: process.env.NODE_ENV === 'development' ? error.message : undefined
			},
			{status: 500}
		)
	}
}
