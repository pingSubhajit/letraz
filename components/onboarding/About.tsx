import TextAnimate from '@/components/animations/TextAnimations'
import {Button} from '@/components/ui/button'
import {ChevronLeft, ChevronRight} from 'lucide-react'
import {Link} from 'next-view-transitions'
import AboutDescription from '@/components/onboarding/AboutDescription'
import {updateOnboardingStep} from '@/lib/onboarding/actions'

const About = () => {
	updateOnboardingStep('about')

	return (
		<div className="w-full h-full flex flex-col justify-center items-center">
			{/* HEADING TEXT */}
			<div className="pt-48">
				<TextAnimate
					text="Here's"
					type="calmInUp"
					className="text-[5rem] leading-snug flex justify-center"
				/>
				<TextAnimate
					text="how it will work"
					type="calmInUp"
					className="text-[5rem] leading-snug flex justify-center"
				/>
			</div>

			{/* DESCRIPTION TEXT */}
			<AboutDescription />

			<div
				className="w-[calc(100%-4.7rem)] flex items-center justify-between fixed left-[4.7rem] z-10 bottom-16 px-16"
			>
				{/* PREVIOUS STEP BUTTON */}
				<Link href={'/app/onboarding?step=welcome'}>
					<Button
						className="transition rounded-full shadow-lg hover:shadow-xl px-6"
						variant="secondary"
					>
						<ChevronLeft className="w-5 h-5 mr-1" />
						Watch video
					</Button>
				</Link>

				{/*	/!* NEXT STEP BUTTON *!/*/}
				<Link href={'/app/onboarding?step=personal-details'}>
					<Button
						className="transition rounded-full shadow-lg px-6 hover:shadow-xl"
						variant="secondary"
					>
						Sounds great
						<ChevronRight className="w-5 h-5 ml-1" />
					</Button>
				</Link>
			</div>
		</div>
	)
}

export default About
