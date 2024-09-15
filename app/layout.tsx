import type {Metadata} from 'next'
import './globals.css'
import {ClerkProvider} from '@clerk/nextjs'
import {defaultUrl, modelica, portfolio} from '@/config'
import {Toaster} from '@/components/ui/sonner'

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
		{ rel: 'apple-touch-icon', url: 'logo.png' },
		{ rel: 'icon', url: 'logo.png' },
	],
	authors: [{ name: 'Subhajit Kundu', url: portfolio }]
}

export default function RootLayout({children}: Readonly<{ children: React.ReactNode }>) {
	return (
		<ClerkProvider>
			<html lang="en">
				<body className={modelica.className}>
					{children}
					<Toaster />
				</body>
			</html>
		</ClerkProvider>
	)
}
