import TextAnimate from '@/components/animations/TextAnimations'
import {PlayIcon} from '@heroicons/react/24/solid'
import {Button} from '@/components/ui/button'
import {ChevronRight} from 'lucide-react'
import {Link} from 'next-view-transitions'
import {updateOnboardingStep} from '@/lib/onboarding/actions'

const Welcome = () => {
	updateOnboardingStep('welcome')

	return (
		<div className="min-h-dvh">
			{/* HEADING TEXT */}
			<div className="absolute top-8 left-4 sm:top-12 sm:left-12 lg:top-16 lg:left-16">
				<TextAnimate
					text="Welcome"
					type="calmInUp"
					className="text-4xl sm:text-5xl lg:text-7xl leading-relaxed pb-2" />
				<TextAnimate
					text="to the new way"
					type="calmInUp"
					className="text-4xl sm:text-5xl lg:text-7xl leading-relaxed pb-2" />
				<TextAnimate
					text="of applying for jobs"
					type="calmInUp"
					className="text-4xl sm:text-5xl lg:text-7xl leading-relaxed pb-2" />
			</div>

			{/* PLAY VIDEO BUTTON */}
			<button className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full p-3 sm:p-4 lg:p-6">
				<div className="absolute w-full h-full inset-0 bg-flame-500 animate-ping rounded-full"/>
				<div className="absolute w-full h-full inset-0 bg-flame-500 rounded-full"/>
				<PlayIcon className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 fill-white z-10 relative"/>
			</button>

			{/* NEXT STEP BUTTON */}
			<Link href={'/app/onboarding?step=about'} className="fixed bottom-4 right-4 sm:bottom-12 sm:right-12 lg:bottom-16 lg:right-16 z-50">
				<Button
					className="transition rounded-full shadow-lg hover:shadow-xl px-4 sm:px-5 lg:px-6"
					variant="secondary"
				>
					Begin journey
					<ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 ml-1" />
				</Button>
			</Link>
		</div>
	)
}

export default Welcome
