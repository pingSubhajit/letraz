import TextAnimate from '@/components/animations/TextAnimations'
import {Button} from '@/components/ui/button'
import {ChevronLeft} from 'lucide-react'
import {Link} from 'next-view-transitions'
import AboutDescription from '@/components/onboarding/AboutDescription'
import {updateOnboardingStep} from '@/lib/onboarding/actions'
import AboutNextControl from '@/components/onboarding/AboutNextControl.client'

const About = () => {
	updateOnboardingStep('about')

	return (
		<div className="w-full h-full flex flex-col justify-center items-center">
			{/* HEADING TEXT */}
			<div className="pt-24 sm:pt-32 lg:pt-48 px-4">
				<TextAnimate
					text="Here's"
					type="calmInUp"
					className="text-4xl sm:text-5xl lg:text-7xl leading-relaxed flex justify-center"
				/>
				<TextAnimate
					text="how it will work"
					type="calmInUp"
					className="text-4xl sm:text-5xl lg:text-7xl leading-relaxed flex justify-center pb-2"
				/>
			</div>

			{/* DESCRIPTION TEXT */}
			<AboutDescription />

			<div
				className="w-full px-4 sm:px-8 lg:px-16 sm:w-[calc(100%-4.7rem)] flex items-center justify-between gap-3 fixed left-0 sm:left-[4.7rem] z-10 bottom-8 sm:bottom-12 lg:bottom-16"
			>
				{/* PREVIOUS STEP BUTTON */}
				<Link href={'/app/onboarding?step=welcome'}>
					<Button
						className="transition rounded-full shadow-lg hover:shadow-xl px-4 sm:px-5 lg:px-6"
						variant="secondary"
					>
						<ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-1" />
						Watch video
					</Button>
				</Link>

				{/* Client-only next/skip control */}
				<AboutNextControl />
			</div>
		</div>
	)
}

export default About
