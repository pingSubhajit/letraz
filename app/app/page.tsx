import {UserButton} from '@clerk/nextjs'

const AppHome = () => {
	return (
		<div>
			<h1>Dashboard</h1>
			<p>Welcome to the dashboard page!</p>
			<UserButton />
		</div>
	)
}

export default AppHome
