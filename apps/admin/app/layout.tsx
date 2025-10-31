import type {Metadata} from 'next'
import {Geist, Geist_Mono} from 'next/font/google'
import './globals.css'
import ThemeProvider from '@/components/providers/theme-provider'
import {ConvexClientProvider} from '@/components/providers/convex-provider'
import MainSidebar from '@/components/MainSidebar'
import {SidebarProvider} from '@/components/ui/sidebar'
import {cookies} from 'next/headers'
import LoginScreen from '@/components/auth/LoginScreen'
import {Toaster} from 'sonner'

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin']
})

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin']
})

export const metadata: Metadata = {
	title: 'Letraz Admin',
	description: 'Manage and control all sorts of internal operation of Letraz'
}

const RootLayout = async ({
	children
}: Readonly<{
	children: React.ReactNode;
}>) => {
	const cookieStore = await cookies()
	const token = cookieStore.get('linear_access_token')
	const isAuthenticated = Boolean(token)

	return (
		<html lang="en" suppressHydrationWarning>
			<body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
				<ConvexClientProvider>
					<ThemeProvider
						attribute="class"
						defaultTheme="system"
						enableSystem
						disableTransitionOnChange
					>
						{isAuthenticated ? (
							<SidebarProvider>
								<MainSidebar />
								<main className="bg-sidebar w-full p-1.5">
									<div className="relative h-full w-full bg-background rounded-lg p-4 overflow-y-auto">
										{children}
									</div>
								</main>
							</SidebarProvider>
						) : (
							<div className="min-h-screen grid place-items-center bg-neutral-50/50 dark:bg-neutral-950/50">
								<LoginScreen />
							</div>
						)}
					</ThemeProvider>
				</ConvexClientProvider>
				<Toaster />
			</body>
		</html>
	)
}

export default RootLayout
