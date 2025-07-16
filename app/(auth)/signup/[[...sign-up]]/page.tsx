import {SignUp} from '@clerk/nextjs'

const Page = () => {
	return <SignUp fallbackRedirectUrl="/app" />
}

export default Page
