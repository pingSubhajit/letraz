import {Suspense} from 'react'
import {Metadata} from 'next'
import Waitlist from '@/components/Waitlist'
import LandingPageHeading from '@/app/(website)/page.heading'
import LandingPageLogo from '@/app/(website)/page.logo'
import LandingPageDescription from '@/app/(website)/page.description'
import LandingPageFooter from '@/app/(website)/page-footer'
import LandingPageVideo from '@/app/(website)/page.video'
import LandingPageGradientShadows from '@/app/(website)/page.gradientShadows'
import {Button} from '@/components/ui/button'
import {Link} from 'next-view-transitions'

export const metadata: Metadata = {
	title: 'Letraz: Build Unique, ATS-Friendly Resumes in Minutes',
	description: 'Build tailored, ATS-friendly resumes with Letraz. Stand out with job-specific resumes that highlight your story and land interviews.',
	openGraph: {
		title: 'Letraz: Build Unique, ATS-Friendly Resumes in Minutes',
		description: 'Build tailored, ATS-friendly resumes with Letraz. Stand out with job-specific resumes that highlight your story and land interviews.',
		images: ['/banner.png'],
		url: 'https://letraz.app',
		siteName: 'Letraz',
		locale: 'en_US',
		type: 'website'
	},
	twitter: {
		card: 'summary_large_image',
		title: 'Letraz: Build Unique, ATS-Friendly Resumes in Minutes',
		description: 'Build tailored, ATS-friendly resumes with Letraz. Stand out with job-specific resumes that highlight your story.',
		images: ['/banner.png'],
		creator: '@letraz'
	},
	alternates: {
		canonical: 'https://letraz.app'
	}
}

const LandingPage = async (
	props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }
) => {
	const searchParams = await props.searchParams
	const referrer = searchParams.ref as string | undefined

	return (
		<main className="h-svh overflow-hidden flex flex-col lg:flex-row justify-stretch lg:justify-center items-stretch bg-white">
			<div className="flex flex-col justify-center items-start gap-8 p-8 lg:p-16 relative z-10">
				<LandingPageLogo className="relative z-30 mt-8 lg:mt-0" hideOnMobile={true} />
				<LandingPageHeading className="relative z-30" />
				<LandingPageDescription className="lg:py-2 relative z-30" />
				<Waitlist className="relative z-30" referrer={referrer} />

				<LandingPageFooter className="lg:absolute lg:bottom-16 z-30 lg:w-[calc(100%-128px)]" />

				<div className="absolute w-full h-full inset-0 bg-neutral-100 z-20 shadow-2xl" />

				{/* SIDEBAR GRADIENT SHADOWS */}
				<LandingPageGradientShadows />
			</div>

			<div className="w-full lg:w-[80%] h-svh flex justify-center items-center overflow-hidden relative">
				<Suspense fallback={<div className="w-full h-full bg-neutral-100 animate-pulse"/>}>
					<LandingPageVideo />
				</Suspense>

				<div className="lg:absolute lg:bottom-16 right-8 lg:right-16 z-30 lg:w-[calc(100%-128px)] flex justify-between items-center">
					<p>Closed beta starting soon</p>

					<nav>
						<Link href="/terms">
							<Button variant="link" className="pl-0  font-semibold">Terms of use</Button>
						</Link>

						<Link href="/privacy">
							<Button variant="link" className="pl-0  font-semibold">Privacy policy</Button>
						</Link>
					</nav>
				</div>
			</div>
		</main>
	)
}

export default LandingPage
