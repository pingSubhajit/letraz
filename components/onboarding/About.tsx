import TextAnimate from '@/components/animations/TextAnimations'
import {Button} from '@/components/ui/button'
import {ChevronLeft, ChevronRight} from 'lucide-react'
import {Link} from 'next-view-transitions'
import AboutDescription from '@/components/onboarding/AboutDescription'

const About = () => {
	return (
		<div className="w-full h-full flex flex-col justify-center items-center">
			{/* HEADING TEXT */}
			<div className="">
				<TextAnimate
					text="Here's"
					type="calmInUp"
					className="text-[5rem] leading-snug flex justify-center"
					{...({} as any)}
					/>
				<TextAnimate
					text="how it will work"
					type="calmInUp"
					className="text-[5rem] leading-snug flex justify-center"
					{...({} as any)}
					/>
			</div>

			{/* DESCRIPTION TEXT */}
			<AboutDescription />

			<div className="w-full flex items-center justify-between absolute left-1/2 -translate-x-1/2 bottom-16 px-16">
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

				{/* NEXT STEP BUTTON */}
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
