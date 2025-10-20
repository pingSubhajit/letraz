import NextDynamic from 'next/dynamic'
import landingBg from '@/public/landing-bg.avif'
import Image from 'next/image'
import stacksLogo from '@/public/stacks-logo.svg'
import infosysLogo from '@/public/infosys-logo.svg'
import rizeLogo from '@/public/rize-logo-dark.svg'
import HeroHeader from './page.heroHeader'

const HeroVideoSequence = NextDynamic(() => import('@/app/(website)/landing/page.canvas'))
const LandingPageFeatures = NextDynamic(() => import('@/app/(website)/landing/page.features'))
const LandingPageProcess = NextDynamic(() => import('@/app/(website)/landing/page.process'))
const LandingPageFaq = NextDynamic(() => import('@/app/(website)/landing/page.faq'))

export const dynamic = 'force-static'
export const revalidate = 3600

const LandingPage = () => {

	return (
		<main className="relative overflow-x-clip">
			{/* Hero Section */}
			<div className="min-h-[300vh] sm:min-h-[400vh] lg:min-h-[530vh] relative">
				{/* Background image */}
				<Image
					src={landingBg}
					alt="Landing Page background image of a sunny landscape"
					className="sticky inset-0 w-full h-screen object-cover pointer-events-none"
					priority
					placeholder="blur"
					sizes="100vw"
				/>

				{/* Canvas sequence */}
				<HeroVideoSequence
					className="h-[30vh] mt-32 sm:mt-0 w-[95vw] sm:w-[90vw] sm:h-[46vh] md:w-[85vw] md:h-[50vh] lg:h-[85vh] lg:w-[70vw] absolute top-[330px] sm:top-[400px] lg:top-[500px] left-1/2 -translate-x-1/2 z-10 shadow-2xl"
				/>

                <HeroHeader />
			</div>

			<div className="pb-12 sm:pb-16 lg:pb-20 bg-[#0F0202]">
				<p className="text-center text-neutral-50 sm:pt-12 text-sm sm:text-base px-4">Trusted by people in</p>

				<div className="mt-4 sm:mt-6 flex justify-center items-center gap-4 sm:gap-6 lg:gap-8 mx-auto px-4">
					<Image src={stacksLogo} alt="Stacks logo" className="w-16 sm:w-20 lg:w-28" />
					<Image src={infosysLogo} alt="Infosys logo" className="w-16 sm:w-20 lg:w-28" />
					<Image src={rizeLogo} alt="Infosys logo" className="w-16 sm:w-20 lg:w-28" />
				</div>
			</div>

			{/* <div className="max-w-7xl mx-auto mt-3 lg:mt-8">*/}
			{/*	<video preload="auto" loop autoPlay muted playsInline className="w-full">*/}
			{/*		<source src="/letraz-engine.webm" type="video/webm" />*/}
			{/*		<source src="/letraz-engine.mp4" type="video/mp4" />*/}
			{/*	</video>*/}
			{/* </div>*/}

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
