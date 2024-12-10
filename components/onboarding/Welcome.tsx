import TextAnimate from '@/components/animations/TextAnimations'
import {PlayIcon} from '@heroicons/react/24/solid'
import {Button} from '@/components/ui/button'
import {ChevronRight} from 'lucide-react'
import {Link} from 'next-view-transitions'

const Welcome = () => {
	return (
		<div className="min-h-dvh">
			{/* HEADING TEXT */}
			<div className="absolute top-8 left-8">
				<TextAnimate
					text="Welcome"
					type="calmInUp"
					className="text-[5.5rem] leading-normal" {...({} as any)}
					// Framer-motion types are broken as of 22/10/2024
				/>
				<TextAnimate
					text="to the new way"
					type="calmInUp"
					className="text-[5.5rem] leading-normal" {...({} as any)}
					// Framer-motion types are broken as of 22/10/2024
				/>
				<TextAnimate
					text="of applying for jobs"
					type="calmInUp"
					className="text-[5.5rem] leading-normal" {...({} as any)}
					// Framer-motion types are broken as of 22/10/2024
				/>
			</div>

			{/* PLAY VIDEO BUTTON */}
			<button className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full p-6">
				<div className="absolute w-full h-full inset-0 bg-flame-500 animate-ping rounded-full"/>
				<div className="absolute w-full h-full inset-0 bg-flame-500 rounded-full"/>
				<PlayIcon className="w-8 h-8 fill-white z-10 relative"/>
			</button>

			{/* NEXT STEP BUTTON */}
			<Link href={'/app/onboarding?step=about'}>
				<Button
					className="absolute transition bottom-16 right-16 rounded-full shadow-lg hover:shadow-xl px-6"
					variant="secondary"
				>
					Begin journey
					<ChevronRight className="w-5 h-5 ml-1" />
				</Button>
			</Link>
		</div>
	)
}

export default Welcome
