import type {Metadata} from 'next'
import './globals.css'
import 'lenis/dist/lenis.css'
import {ClerkProvider} from '@clerk/nextjs'
import {defaultUrl, modelica, portfolio} from '@/config'
import {Toaster} from '@/components/ui/sonner'
import {ViewTransitions} from 'next-view-transitions'
import PosthogProvider from '@/components/providers/PosthogProvider'

export const metadata: Metadata = {
	metadataBase: new URL(defaultUrl),
	keywords: [
		'resume builder', 'ATS-friendly resumes', 'resume for job application', 'custom resume builder',
		'tailored resumes', 'job-seeking tool', 'resume optimizer', 'increase hiring chances'
	],
	openGraph: {
		type: 'website'
	},
	generator: 'Next.js',
	icons: [
		{rel: 'apple-touch-icon', url: 'logo.png'},
		{rel: 'icon', url: 'logo.png'}
	],
	authors: [{name: 'Subhajit Kundu', url: portfolio}]
}

const RootLayout = ({children}: Readonly<{ children: React.ReactNode }>) => <ClerkProvider>
	<ViewTransitions>
		<html lang="en">
			<PosthogProvider>
				<body className={modelica.className}>
					{children}
					<Toaster/>
				</body>
			</PosthogProvider>
		</html>
	</ViewTransitions>
</ClerkProvider>


export default RootLayout
