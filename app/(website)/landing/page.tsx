import dynamic from 'next/dynamic'
import landingBg from '@/public/landing-bg.jpg'
import Image from 'next/image'
import stacksLogo from '@/public/stacks-logo.svg'
import infosysLogo from '@/public/infosys-logo.svg'
import rizeLogo from '@/public/rize-logo-dark.svg'
import HeroHeader from './page.heroHeader'

const HeroVideoSequence = dynamic(() => import('./page.canvas'))
const LandingPageFeatures = dynamic(() => import('@/app/(website)/landing/page.features'))
const LandingPageProcess = dynamic(() => import('@/app/(website)/landing/page.process'))
const LandingPageFaq = dynamic(() => import('@/app/(website)/landing/page.faq'))

const LandingPage = async (
	props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }
) => {
	const searchParams = await props.searchParams
	const referrer = searchParams.ref as string | undefined

	return (
		<main className="relative overflow-x-clip bg-white">
			{/* Hero Section */}
			<div className="min-h-[530vh] relative">
				{/* Background image */}
				<Image
					src={landingBg}
					alt="Landing Page background image of a sunny landscape"
					className="sticky inset-0 w-full object-cover pointer-events-none"
					priority
					placeholder="blur"
					sizes="100vw"
				/>

				{/* Canvas sequence */}
				<HeroVideoSequence
					className="h-[75vh] w-[75vw] absolute top-[500px] left-1/2 -translate-x-1/2 z-10 shadow-2xl"
				/>

				<HeroHeader referrer={referrer} />
			</div>

			<div className="pb-20 bg-[#0F0202]">
				<p className="text-center text-neutral-50">Trusted by people in</p>

				<div className="mt-6 flex justify-center items-center gap-8 mx-auto">
					<Image src={stacksLogo} alt="Stacks logo" className="w-28" />
					<Image src={infosysLogo} alt="Infosys logo" className="w-28" />
					<Image src={rizeLogo} alt="Infosys logo" className="w-28" />
				</div>
			</div>

			<div className="max-w-7xl mx-auto mt-3 lg:mt-8">
				<video preload="auto" loop autoPlay muted playsInline className="w-full">
					<source src="/letraz-engine.webm" type="video/webm" />
					<source src="/letraz-engine.mp4" type="video/mp4" />
				</video>
			</div>

			<div>
				<LandingPageProcess />
			</div>

			<div className="mt-32 max-w-7xl mx-auto">
				<LandingPageFeatures />
			</div>

			<div className="mt-32 max-w-7xl mx-auto">
				<LandingPageFaq />
			</div>
		</main>
	)
}

export default LandingPage
