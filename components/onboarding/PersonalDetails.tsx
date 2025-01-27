import PersonalDetailsForm from '@/components/onboarding/PersonalDetailsForm'
import TextAnimate from '@/components/animations/TextAnimations'
import {currentUser} from '@clerk/nextjs/server'
import {getPersonalInfoFromDB} from '@/lib/personalInfo.methods'

const PersonalDetails = async () => {
	const user = await currentUser()
	const personalDetailsFromDB = await getPersonalInfoFromDB()

	return (
		<div className="w-full h-full flex flex-col">
			{/* HEADING TEXT */}
			<div className="mt-72">
				<TextAnimate
					text="Let’s get to know you better"
					type="calmInUp"
					className="text-5xl leading-snug flex justify-center" />
			</div>

			<PersonalDetailsForm defaultValues={{
				first_name: personalDetailsFromDB?.first_name || user?.firstName || '',
				last_name: personalDetailsFromDB?.last_name || user?.lastName || '',
				email: personalDetailsFromDB?.email || user?.emailAddresses[0].emailAddress || '',
				phone: personalDetailsFromDB?.phone || user?.primaryPhoneNumber?.phoneNumber || ''
			}} />
		</div>
	)
}

export default PersonalDetails
