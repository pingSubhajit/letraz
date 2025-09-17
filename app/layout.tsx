import type {Metadata} from 'next'
import './globals.css'
import 'lenis/dist/lenis.css'
import '@knocklabs/react/dist/index.css'
import {ClerkProvider} from '@clerk/nextjs'
import {defaultUrl, modelica, plusJakartaSans, portfolio} from '@/config'
import {Toaster} from '@/components/ui/sonner'
import {ViewTransitions} from 'next-view-transitions'
import PosthogProvider from '@/components/providers/PosthogProvider'
import {TooltipProvider} from '@/components/ui/tooltip'
import APIProvider from '@/components/providers/ApiProvider'
import {KnockProvider} from '@/components/providers/KnockProvider'
import SentryUserProvider from '@/components/providers/SentryUserProvider'
import {ReactNode} from 'react'

export const metadata: Metadata = {
	metadataBase: new URL(defaultUrl),
	title: {
		default: 'Letraz: Build Unique, ATS-Friendly Resumes in Minutes',
		template: '%s | Letraz'
	},
	description: 'Build tailored, ATS-friendly resumes with Letraz. Stand out with job-specific resumes that highlight your story and land interviews.',
	keywords: [
		'resume builder', 'ATS-friendly resumes', 'resume for job application', 'custom resume builder',
		'tailored resumes', 'job-seeking tool', 'resume optimizer', 'increase hiring chances'
	],
	openGraph: {
		type: 'website',
		siteName: 'Letraz',
		url: defaultUrl,
		locale: 'en_US'
	},
	twitter: {
		card: 'summary_large_image',
		site: '@letraz',
		creator: '@letraz'
	},
	alternates: {
		canonical: defaultUrl
	},
	generator: 'Next.js',
	icons: [
		{rel: 'apple-touch-icon', url: 'logo.png'},
		{rel: 'icon', url: 'logo.png'}
	],
	authors: [{name: 'Subhajit Kundu', url: portfolio}]
}

const RootLayout = ({children}: Readonly<{ children: ReactNode }>) => <ClerkProvider
	afterSignOutUrl="/"
>
	<ViewTransitions>
		<html lang="en">
			<PosthogProvider>
				<body className={`${modelica.className} ${plusJakartaSans.variable}`}>
					<SentryUserProvider>
						<APIProvider>
							<KnockProvider>
								<TooltipProvider>
									{children}
								</TooltipProvider>
								<Toaster richColors/>
							</KnockProvider>
						</APIProvider>
					</SentryUserProvider>
				</body>
			</PosthogProvider>
		</html>
	</ViewTransitions>
</ClerkProvider>


export default RootLayout
