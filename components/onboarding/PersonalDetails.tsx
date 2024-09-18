import PersonalDetailsForm from '@/components/onboarding/PersonalDetailsForm'
import TextAnimate from '@/components/animations/TextAnimations'

const PersonalDetails = () => {
	return (
		<div className="w-full h-full flex flex-col">
			{/* HEADING TEXT */}
			<div className="mt-72">
				<TextAnimate
					text="Let’s get to know you better"
					type="calmInUp"
					className="text-5xl leading-snug flex justify-center"
				/>
			</div>

			<PersonalDetailsForm />
		</div>
	)
}

export default PersonalDetails
